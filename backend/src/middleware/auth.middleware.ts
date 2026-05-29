import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
      email: string;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
      email: string;
    };
    req.user = decoded;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
