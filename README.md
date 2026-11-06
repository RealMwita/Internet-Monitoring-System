# Internet Monitoring System

A multi-tenant platform for internet service providers to manage customer Wi-Fi access, packages, payments, company administrators, and MikroTik routers.

**Repository:** [RealMwita/internet-monitoring-system](https://github.com/RealMwita/internet-monitoring-system)

## Components

| Component | Directory | Description |
| --- | --- | --- |
| Backend API | `backend/` | Node.js and Express API, PostgreSQL access, authentication, payment integrations, and network services |
| Customer portal | `customer-portal/` | Angular application for discovering packages and purchasing internet access |
| Admin application | `admin-app/` | Angular and Ionic application for company and platform administration |
| Shared code | `shared/` | Utilities shared across project components |

## Features

- Multiple companies with separate administrators, packages, payments, and network settings
- Customer package browsing and payment flows
- Superadmin platform and company administration
- Administrator authentication with JWTs, password hashing, and role-based access controls
- PostgreSQL-backed records and payment/session lifecycle services
- MikroTik router integration for managing customer internet access
- Selcom payment integration and encrypted payment credentials
- English and Swahili interfaces in the web applications

## Requirements

- Node.js and npm versions supported by the Angular versions used in each frontend
- PostgreSQL
- MikroTik RouterOS and network access to configured routers for network features
- Payment provider configuration for payment features

## Getting started

Clone the repository:

```bash
git clone https://github.com/RealMwita/internet-monitoring-system.git
cd internet-monitoring-system
```

### Configure the backend

In PowerShell, create a local environment file from the example:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and set the PostgreSQL connection values, a strong JWT secret, and the payment encryption key. Generate secrets locally, for example:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Use the first value for `JWT_SECRET` and the second for `PAYMENT_ENCRYPTION_KEY`. Keep the encryption key stable and back it up securely; changing it prevents decrypting credentials already stored with the old key. Never commit `.env` files or share production secrets.

Create and initialize a PostgreSQL database, then set the matching `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` values in `backend/.env`. The SQL files under `backend/src/database/migrations/` cover specific integrations; they are not a complete initial schema. Apply the base application schema before starting the API.

Install dependencies and run the backend:

```bash
cd backend
npm install
npm run dev
```

The API listens on port `4000` by default. You can override this with `PORT`.

### Run the customer portal

In a separate terminal from the repository root:

```bash
cd customer-portal
npm install
npm start
```

The development server proxies `/api` and `/uploads` requests to `http://127.0.0.1:4000`. Open the local URL printed by Angular CLI.

### Run the admin application

In another terminal from the repository root:

```bash
cd admin-app
npm install
npm start
```

The development server uses the same local API proxy. Open the local URL printed by Angular CLI.

## Tests and builds

Run backend tests:

```bash
cd backend
npm test
```

Build either frontend:

```bash
cd customer-portal
npm run build
```

```bash
cd admin-app
npm run build
```

## Configuration reference

See [`backend/.env.example`](backend/.env.example) for the backend's environment variable names and default development values. Router credentials and payment-provider settings should be configured for your environment. Use HTTPS, strong unique secrets, restricted database access, and secure backups in production.

## Contributing

1. Fork the repository and create a feature branch.
2. Make and test your changes.
3. Open a pull request with a summary of the changes and relevant test results.

## License

No license has been specified yet. All rights remain with the copyright holder unless a license is added.
