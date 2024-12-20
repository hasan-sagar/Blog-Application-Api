import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { LikeModel } from "../../models/like-model";

const prisma = new PrismaClient();

//create a like for user
const createLike = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const blogId = req.body.blogId;

    if (!userId || !blogId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }

    const newLike: LikeModel = await prisma.$queryRaw`
        INSERT INTO likes (user_id, blog_id) VALUES (${userId}, ${blogId})
    `;

    return res
      .status(201)
      .json({ status: "success", message: "Like created " });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error creating like",
    });
  }
};

//unlike a blog for user
const unlikeBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const blogId = req.body.blogId;

    if (!userId || !blogId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }

    const unlikeBlog: LikeModel = await prisma.$queryRaw`
         DELETE FROM likes WHERE blog_id = ${blogId} AND user_id = ${userId}
      `;

    return res
      .status(201)
      .json({ status: "success", message: "Unlike this blog" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error creating like",
    });
  }
};

export default { createLike, unlikeBlog };
