import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export function errorHandler(
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

//writing to the file
export function writePoliciesToFile(policies: any[]) {
  fs.writeFileSync(
    path.join(__dirname, "../storageFiles/policies.json"),
    JSON.stringify(policies, null, 2)
  );
}
