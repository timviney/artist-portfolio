output "bucket_name" {
  description = "S3 bucket the built site is synced to."
  value       = aws_s3_bucket.site.id
}

output "distribution_id" {
  description = "CloudFront distribution ID to invalidate after deploys."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain" {
  description = "CloudFront domain serving the site."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "distribution_url" {
  description = "Public site URL."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "deploy_role_arn" {
  description = "IAM role GitHub Actions assumes to deploy (store as a repo secret/variable)."
  value       = aws_iam_role.deploy.arn
}

output "name_servers" {
  description = "Route53 nameservers to set at the domain registrar (Spaceship)."
  value       = aws_route53_zone.site.name_servers
}

output "domain_url" {
  description = "Custom domain URL (live once nameserver delegation propagates)."
  value       = "https://${var.domain_name}"
}
