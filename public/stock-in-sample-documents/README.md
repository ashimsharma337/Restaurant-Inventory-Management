# Stock-In Sample Documents

Sample fixture files for testing the stock-in upload/download feature (document
upload, storage, retrieval, and the CSV import/ETL pipeline). All data is
fictional — supplier, restaurant, item, and transaction details are made up
for testing purposes only.

Several of these files reference the same fictional receiving event so they
can be used together to test cross-document linking / audit trail features:
`PO-40219` → `INV-58231` → `DR-77410` (Atlantic Salmon Fillet, `PRD-1102`,
delivered 2 lb short).

## Files

| File | Format | Purpose |
|---|---|---|
| `purchase_order_PO-40219.pdf` | PDF | Sample purchase order sent to a supplier before delivery. Use to test upload of pre-delivery documents and PO-to-invoice matching. |
| `supplier_invoice_INV-58231.pdf` | PDF | Sample supplier invoice for a delivery. Core MVP document — upload on receiving, retrieve later from stock-in history. |
| `delivery_receipt_DR-77410.pdf` | PDF | Sample delivery/receiving log signed off by staff, including a quantity discrepancy note. Core MVP document, pairs with the invoice above. |
| `food_safety_certificate_HACCP-2026.pdf` | PDF | Sample supplier food-safety/HACCP compliance certificate. Use to test supplier-qualification document storage and expiration-date tracking. |
| `product_spec_sheet_PRD-1102.xlsx` | XLSX | Sample product specification sheet (storage temp, shelf life, allergens, nutritional info, reorder point). Use to test spreadsheet upload/preview. |
| `photo_damaged_delivery_PHOTO-DMG-0912-01.jpg` | JPG | Illustrative mock photo of a damaged item logged at receiving. **Not a real photo** — a labeled placeholder graphic for testing image upload, thumbnails, and file-size handling. |
| `photo_short_delivery_PHOTO-DMG-0912-02.jpg` | JPG | Illustrative mock photo of a short-quantity delivery, same purpose as above. |
| `stock_transactions_2026-06-01_to_2026-09-12.csv` | CSV | ~1,650-row stock movement log (stock-in, stock-out, waste, transfer, adjustment) across ~3.5 months, 39 items, 8 suppliers, 5 storage locations. Intended as raw input for building/testing an ETL pipeline — includes realistic data-quality issues (inconsistent unit casing, some missing `recorded_by` values, stray whitespace in a few item names) rather than pre-cleaned data. |

## Notes for testing

- PDFs and the XLSX are clean, presentation-quality samples — good for testing
  rendering, download, and metadata extraction.
- The CSV is intentionally *not* fully clean — use it to validate normalization,
  null-handling, and type-casting logic in an ETL step before loading into the
  application's database.
- The two JPGs are clearly watermarked as illustrative samples and should not
  be mistaken for real delivery photos.
