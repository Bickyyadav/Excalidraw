import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const getToken = req.cookies.authToken;
  if (!getToken) {
    res.json("unauthorized");
    return;
  }

  const decoded = jwt.verify(getToken, JWT_SECRET);
  if (decoded) {
    //@ts-ignore
    req.userId = decoded.userId;
    next();
  } else {
    res.status(403).json({
      message: "Unauthorized",
    });
  }
}
