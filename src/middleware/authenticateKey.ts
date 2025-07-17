import { Request, Response, NextFunction } from "express";

export function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.header("x-api-key");
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
