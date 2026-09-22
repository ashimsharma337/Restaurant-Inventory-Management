# Lambda Service – CI/CD with AWS SAM + GitHub Actions (OIDC)

**Complete Guide + Cheat Sheet**  
Last updated: September 2026

---

## Table of Contents

1. [Cheat Sheet (Quick Reference)](#cheat-sheet-quick-reference)
2. [Full Explanation](#full-explanation)
3. [Folder Structure](#folder-structure)
4. [SAM Template](#sam-template)
5. [GitHub Actions Workflows](#github-actions-workflows)
6. [OIDC Authentication](#oidc-authentication)
7. [IAM Role & Permissions](#iam-role--permissions)
8. [Deployment Flow](#deployment-flow)
9. [CloudFormation Stacks](#cloudformation-stacks)
10. [Troubleshooting](#troubleshooting)
11. [Useful Commands](#useful-commands)

---

# Cheat Sheet (Quick Reference)

### What we built
- **CI**: Runs `pytest` on every change inside `lambda-service/`
- **CD**: Deploys to AWS Lambda when code is pushed to `main`
- **Tool**: AWS SAM
- **Auth**: OIDC (no long-lived Access Keys)

### Key Files
| File | Purpose |
|------|---------|
| `lambda-service/template.yaml` | Defines the Lambda function |
| `.github/workflows/lambda-service-ci.yml` | Runs tests |
| `.github/workflows/lambda-service-cd.yml` | Deploys to AWS |

### Important Values
| Item | Value |
|------|-------|
| GitHub Repo | `ashimsharma337/Restaurant-Inventory-Management` |
| IAM Role | `GitHubActions-LambdaDeploy` |
| Role ARN | `arn:aws:iam::960480102932:role/GitHubActions-LambdaDeploy` |
| AWS Region | `us-east-1` |
| Stack Name | `lambda-service` |
| Function Name | `lambda-service` |
| Code Location | `lambda-service/invoice-processor/` |
| Handler | `app.lambda_handler` |

### GitHub Secrets Required
| Secret Name | Value |
|-------------|-------|
| `AWS_ROLE_ARN` | `arn:aws:iam::960480102932:role/GitHubActions-LambdaDeploy` |
| `AWS_REGION` | `us-east-1` |

### How to Deploy
1. Make changes inside `lambda-service/`
2. Commit & push to `main`
3. GitHub Actions automatically runs CI + CD

### Quick Fix for Failed Deploy
1. Go to CloudFormation → `us-east-1`
2. Delete stack if status is `ROLLBACK_COMPLETE` or `CREATE_FAILED`
3. Re-run the GitHub Action

### SAM Commands (local)
```bash
sam build
sam deploy --stack-name lambda-service --capabilities CAPABILITY_IAM --resolve-s3
sam delete --stack-name lambda-service
```

---

# Full Explanation

## Overview

We created a modern CI/CD pipeline that:

1. Automatically runs tests when code changes in `lambda-service/`
2. Deploys the Lambda function to AWS when code is pushed to the `main` branch
3. Uses **AWS SAM** to define and deploy the infrastructure
4. Uses **OIDC** for secure authentication (no long-lived AWS Access Keys)

---

## What is AWS SAM?

**AWS SAM (Serverless Application Model)** is an open-source framework from AWS that simplifies building and deploying serverless applications.

### Why we used SAM
- You define the Lambda function in a simple `template.yaml` file
- SAM can **create** the function the first time and **update** it later
- It automatically packages your Python code
- It uses CloudFormation under the hood
- It is widely used in production environments

Without SAM, you would have to manually create the Lambda function in the AWS console and then update its code with `aws lambda update-function-code`. SAM handles the entire lifecycle.

---

## Folder Structure

```text
lambda-service/
├── template.yaml                 ← SAM template
├── invoice-processor/
│   ├── app.py                    ← Lambda code (handler)
│   └── tests/
│       └── test_app.py
├── events/
│   └── s3-event.json
└── README.md
```

**Important:**
- Actual code lives in `invoice-processor/app.py`
- SAM packages the contents of the `invoice-processor/` folder

---

## SAM Template

**File:** `lambda-service/template.yaml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Lambda Service - Invoice Processor

Globals:
  Function:
    Timeout: 30
    Runtime: python3.12
    Architectures:
      - x86_64
    MemorySize: 256

Resources:
  LambdaServiceFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: lambda-service
      CodeUri: invoice-processor/
      Handler: app.lambda_handler
      Description: Processes S3 upload events
      Environment:
        Variables:
          STAGE: !Ref Stage

Parameters:
  Stage:
    Type: String
    Default: prod

Outputs:
  LambdaFunctionName:
    Description: Name of the Lambda function
    Value: !Ref LambdaServiceFunction
  LambdaFunctionArn:
    Description: ARN of the Lambda function
    Value: !GetAtt LambdaServiceFunction.Arn
```

### Key fields explained

| Field | Meaning |
|-------|---------|
| `CodeUri: invoice-processor/` | Folder that contains the Lambda code |
| `Handler: app.lambda_handler` | File name + function name (`app.py` → `lambda_handler`) |
| `Runtime: python3.12` | Python version used by Lambda |
| `FunctionName` | Name of the function in AWS |

---

## GitHub Actions Workflows

### 1. CI Workflow (Testing)

**File:** `.github/workflows/lambda-service-ci.yml`

- Triggers on push and pull request when files inside `lambda-service/` change
- Sets up Python 3.12
- Installs dependencies + pytest
- Runs the tests

This workflow **does not** deploy anything.

### 2. CD Workflow (Deployment)

**File:** `.github/workflows/lambda-service-cd.yml`

- Triggers only on push to the `main` branch when `lambda-service/` changes
- Authenticates to AWS using OIDC
- Runs `sam build`
- Runs `sam deploy`

This is the workflow that pushes code to AWS.

---

## OIDC Authentication

We avoided storing long-lived AWS Access Keys in GitHub. Instead we used **OIDC (OpenID Connect)**.

### How it works

1. GitHub Actions requests a short-lived identity token
2. AWS trusts GitHub as an Identity Provider
3. The workflow assumes the IAM role `GitHubActions-LambdaDeploy`
4. The role has permissions to deploy with SAM

### Why OIDC is better
- No permanent secrets stored in GitHub
- Credentials exist only during the workflow run
- You can restrict access to a specific repository and branch

### Trust Policy (critical part)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::960480102932:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:ashimsharma337/Restaurant-Inventory-Management:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

This means **only** the `main` branch of your specific repository can assume the role.

---

## IAM Role & Permissions

**Role Name:** `GitHubActions-LambdaDeploy`  
**Role ARN:** `arn:aws:iam::960480102932:role/GitHubActions-LambdaDeploy`

### Final simplified policy (suitable for personal projects)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationAccess",
      "Effect": "Allow",
      "Action": ["cloudformation:*"],
      "Resource": "*"
    },
    {
      "Sid": "LambdaAccess",
      "Effect": "Allow",
      "Action": ["lambda:*"],
      "Resource": "*"
    },
    {
      "Sid": "IAMAccess",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::960480102932:role/*",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "lambda.amazonaws.com"
        }
      }
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": "*"
    },
    {
      "Sid": "LogsAccess",
      "Effect": "Allow",
      "Action": ["logs:*"],
      "Resource": "*"
    }
  ]
}
```

> For a personal project, using `s3:*`, `cloudformation:*`, and `logs:*` is acceptable and avoids many permission errors.

---

## Deployment Flow

What happens when you push code to `main`:

1. GitHub detects changes inside `lambda-service/`
2. CD workflow starts
3. Workflow assumes the IAM role via OIDC
4. `sam build` packages the code from `invoice-processor/`
5. `sam deploy` creates or updates the CloudFormation stack `lambda-service`
6. The Lambda function is created (first time) or updated (later times)

---

## CloudFormation Stacks

You will normally see two stacks:

| Stack Name | Purpose |
|------------|---------|
| `aws-sam-cli-managed-default` | Managed S3 bucket used by SAM for packaging code |
| `lambda-service` | Your application stack (contains the Lambda function) |

### Important note about failed stacks
If a deployment fails, the stack often goes into `ROLLBACK_COMPLETE` or `CREATE_FAILED`.  
You usually need to **delete** that stack before the next deployment can succeed.

---

## Troubleshooting

| Error / Problem | Solution |
|-----------------|----------|
| `Uploaded file must be a non-empty zip` | Check that `CodeUri` points to the correct folder (`invoice-processor/`) |
| Missing S3 permission (`TagResource`, `PutEncryptionConfiguration`, etc.) | Add the missing action or use `s3:*` |
| Stack in `ROLLBACK_COMPLETE` | Delete the stack in CloudFormation, then re-run the workflow |
| OIDC authentication fails | Verify the Trust Policy contains the correct repo and branch |
| Tests not found | Make sure the CI workflow looks in the correct tests folder |

---

## Useful Commands

```bash
# Build the application locally
sam build

# Deploy (same as the GitHub Action does)
sam deploy \
  --stack-name lambda-service \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides Stage=prod

# Delete the application stack
sam delete --stack-name lambda-service
```

---

## Summary

We built a clean and secure deployment pipeline using:

- **AWS SAM** → defines and deploys the Lambda
- **GitHub Actions** → runs CI (tests) and CD (deploy)
- **OIDC** → secure, temporary authentication
- **Path filters** → only triggers when `lambda-service/` changes

This approach is suitable for personal projects and follows practices commonly used in production environments.

---

*Document generated for quick reference and future refreshers.*
```
