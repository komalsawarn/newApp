// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import policyRouter from "./routes/policy";
import { errorHandler } from "./Util/util";
import dotenv from "dotenv";

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();

// Add this line before your routes
app.use(express.json());
app.use("/policies", policyRouter);

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.use(errorHandler);
