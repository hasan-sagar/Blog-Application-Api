import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { UserModel } from "../../models/user-model";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

//get current loggedin user profile
const getLoggedInUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const validEmail = req.userEmail;

    const user: UserModel[] =
      await prisma.$queryRaw`SELECT id,email,password,created_at FROM user WHERE email = ${validEmail}`;

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Invalid user",
    });
  }
};

//update user profile
const updateUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const { password } = req.body;
    const id = req.userId;
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatePassword =
      await prisma.$queryRaw`UPDATE user SET password=${hashedPassword} WHERE id=${id}`;

    if (!updatePassword) {
      return res.status(500).json({
        status: "error",
        message: "Wrong credentials",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Password updated success",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error Try Again",
    });
  }
};

export default { getLoggedInUser, updateUserProfile };
