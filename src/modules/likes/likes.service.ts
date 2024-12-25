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

    await prisma.$queryRaw<LikeModel>`
        INSERT INTO likes (user_id, blog_id) VALUES (${userId}, ${blogId})
    `;

    return res.status(201).json({ status: "success", message: "Like created" });
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

    await prisma.$queryRaw<LikeModel>`
         DELETE FROM likes WHERE blog_id = ${blogId} AND user_id = ${userId}
      `;

    return res.status(201).json({ status: "success", message: "Like removed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error creating like",
    });
  }
};

//get total likes for a blog
const getBlogLikes = async (req: Request, res: Response): Promise<any> => {
  try {
    const blogId = req.params.id;

    if (!blogId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }

    const likesData: any = await prisma.$queryRaw`
        SELECT COUNT(*) AS total_likes FROM likes WHERE blog_id = ${blogId}
    `;
    const likesCount = parseInt(likesData[0].total_likes, 10);
    return res.status(200).json({ status: "success", data: likesCount });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: "error",
      message: "Error try again",
    });
  }
};

//get a user's liked blogs
const getUsersLikedBlogs = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching liked blogs",
    });
  }
};

export default { createLike, unlikeBlog, getBlogLikes, getUsersLikedBlogs };
