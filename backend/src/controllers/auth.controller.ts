import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";
import { AuthRequest } from "../middleware/auth.middleware";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(user: { id: string; role: string; email: string }) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function register(req: Request, res: Response) {
  const { email, username, password, name } = req.body as RegisterInput;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    res.status(409).json({
      message: existing.email === email ? "Email already in use" : "Username already taken",
    });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, password: hashed, name },
    select: { id: true, email: true, username: true, role: true, name: true, avatar: true, createdAt: true },
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.cookie("token", token, COOKIE_OPTIONS);

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, username: true, role: true, name: true, avatar: true, createdAt: true },
  });
  res.json({ user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { name, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, avatar },
    select: { id: true, email: true, username: true, role: true, name: true, avatar: true, createdAt: true },
  });
  res.json({ user });
}
