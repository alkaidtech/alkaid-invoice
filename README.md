# Alkaid Invoice Generator

A small Svelte frontend for generating Australian tax invoices from a fixed template.

## What it does

- Keeps the seller template fixed for a simple invoice workflow
- Lets you edit only the `Bill to` details and invoice line items
- Calculates subtotal, GST (10%), and total in AUD
- Exports to PDF using the browser print dialog

## Run locally

1. Install dependencies with `pnpm install`
2. Start the app with `pnpm dev`
3. Open the local Vite URL in your browser
4. Click `Export PDF` and save as PDF from the print dialog

## App config

The app reads config from `appconfig.local.json` by default, which is gitignored so you can keep your real business details out of source control.
Right now it reads `appConfig.business`, but the JSON can grow later with more keys.

Default local config

```bash
pnpm dev
```

Example `appconfig.local.json`:

```json
{
  "business": {
    "name": "Example Pty Ltd",
    "abn": "12 345 678 901",
    "email": "accounts@example.com",
    "phone": "+61 2 9000 0000",
    "address": ["Sydney NSW 2000", "Australia"],
    "bankDetails": {
      "accountName": "Example Pty Ltd",
      "bsb": "000-000",
      "accountNumber": "12345678"
    }
  }
}
```

Override during build with another local JSON file

```bash
APP_CONFIG_PATH=./some-other-config.json pnpm build
```

Or pass JSON directly:

```bash
APP_CONFIG_JSON='{"business":{"name":"Example Pty Ltd","abn":"12 345 678 901","email":"accounts@example.com","phone":"","address":[],"bankDetails":{"accountName":"Example Pty Ltd","bsb":"000-000","accountNumber":"12345678"}}}' pnpm build
```

If no config is provided and `appconfig.local.json` does not exist, the app falls back to an empty business object.

Important: this keeps the config out of source control, but not out of the final frontend bundle. Because the browser needs these values to render the invoice, they are still visible in the built app and exported PDF.

## Notes

- Dates and currency use Australian formatting
- Your real business details can live in `appconfig.local.json`, which is ignored by git
- `App.svelte` accepts `business` as a prop, so you can also pass a different config from `src/main.js`
