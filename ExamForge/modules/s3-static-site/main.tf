# data: S3 웹사이트 정책 정의 (퍼블릭 읽기 허용)
data "aws_iam_policy_document" "frontend_policy" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = [
      "s3:GetObject"
    ]
    resources = [
      # 객체에 대한 읽기 권한 부여 (필수)
      "${aws_s3_bucket.frontend_bucket.arn}/*" 
    ]
  }
}

## 1. 프론트엔드 S3 버킷
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "${var.project_name}-frontend-${var.environment}"

  tags = {
    Name = "${var.project_name}-frontend-${var.environment}"
  }
}

## 2. S3 버킷 Public Access Block 해제 (정적 호스팅 필수)
# Public Read를 허용하기 위해 모든 블록을 false로 설정해야 합니다.
resource "aws_s3_bucket_public_access_block" "frontend_public_access" {
  bucket                  = aws_s3_bucket.frontend_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

## 3. S3 버킷 정책 적용
resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  policy = data.aws_iam_policy_document.frontend_policy.json
}

## 4. S3 버킷 정적 웹사이트 호스팅 활성화
resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    # SPA를 고려하여 error.html 대신 index.html로 설정합니다.
    key = "index.html" 
  }
}

