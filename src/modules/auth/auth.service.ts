import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../../models/user-model";
import { SignJwt } from "../../middlewares/jwt-token";

const prisma = new PrismaClient();

// User registration
const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    // Empty field validation
    if (!name || !email || !password) {
      return res.status(406).json({
        status: "error",
        message: "Missing required field",
      });
    }

    // Check if user exists
    const existingUser: UserModel[] = await prisma.$queryRaw`
      SELECT * FROM user WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await prisma.$queryRaw`
      INSERT INTO user (name, email, password) 
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create user",
    });
  }
};

//user login
//check exist user
//check hashed password

const userLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // Check if the user exists
    const existingUser: UserModel[] =
      await prisma.$queryRaw`SELECT * FROM user WHERE email = ${email}`;

    if (existingUser.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not registered yet",
      });
    }

    //check password
    const hashedPassword = existingUser[0].password;
    const myPlaintextPassword = password;

    const isPasswordValid = await bcrypt.compare(
      myPlaintextPassword,
      String(hashedPassword)
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    //sign jwt
    const payload = {
      userId: existingUser[0].id as number,
      email: existingUser[0].email,
    };

    const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
    const access_token = SignJwt(payload, jwtSecretKey, "1h");

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      access_token: access_token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "An error occurred while logging in",
    });
  }
};

export default { registerUser, userLogin };
