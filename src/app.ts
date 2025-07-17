// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import policyRouter from "./routes/policy";
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

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.use(errorHandler);
