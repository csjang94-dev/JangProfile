# 1. DynamoDB 접근을 위한 ECS Task Policy 정의
resource "aws_iam_policy" "ecs_dynamodb_access" {
  name        = "ECSDynamoDBAccessPolicy-ExamForge"
  description = "Allows ECS Tasks to read/write to specific DynamoDB tables"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ],
        Effect = "Allow",
        # ✅ 수정 1: count → length 로 변경
        Resource = compact([
          aws_dynamodb_table.user_data_dev[0].arn,
          length(aws_dynamodb_table.user_data_prd) > 0 ? aws_dynamodb_table.user_data_prd[0].arn : "",
        ])
      },
      {
        Action  = "dynamodb:DescribeTable",
        Effect  = "Allow",
        # ✅ 수정 2: 동일하게 length() 적용
        Resource = compact([
          aws_dynamodb_table.user_data_dev[0].arn,
          length(aws_dynamodb_table.user_data_prd) > 0 ? aws_dynamodb_table.user_data_prd[0].arn : "",
        ])
      }
    ]
  })
}

# 2. Dev ECS Task Role 정의
resource "aws_iam_role" "dev_ecs_task_role" {
  name = "dev-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# 3. Prd ECS Task Role 정의
resource "aws_iam_role" "prd_ecs_task_role" {
  name = "prd-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# 4. Dev/Prd Task Role에 DynamoDB 접근 정책 연결
resource "aws_iam_role_policy_attachment" "dev_dynamodb_attach" {
  role       = aws_iam_role.dev_ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_dynamodb_access.arn
}

resource "aws_iam_role_policy_attachment" "prd_dynamodb_attach" {
  count      = var.environment == "prd" ? 1 : 0
  role       = aws_iam_role.prd_ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_dynamodb_access.arn
}
