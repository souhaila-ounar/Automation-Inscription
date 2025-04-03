import { Request, Response, NextFunction } from "express";
import { ourApiKey } from "../config";
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("token ")) {
    res.status(401).json({
      status: "error",
      message: "Authorization header missing or invalid format",
    });
    return;
  }

  const apiKey = authHeader.split(" ")[1];

  if (apiKey !== ourApiKey) {
    res.status(401).json({
      status: "error",
      message: "Invalid API key",
    });
    return;
  }

  next();
};
