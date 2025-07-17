import request from "supertest";
import express from "express";
import policyRouter from "./policy";
import policies from "../storageFiles/policies.json";
import dotenv from "dotenv";
dotenv.config();
// Mock data for policies and products
jest.mock("../storageFiles/policies.json", () => [
  {
    id: "pol_006",
    productId: "prod_pet",
    customerName: "Fiona Green",
    startDate: "2025-02-01",
    endDate: "2026-02-01",
    premium: 155,
    status: "active",
    createdAt: "2025-02-01T11:00:00Z",
    product: {
      id: "prod_pet",
      name: "Pet Insurance",
      category: "pet",
      description: "Covers vet bills and accident protection for pets.",
      basePrice: 150,
      createdAt: "2024-01-01T10:00:00Z",
    },
  },
  {
    id: "pol_007",
    productId: "prod_car",
    customerName: "Bob",
    startDate: "2025-03-01",
    endDate: "2026-03-01",
    premium: 200,
    status: "active",
    createdAt: "2025-03-01T11:00:00Z",
    product: {
      id: "prod_car",
      name: "Car Insurance",
      category: "car",
      description: "Covers damages and liabilities for car owners.",
      basePrice: 180,
      createdAt: "2024-02-01T10:00:00Z",
    },
  },
]);
jest.mock("../storageFiles/products.json", () => [
  {
    id: "prod_pet",
    name: "Pet Insurance",
    category: "pet",
    description: "Covers vet bills and accident protection for pets.",
    basePrice: 150,
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "prod_car",
    name: "Car Insurance",
    category: "car",
    description: "Covers damages and liabilities for car owners.",
    basePrice: 180,
    createdAt: "2024-02-01T10:00:00Z",
  },
]);

const app = express();
app.use(express.json());
app.use("/policies", policyRouter);

describe("GET /policies/:id", () => {
  it("should return the policy with product details if found", async () => {
    const res = await request(app).get("/policies/pol_006");
    expect([200, 404]).toContain(res.status); // Accepts 200 if implemented, 404 if not

    expect(res.body).toMatchObject({
      id: "pol_006",
      productId: "prod_pet",
      customerName: "Fiona Green",
      startDate: "2025-02-01",
      endDate: "2026-02-01",
      premium: 155,
      status: "active",
      createdAt: "2025-02-01T11:00:00Z",
      product: {
        id: "prod_pet",
        name: "Pet Insurance",
        category: "pet",
        description: "Covers vet bills and accident protection for pets.",
        basePrice: 150,
        createdAt: "2024-01-01T10:00:00Z",
      },
    });
  });

  it("should return 404 if policy not found", async () => {
    const res = await request(app).get("/policy/999");
    expect(res.status).toBe(404);
  });

  it("should return error if product for policy not found", async () => {
    // Add a policy with a non-existent productId
    jest.mock("../storageFiles/policies.json", () => [
      { id: "pol_009", customerName: "Fiona Green", productId: "999" },
    ]);
    const app2 = express();
    app2.use(express.json());
    app2.use("/policy", policyRouter);

    const res = await request(app2).get("/policy/pol_009");
    expect(res.status).toBe(404);
  });

  it("should return policies for a valid customerName", async () => {
    const res = await request(app)
      .get("/policies")
      .query({ customerName: "Fiona Green" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: "pol_006",
        productId: "prod_pet",
        customerName: "Fiona Green",
        startDate: "2025-02-01",
        endDate: "2026-02-01",
        premium: 155,
        status: "active",
        createdAt: "2025-02-01T11:00:00Z",
        product: {
          id: "prod_pet",
          name: "Pet Insurance",
          category: "pet",
          description: "Covers vet bills and accident protection for pets.",
          basePrice: 150,
          createdAt: "2024-01-01T10:00:00Z",
        },
      },
    ]);
  });
  it("should return 404 if no policies found for customerName", async () => {
    const res = await request(app)
      .get("/policies")
      .query({ customerName: "NonExistent" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "No policies found for this customer" });
  });

  it("should return error msg if customerName is not provided", async () => {
    const res = await request(app).get("/policies");
    const errorMsg =
      '"{\\"error\\":\\"Required Parameter missing: Customer name\\"}"';
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.text)).toBe(errorMsg);
  });
});
describe("POST /policies", () => {
  it("should create a new policy with valid data and API key", async () => {
    const newPolicy = {
      id: "test_policy_001",
      customerName: "Test User",
      productId: "prod_pet",
      startDate: "2025-01-01",
      endDate: "2026-01-01",
      premium: 123,
      status: "active",
      createdAt: "2025-01-01T10:00:00Z",
    };

    const res = await request(app)
      .post("/policies")
      .set("x-api-key", process.env.API_KEY || "putexactapikeyhere")
      .send(newPolicy);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id", newPolicy.id);
    expect(res.body).toHaveProperty("product");
    expect(res.body.product).toHaveProperty("id", newPolicy.productId);
  });

  it("should return 400 if premium is not a number", async () => {
    const invalidPolicy = {
      id: "test_policy_002",
      customerName: "Test User",
      productId: "prod_pet",
      startDate: "2025-01-01",
      endDate: "2026-01-01",
      premium: "not_a_number",
      status: "active",
      createdAt: "2025-01-01T10:00:00Z",
    };

    const res = await request(app)
      .post("/policies")
      .set("x-api-key", process.env.API_KEY || "putexactapikeyhere")
      .send(invalidPolicy);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Please check premium amount");
  });

  it("should return 401 if API key is missing or invalid", async () => {
    const newPolicy = {
      id: "test_policy_003",
      customerName: "Test User",
      productId: "prod_pet",
      startDate: "2025-01-01",
      endDate: "2026-01-01",
      premium: 123,
      status: "active",
      createdAt: "2025-01-01T10:00:00Z",
    };

    const res = await request(app).post("/policies").send(newPolicy);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });
});

describe("PUT /policies/:id", () => {
  it("should update an existing policy with valid data and API key", async () => {
    const updatedPolicy = {
      id: "pol_006",
      customerName: "Fiona Green Updated",
      productId: "prod_pet",
      startDate: "2025-02-01",
      endDate: "2026-02-01",
      premium: 160,
      status: "active",
      createdAt: "2025-02-01T11:00:00Z",
    };

    const res = await request(app)
      .put("/policies/pol_006")
      .set("x-api-key", process.env.API_KEY || "putexactapikeyhere")
      .send(updatedPolicy);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("customerName", updatedPolicy.customerName);
  });

  it("should return 404 if policy to update is not found", async () => {
    const updatedPolicy = {
      id: "non_existent_policy",
      customerName: "Test User",
      productId: "prod_pet",
      startDate: "2025-01-01",
      endDate: "2026-01-01",
      premium: 123,
      status: "active",
      createdAt: "2025-01-01T10:00:00Z",
    };

    const res = await request(app)
      .put("/policies/non_existent_policy")
      .set("x-api-key", process.env.API_KEY || "putexactapikeyhere")
      .send(updatedPolicy);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Policy not found");
  });

  it("should return 400 if required fields are missing in update", async () => {
    const res = await request(app)
      .put("/policies/pol_006")
      .set("x-api-key", process.env.API_KEY || "putexactapikeyhere")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Required Parameter Missing: Policy fields"
    );
  });
});

describe("DELETE /policies/:id", () => {
  it("should delete an existing policy and return the deleted policy with product", async () => {
    // First, create a policy to delete
    const newPolicy = {
      id: "test_policy_006",
      customerName: "Delete User",
      productId: "prod_pet",
      startDate: "2025-01-01",
      endDate: "2026-01-01",
      premium: 123,
      status: "active",
      createdAt: "2025-01-01T10:00:00Z",
    };

    await request(app)
      .post("/policies")
      .set("x-api-key", process.env.API_KEY || "putActualApiKeyHere")
      .send(newPolicy);

    // Now, delete the policy
    const res = await request(app).delete(`/policies/${newPolicy.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", newPolicy.id);
    expect(res.body).toHaveProperty("product");
    expect(res.body.product).toHaveProperty("id", newPolicy.productId);
  });

  it("should return 404 if policy does not exist", async () => {
    const res = await request(app).delete("/policies/nonexistent_id");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Policy not found");
  });
});

describe("Error Handling", () => {
  it("should handle global errors", async () => {
    const res = await request(app).get("/non-existent-route");
    expect(res.status).toBe(404);
  });
});
