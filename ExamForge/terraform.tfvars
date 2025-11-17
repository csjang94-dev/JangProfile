# AWS 계정 ID
aws_account_id = "140023399909"

# Terraform 상태 관리를 위한 S3 버킷 이름
tf_backend_bucket_name = "my-quiz-project-tfstate-2025"

# 프로젝트 이름 및 환경
project_name = "examforge"
environment  = "dev"

# 🚨 [필수 수정]: 최소 2개 이상의 AZ를 리스트 형태로 지정
availability_zones = [
  "ap-northeast-2a",
  "ap-northeast-2c"
]

# 💡 AZ 개수(2개)에 맞춰 Public Subnet CIDR도 2개 지정
public_subnet_cidrs = [
  "10.0.1.0/24",
  "10.0.2.0/24"
]

# 💡 AZ 개수(2개)에 맞춰 Private Subnet CIDR도 2개 지정
private_subnet_cidrs = [
  "10.0.101.0/24",
  "10.0.102.0/24"
]

# VPC CIDR
vpc_cidr = "10.0.0.0/16"
