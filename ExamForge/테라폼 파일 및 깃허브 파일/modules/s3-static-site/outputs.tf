# modules/s3-static-site/outputs.tf 파일 수정

output "bucket_id" {
  description = "The ID of the S3 bucket."
  # 수정 전: aws_s3_bucket.site.id
  value       = aws_s3_bucket.frontend_bucket.id 
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket."
  # 수정 전: aws_s3_bucket.site.arn
  value       = aws_s3_bucket.frontend_bucket.arn
}

output "website_endpoint" {
  description = "The website endpoint of the S3 bucket."
  # 수정 전: aws_s3_bucket_website_configuration.site_website.website_endpoint
  value       = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}