# Delivery Payload Schema

## Base required fields
- `deliveryName`: string
- `customer`: string
- `deliveryLocation`: 'email' | 'gcloud' | 'azure' | 's3'
- `deliveryFileName`: string
- `combineFiles`: boolean
- `specificDirectory`: boolean
- `virusScan`: boolean
- `encrypt`: boolean

## Conditionally required fields

### If `deliveryLocation === "email"` 
- `subject`: string
- `body`: string
- `recipients`: string

### If `deliveryLocation !== "email"`
- `bucket`: string
- `credentialsFile`: string
- `upload_option`: string

### If `combineFiles === true`
- `maximumFileSize`: number
- `compression`: boolean

## Optional fields

- `deliveryFrequency`: string
- `last_file_suffix`: string


  