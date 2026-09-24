import json
import pytest
from unittest.mock import patch, MagicMock

# Import the handler after we can mock things
import app


@pytest.fixture
def s3_event():
    """Simple fake S3 event"""
    return {
        "Records": [
            {
                "s3": {
                    "bucket": {"name": "restaurant-inventory-production-12345"},
                    "object": {"key": "stock-in/test-invoice.pdf"}
                }
            }
        ]
    }


@patch("app.textract")
@patch("app.table")
def test_lambda_handler_success(mock_table, mock_textract, s3_event):
    # Mock Textract response
    mock_textract.detect_document_text.return_value = {
        "Blocks": [
            {"BlockType": "LINE", "Text": "Invoice #123"},
            {"BlockType": "LINE", "Text": "Total: $45.00"},
            {"BlockType": "WORD", "Text": "Ignore me"}
        ]
    }

    # Mock DynamoDB put_item
    mock_table.put_item.return_value = {}

    # Call the handler
    result = app.lambda_handler(s3_event, None)

    # Assertions
    assert result["statusCode"] == 200

    # Check that Textract was called correctly
    mock_textract.detect_document_text.assert_called_once_with(
        Document={
            "S3Object": {
                "Bucket": "restaurant-inventory-production-12345",
                "Name": "stock-in/test-invoice.pdf"
            }
        }
    )

    # Check that we saved something to DynamoDB
    mock_table.put_item.assert_called_once()
    saved_item = mock_table.put_item.call_args[1]["Item"]

    assert saved_item["object_key"] == "stock-in/test-invoice.pdf"
    assert "Invoice #123" in saved_item["extracted_text"]
    assert "Total: $45.00" in saved_item["extracted_text"]
    assert saved_item["status"] == "processed"


def test_lambda_handler_empty_event():
    """Should not crash with empty event"""
    result = app.lambda_handler({}, None)
    assert result["statusCode"] == 200