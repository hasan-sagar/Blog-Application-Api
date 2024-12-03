import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { BlogModel } from "../../models/blog-model";
const prisma = new PrismaClient();

//create a blog
const createBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.userId;

    // Insert blog
    const blogData: BlogModel[] = await prisma.$queryRaw`
        INSERT INTO blogs(title, content, user_id) VALUES (${title}, ${content}, ${userId})
      `;

    //blog id
    const blogIdQuery: any = await prisma.$queryRaw`
        SELECT LAST_INSERT_ID() AS blogId
      `;
    const blogId = blogIdQuery[0].blogId;

    //tag id
    const tagIds: number[] = [];

    //Insert tags
    for (const tag of tags) {
      const tagData: any = await prisma.$queryRaw`
          INSERT INTO tags (tag_name) VALUES (${tag})
        `;

      //newly inserted tagid
      const tagIdQuery: any = await prisma.$queryRaw`
          SELECT LAST_INSERT_ID() AS tagId
        `;
      const tagId = tagIdQuery[0].tagId;
      tagIds.push(tagId);
    }

    //Insert into blog_tags
    for (const tagId of tagIds) {
      await prisma.$queryRaw`
          INSERT INTO blog_tags (blog_id, tag_id) VALUES (${blogId}, ${tagId})
        `;
    }

    return res.status(200).json({
      status: "success",
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Error creating blog. Try again.",
    });
  }
};

export default { createBlog };
