import json
import logging


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    """
    AWS Lambda entry point.

    Receives an S3 event and extracts the uploaded
    object's bucket name and key.
    """

    logger.info("Received event: %s", json.dumps(event))

    for record in event.get("Records", []):
        bucket_name = record["s3"]["bucket"]["name"]
        object_key = record["s3"]["object"]["key"]

        logger.info(
            "Uploaded object: s3://%s/%s",
            bucket_name,
            object_key,
        )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Lambda executed successfully"
        }),
    }