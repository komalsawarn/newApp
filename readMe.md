# newApp

A TypeScript Express REST API for managing insurance policies and products.

## Features

- Strictly typed with TypeScript
- Policy CRUD endpoints
- API key authentication middleware (`x-api-key` header)
- Environment variable support via `.env`
- Modular routing (`/routes/policy.ts`)
- JSON file storage for policies and products
- Jest test suite with Supertest

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```sh
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```
API_KEY=your-api-key
PORT=3000
```

### Build and Run

```sh
npm run build
npm start
```

For development (hot reload):

```sh
npm run dev
```

### API Endpoints

#### Policies

- `GET /policies` - List all policies
- `GET /policies/:id` - Get a policy by ID
- `POST /policies` - Create a new policy (requires `x-api-key`)
- `PUT /policies/:id` - Update a policy by ID (requires `x-api-key`)
- `DELETE /policies/:id` - Delete a policy by ID (requires `x-api-key`)

#### Products.json are corresponding to policies.json file

### Testing

Run all tests:

```sh
npm test
```

## Project Structure

```
src/
  app.ts
  routes/
    policy.ts
    product.ts
  types/
    data-types.ts
storageFiles/
  policies.json
  products.json
.env
jest.config.js
```

## License

ISC
