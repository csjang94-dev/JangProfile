# Dev 환경 DynamoDB 테이블
resource "aws_dynamodb_table" "user_data_dev" {
  # 🚨 [수정]: environment가 dev일 때만 1, 아니면 0
  count = var.environment == "dev" ? 1 : 0

  name         = "User-Data-Dev"
  billing_mode = "PAY_PER_REQUEST" # 서버리스 방식으로 비용 효율적
  hash_key     = "UserID"
  
  attribute {
    name = "UserID"
    type = "S"
  }
  
  tags = {
    Environment = "dev"
  }
}

# Prd 환경 DynamoDB 테이블
resource "aws_dynamodb_table" "user_data_prd" {
  # 🚨 [수정]: environment가 prd일 때만 1, 아니면 0
  count = var.environment == "prd" ? 1 : 0

  name           = "prd-user-data"
  hash_key       = "UserId"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5

  attribute {
    name = "UserId"
    type = "S"
  }
  
  tags = {
    Environment = "prd"
  }
}