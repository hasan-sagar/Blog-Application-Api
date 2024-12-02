import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

const getLoggedInUser = async (req: Request, res: Response): Promise<any> => {
  res.json("hello");
  console.log(req.userEmail);
};

export default { getLoggedInUser };
