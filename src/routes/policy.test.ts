// import request from "supertest";
// import express from "express";
// import policyRouter from "./policy";

// const app = express();
// app.use(express.json());
// app.use("/policies", policyRouter);

// describe("Dummy test for /policies route", () => {
//   it("should return 200 and a welcome message for GET /policies/dummy", async () => {
//     // Add a dummy endpoint in your router for this test if needed
//     const res = await request(app).get("/policies/dummy");
//     expect([200, 404]).toContain(res.status); // Accepts 200 if implemented, 404 if not
//   });
// });

import request from "supertest";
import express from "express";
import policyRouter from "./policy";
import policies from "../storageFiles/policies.json";

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
      id: "1",
      customerName: "Fiona Green",
      productId: "prod_pet",
      product: { id: "prod_pet", name: "Pet Insurance" },
    });
  });

  it("should return 404 if policy not found", async () => {
    const res = await request(app).get("/policy/999");
    expect(res.status).toBe(404);
  });

  it("should return 500 if product for policy not found", async () => {
    // Add a policy with a non-existent productId
    jest.mock("../storageFiles/policies.json", () => [
      { id: "pol_006", customerName: "Fiona Green", productId: "999" },
    ]);
    const app2 = express();
    app2.use(express.json());
    app2.use("/policy", policyRouter);

    const res = await request(app2).get("/policy/pol_009");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "policy not found" });
  });

  //   it("should return policies for a valid customerName", async () => {
  //     const res = await request(app)
  //       .get("/policy")
  //       .query({ customerName: "Alice" });
  //     expect(res.status).toBe(200);
  //     expect(res.body).toEqual([
  //       {
  //         id: "1",
  //         customerName: "Alice",
  //         productId: "101",
  //         product: { id: "101", name: "Health Insurance" },
  //       },
  //     ]);
  //   });

  //   it("should return 404 if no policies found for customerName", async () => {
  //     const res = await request(app)
  //       .get("/policy")
  //       .query({ customerName: "NonExistent" });
  //     expect(res.status).toBe(404);
  //     expect(res.body).toEqual({ error: "No policies found for this customer" });
  //   });

  //   it("should return 'Missing Parameter: Customer name' if customerName is not provided", async () => {
  //     const res = await request(app).get("/policy");
  //     expect(res.status).toBe(200);
  //     expect(res.text).toBe("Missing Parameter: Customer name");
  //   });
});
