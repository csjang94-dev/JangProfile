variable "bucket_name" {
  description = "The globally unique name for the S3 static site bucket."
  type        = string
}

# modules/s3-static-site/variables.tf 파일에 추가

variable "project_name" {
  description = "The name of the project (e.g., examforge)."
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., dev or prd)."
  type        = string
}