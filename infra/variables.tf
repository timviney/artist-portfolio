variable "aws_region" {
  description = "AWS region hosting the site bucket and CloudFront."
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Short project slug used to name every resource."
  type        = string
  default     = "artist-portfolio"
}

variable "github_repo" {
  description = "GitHub repository allowed to assume the deploy role (owner/name)."
  type        = string
  default     = "timviney/artist-portfolio"
}

locals {
  name_prefix = "${var.project_name}-site"
}
