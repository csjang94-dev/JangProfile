# ============================
# outputs.tf (수정 완료 버전)
# ============================

# 1. GitHub Actions Secrets용 (OIDC Role ARN)
output "github_actions_dev_role_arn" {
  description = "The ARN of the IAM Role for GitHub Actions (Dev)"
  value       = aws_iam_role.github_actions_dev_role.arn
}

output "github_actions_prd_role_arn" {
  description = "The ARN of the IAM Role for GitHub Actions (Prod)"
  value       = aws_iam_role.github_actions_prd_role.arn
}

# 2. CI/CD 파이프라인용 ECR URL
output "dev_ecr_repository_url" {
  description = "The ECR repository URL for the Dev environment"
  value       = length(module.dev_ecs) > 0 ? module.dev_ecs[0].ecr_repository_url : ""
}

output "prd_ecr_repository_url" {
  description = "The ECR repository URL for the Prod environment"
  value       = length(module.prd_ecs) > 0 ? module.prd_ecs[0].ecr_repository_url : ""
}

# 3. 서비스 접근용 ALB DNS
output "dev_alb_dns_name" {
  description = "The DNS name of the Dev ALB"
  value       = length(module.dev_ecs) > 0 ? module.dev_ecs[0].alb_dns_name : ""
}

output "prd_alb_dns_name" {
  description = "The DNS name of the Prod ALB"
  value       = length(module.prd_ecs) > 0 ? module.prd_ecs[0].alb_dns_name : ""
}

# 4. 정적 웹사이트 엔드포인트
output "static_site_website_endpoint" {
  description = "The website endpoint for the S3 static site"
  value       = module.static_site.website_endpoint
}
