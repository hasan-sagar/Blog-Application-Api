import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UserModel } from "../models/user-model";
const prisma = new PrismaClient();

interface JwtPayload {
  userId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      userId: number;
      userEmail: string;
    }
  }
}

const jwtSecretKey = process.env.JWT_SECRET_KEY as string;

export const SignJwt = (
  payload: JwtPayload,
  secretKey: string,
  expiresIn: string | number = "1h"
): string => {
  return jwt.sign(payload, secretKey, { expiresIn });
};

//verify jwt

export const VerifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decode: any = jwt.verify(token, jwtSecretKey);

    const existingUser: UserModel[] =
      await prisma.$queryRaw`SELECT id,email FROM user WHERE email = ${decode.email}`;

    if (!existingUser) {
      return res.sendStatus(401);
    }

    req.userId = existingUser[0].id as number;
    req.userEmail = existingUser[0].email as string;

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }
};
