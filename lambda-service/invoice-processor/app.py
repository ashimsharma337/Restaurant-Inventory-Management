import json
import logging
import os
import re
import boto3
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")
textract = boto3.client("textract")
dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ.get("DOCUMENTS_TABLE", "stock-in-documents")
table = dynamodb.Table(TABLE_NAME)


def extract_fields(text: str) -> dict:
    """Pull Invoice #, PO Reference, and Total Due from raw OCR text."""
    fields = {
        "invoice_number": None,
        "po_reference": None,
        "total_due": None,
    }

    # Invoice #: INV-58231  (or Invoice # INV-58231)
    m = re.search(r"Invoice\s*#\s*:?\s*([A-Z0-9\-]+)", text, re.IGNORECASE)
    if m:
        fields["invoice_number"] = m.group(1).strip()

    # PO Reference: PO-40219
    m = re.search(r"PO\s*Reference\s*:?\s*([A-Z0-9\-]+)", text, re.IGNORECASE)
    if m:
        fields["po_reference"] = m.group(1).strip()

    # Total Due: $640.50
    m = re.search(r"Total\s*Due\s*:?\s*\$?\s*([\d,]+\.\d{2})", text, re.IGNORECASE)
    if m:
        fields["total_due"] = m.group(1).replace(",", "").strip()

    return fields


def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))

    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        object_key = record["s3"]["object"]["key"]

        # S3 may URL-encode the key
        from urllib.parse import unquote_plus
        object_key = unquote_plus(object_key)

        logger.info("Processing s3://%s/%s", bucket, object_key)

        response = textract.detect_document_text(
            Document={"S3Object": {"Bucket": bucket, "Name": object_key}}
        )

        extracted_text = ""
        for block in response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                extracted_text += block["Text"] + "\n"

        logger.info("Extracted text length: %d", len(extracted_text))

        fields = extract_fields(extracted_text)
        logger.info("Parsed fields: %s", fields)

        item = {
            "object_key": object_key,
            "bucket": bucket,
            "extracted_text": extracted_text,
            "invoice_number": fields["invoice_number"],
            "po_reference": fields["po_reference"],
            "total_due": fields["total_due"],
            "status": "processed",
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "textract_job": "DetectDocumentText",
        }

        table.put_item(Item=item)
        logger.info("Saved to DynamoDB: %s", object_key)

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Processing completed"}),
    }