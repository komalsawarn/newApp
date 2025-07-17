import request from "supertest";
import express from "express";
import policyRouter from "./routes/policy";
import { errorHandler } from "./Util/util";

const app = express();
app.use(express.json());
app.use("/policies", policyRouter);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});
app.use(errorHandler);

describe("App routes", () => {
  it("GET / should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello, TypeScript with Express!");
  });

  it("GET /unknown should return 404", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
  });
});
