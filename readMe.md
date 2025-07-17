# newApp

A TypeScript Express REST API for managing insurance policies and products.
modularilty have been maintained for common functions like

- File operation is put in util for utilizing further.
- AuthenticationKey has been put in separate middleware
- Global aerror handling and basic core usable function has been placed in app.ts
- storageFiles repository has been utilized to save data and json files conting out data. So that we can stor similar kind of data in thi srepo in future and move it to cloud or database servers for security and maintainability
  -separate routes folder created for cretaing different routing for diffrent modules in future for better understanding of code.
- endpoints and bisiness logic has beet put in same functions as there was not much logic required to put in in separate function.
  -Interfaces creted in different repository with name "types" wcan be further utilized to define more interfaces and files.

## Features

- Strictly typed with TypeScript
- Policy CRUD endpoints
- API key authentication middleware (`x-api-key` header)
- Environment variable support via `.env`
- Modular routing (`/routes/policy.ts`)
- JSON file storage for policies and products
- Jest test suite

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

### To Build and Run the application

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

### Static APi key Implemntation

- To Secure the api from unwanted users we will be defining a key in our .env file corresponding to API_KEY
- api caller will be passing the same x-api-key which will be in turn authenticated by our AuthenticateKey middleware and then will allow the api to be executed or else will through unauthorised error

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
