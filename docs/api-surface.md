# API Surface

Base path: `/api`

## Modules

- `GET /api/modules`
- `GET /api/modules/:moduleKey`

## Vouchers

- `GET /api/vouchers?q=&status=`
- `GET /api/vouchers/:id`
- `POST /api/vouchers`

Create voucher payload:

```json
{
  "voucherType": "HT1",
  "voucherNo": "26070003",
  "voucherDate": "2026-07-09",
  "currency": "VND",
  "counterpartyCode": "AAA",
  "counterpartyName": "Cong ty AAA",
  "content": "Ghi nhan dieu chinh chi phi thang 07",
  "amount": 5000000,
  "status": "draft",
  "createdBy": "DEMO.TGD",
  "lines": [
    {
      "debitAccount": "642",
      "debitDimension1": "CPQL",
      "creditAccount": "331",
      "creditDimension1": "AAA",
      "amount": 5000000,
      "description": "Chi phi quan ly doanh nghiep"
    }
  ]
}
```

## Approvals

- `GET /api/approvals`

## Sync

- `GET /api/sync/status`

Current default is Workit read-only sync for `GD1`.

## Jobs

- `GET /api/jobs/queues`

Configured queues:

- `workit-sync`
- `report-snapshots`
- `ai-assistance`
