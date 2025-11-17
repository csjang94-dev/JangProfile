# iam_oidc.tf

# 1. AWS Caller Identity 데이터 소스 (현재 계정 ID 획득)
data "aws_caller_identity" "current" {}

# 2. GitHub OIDC Provider (AWS에 이미 등록되어 있다고 가정)
data "aws_iam_openid_connect_provider" "github" {
  # OIDC Provider ARN은 현재 AWS 계정 ID를 사용하여 구성됩니다.
  arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

# 3. GitHub Actions가 Assume Role 할 수 있는 신뢰 정책 (공통 부분)
# 이 정책은 모든 GitHub Actions 워크플로우 실행이 'sts.amazonaws.com' Audience를 사용하는지 확인합니다.
data "aws_iam_policy_document" "github_assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }
    
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

# iam_oidc.tf 파일 수정

# 4. Dev 환경 배포용 IAM Role 수정
resource "aws_iam_role" "github_actions_dev_role" {
  name = "github-actions-dev-deployer-role"

  # 🚨 [수정]: MalformedPolicyDocument 오류 해결을 위한 표준 방식 적용
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # 기존 정책 문서를 jsondecode로 변환하고 Statement 배열을 가져옴
      for s in jsondecode(data.aws_iam_policy_document.github_assume_role_policy.json).Statement : {
        Effect    = s.Effect
        Action    = s.Action
        Principal = s.Principal
        # 기존 Condition에 StringLike 조건을 추가하여 병합
        Condition = merge(s.Condition, {
          "StringLike" = {
            "token.actions.githubusercontent.com:sub" = "repo:csjang94-dev/examforge-gjjang:ref:refs/heads/dev"
          }
        })
      }
    ]
  })
}

# 5. Prd 환경 배포용 IAM Role 수정
resource "aws_iam_role" "github_actions_prd_role" {
  name = "github-actions-prd-deployer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      for s in jsondecode(data.aws_iam_policy_document.github_assume_role_policy.json).Statement : {
        Effect    = s.Effect
        Action    = s.Action
        Principal = s.Principal
        Condition = merge(s.Condition, {
          "StringLike" = {
            "token.actions.githubusercontent.com:sub" = "repo:csjang94-dev/examforge-gjjang:ref:refs/heads/prd"
          }
        })
      }
    ]
  })
}

# 6. Dev Role에 AWS 관리형 정책 연결 (ECS/ECR 권한)
resource "aws_iam_role_policy_attachment" "dev_ecr" {
  role       = aws_iam_role.github_actions_dev_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

resource "aws_iam_role_policy_attachment" "dev_ecs" {
  role       = aws_iam_role.github_actions_dev_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
}

# 7. Prd Role에 AWS 관리형 정책 연결 (ECS/ECR 권한)
resource "aws_iam_role_policy_attachment" "prd_ecr" {
  role       = aws_iam_role.github_actions_prd_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

resource "aws_iam_role_policy_attachment" "prd_ecs" {
  role       = aws_iam_role.github_actions_prd_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
}

# 8. Output 정의 (GitHub Actions에서 Assume Role ARN을 사용하기 위함)
output "dev_role_arn" {
  description = "The ARN for the Dev deployer IAM Role."
  value       = aws_iam_role.github_actions_dev_role.arn
}

output "prd_role_arn" {
  description = "The ARN for the Prd deployer IAM Role."
  value       = aws_iam_role.github_actions_prd_role.arn
}