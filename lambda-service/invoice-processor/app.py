import json
import logging
import os
import boto3
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")
textract = boto3.client("textract")
dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ.get("DOCUMENTS_TABLE", "stock-in-documents")
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))

    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        object_key = record["s3"]["object"]["key"]

        logger.info("Processing s3://%s/%s", bucket, object_key)

        # 1. Call Textract (DetectDocumentText is the cheapest option)
        response = textract.detect_document_text(
            Document={
                "S3Object": {
                    "Bucket": bucket,
                    "Name": object_key
                }
            }
        )

        # 2. Extract plain text
        extracted_text = ""
        for block in response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                extracted_text += block["Text"] + "\n"

        logger.info("Extracted text length: %d", len(extracted_text))

        # 3. Save to DynamoDB
        item = {
            "object_key": object_key,
            "bucket": bucket,
            "extracted_text": extracted_text,
            "status": "processed",
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "textract_job": "DetectDocumentText"
        }

        table.put_item(Item=item)
        logger.info("Saved to DynamoDB: %s", object_key)

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Processing completed"})
    }