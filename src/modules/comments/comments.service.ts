import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CommentModel } from "../../models/comment-model";

const prisma = new PrismaClient();

//create comment for blog
const createComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const blogId = req.body.blogId;
    const commentText = req.body.comment_text;

    if (!userId || !blogId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }

    await prisma.$queryRaw<CommentModel>`
        INSERT INTO comments (user_id,blog_id,comment_text) VALUES 
        (${userId}, ${blogId},${commentText})
    `;

    return res
      .status(201)
      .json({ status: "success", message: "Comment created" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error creating comment",
    });
  }
};

//delete comment for blog
const deleteComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const commentId = req.body.commentId;

    if (!userId || !commentId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }

    await prisma.$queryRaw`
        DELETE FROM comments WHERE id=${commentId} AND user_id=${userId}
    `;
    return res
      .status(201)
      .json({ status: "success", message: "Comment deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error deleting comment",
    });
  }
};

//show comment for blog
const showComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const blogId = req.params.id;

    if (!blogId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }

    const comments = await prisma.$queryRaw<CommentModel>`
       SELECT comments.id,comments.comment_text,user.name 
       FROM comments 
       LEFT JOIN USER ON user.id=comments.user_id
       WHERE blog_id=${blogId}
    `;
    return res.status(201).json({ status: "success", data: comments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error showing comment",
    });
  }
};

export default { createComment, deleteComment, showComment };
