# Invoice Processor Lambda

This directory contains the initial Lambda skeleton for processing S3 invoice upload events.

## Current behavior

The handler in `invoice-processor/app.py`:

1. Receives an S3 `ObjectCreated` event.
2. Logs the source bucket and uploaded object key.
3. Returns an HTTP-style success response.

At this stage it does not download, parse, or persist invoice data. DynamoDB writes and the production invoice-processing workflow will be added after the local AWS infrastructure is in place.

## Layout

```text
lambda-service/
├── events/
│   └── s3-event.json
├── invoice-processor/
│   ├── app.py
│   └── tests/
│       └── test_app.py
└── README.md
```

## Verified local output

The handler has been exercised with this S3 object:

```text
Uploaded object: s3://restaurant-inventory-local/invoices/INV-58231.pdf
```

It returned:

```python
{'statusCode': 200, 'body': '{"message": "Lambda executed successfully"}'}
```

## Run the tests

From the `lambda-service` directory:

```bash
PYTHONPATH=invoice-processor pytest invoice-processor/tests
```

## Next step: LocalStack infrastructure

Create and connect these LocalStack resources:

- S3 bucket: `restaurant-inventory-local`
- DynamoDB table for processed invoice data
- Lambda function: invoice processor

The S3 bucket should invoke the Lambda when an object is created under the invoice prefix. The Lambda can then read the object metadata, process the invoice, and write the extracted result to DynamoDB.