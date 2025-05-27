import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface MyJwtPayload extends JwtPayload {
  userId: string;
}

export function middleware(req: Request, res: Response, next: NextFunction) {
  const getToken = req.cookies.authToken;
  if (!getToken) {
    res.json("unauthorized");
    return;
  }

  const decoded = jwt.verify(getToken, JWT_SECRET);

  if (typeof decoded === "string") {
    return;
  }

  const payload = decoded as MyJwtPayload;

  if (payload.userId) {
    //@ts-ignore
    req.userId = decoded.userId;
    next();
  } else {
    res.status(403).json({
      message: "Unauthorized",
    });
  }
}
