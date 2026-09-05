resource "aws_cloudfront_origin_access_control" "site" {
  name                              = local.name_prefix
  description                       = "S3 origin access for ${var.project_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${local.name_prefix}-security-headers"

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "SAMEORIGIN"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      override                   = true
      preload                    = false
    }
  }
}

# The SPA fallback below serves the app shell for any missing key, but S3 has
# no notion of a "directory index", so /admin/ would also fall through to the
# app shell and never reach the Sveltia CMS page. This viewer-request function
# handles both edge rewrites: redirect www -> apex (301) and serve
# /admin/index.html for /admin and /admin/. CloudFront allows only one
# function per cache behaviour per event type, so they share this function.
resource "aws_cloudfront_function" "admin_index" {
  name    = "${local.name_prefix}-admin-index"
  runtime = "cloudfront-js-2.0"
  comment = "Redirect www to apex; serve /admin/index.html for /admin and /admin/"
  code    = <<-EOF
    function handler(event) {
      var request = event.request;
      var host = request.headers.host.value;

      // Redirect www.maxpavlovsky.com to the bare domain (301). The query
      // string is deliberately dropped: request.querystring is a key/value
      // object in cloudfront-js-2.0 (not a string) and nothing in this SPA
      // reads query parameters.
      if (host === "www.${var.domain_name}") {
        return {
          statusCode: 301,
          statusDescription: "Moved Permanently",
          headers: { location: { value: "https://${var.domain_name}" + request.uri } }
        };
      }

      // S3 has no directory-index, so rewrite the admin entry points.
      var uri = request.uri;
      if (uri === "/admin" || uri === "/admin/") {
        request.uri = "/admin/index.html";
      }
      return request;
    }
  EOF
}

# Managed-CachingOptimized: caches GET/HEAD at the edge with gzip/brotli on.
locals {
  managed_cache_policy_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = var.project_name
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  depends_on = [aws_acm_certificate_validation.site]

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = local.name_prefix
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id       = local.name_prefix
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id            = local.managed_cache_policy_optimized
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.admin_index.arn
    }
  }

  # SPA fallback: unknown paths (and S3's 403 for missing keys) serve
  # index.html so vue-router can resolve client-side routes.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 60
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 60
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.site.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

data "aws_iam_policy_document" "site" {
  statement {
    sid       = "AllowCloudFrontRead"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site.json
}
