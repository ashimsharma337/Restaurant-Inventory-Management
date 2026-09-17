import json
from unittest.mock import patch

import app


def test_lambda_handler_reads_s3_event():
    event = {
        "Records": [
            {
                "eventName": "ObjectCreated:Put",
                "s3": {
                    "bucket": {
                        "name": "restaurant-inventory-local"
                    },
                    "object": {
                        "key": "invoices/INV-58231.pdf"
                    }
                }
            }
        ]
    }

    with patch.object(app.logger, "info") as mock_logger:
        result = app.lambda_handler(event, None)

        assert result["statusCode"] == 200
        assert json.loads(result["body"]) == {
            "message": "Lambda executed successfully"
        }
        mock_logger.assert_any_call(
            "Uploaded object: s3://%s/%s",
            "restaurant-inventory-local",
            "invoices/INV-58231.pdf",
        )