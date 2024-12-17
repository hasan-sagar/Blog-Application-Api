import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { BlogModel } from "../../models/blog-model";
import { TagsModel } from "../../models/tag-model";
import { BlogFetchModel } from "../../models/blog-fetch-model";

const prisma = new PrismaClient();

// Create a blog
const createBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.userId;

    // Insert the blog
    const blogData: BlogModel = await prisma.$queryRaw`
      INSERT INTO blogs (title, content, user_id) VALUES (${title}, ${content}, ${userId})
    `;

    // New blog id
    const blogIdQuery: any = await prisma.$queryRaw`
      SELECT LAST_INSERT_ID() AS blogId
    `;
    const blogId = blogIdQuery[0].blogId;

    // Empty tag id
    const tagIds: number[] = [];

    for (const tag of tags) {
      // Check exist tag id
      const existingTag: any = await prisma.$queryRaw`
        SELECT id FROM tags WHERE tag_name = ${tag}
      `;

      let tagId: number;
      if (existingTag.length > 0) {
        tagId = existingTag[0].id;
      } else {
        const tagData: TagsModel = await prisma.$queryRaw`
          INSERT INTO tags (tag_name) VALUES (${tag})
        `;
        const tagIdQuery: any = await prisma.$queryRaw`
          SELECT LAST_INSERT_ID() AS tagId
        `;

        tagId = tagIdQuery[0].tagId;
      }
      tagIds.push(tagId);
    }

    // Insert into blog_tags
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
    return res.status(500).json({
      status: "error",
      message: "Error creating blog. Try again.",
    });
  }
};

//get all blogs
const getAllBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const getBlogs: BlogFetchModel[] = await prisma.$queryRaw`
      SELECT 
        blogs.id AS id,
        blogs.title,
        blogs.content,
        GROUP_CONCAT(tags.tag_name) AS tags
        FROM blogs
        LEFT JOIN blog_tags ON blogs.id = blog_tags.blog_id
        LEFT JOIN tags ON blog_tags.tag_id = tags.id
        GROUP BY blogs.id, blogs.title, blogs.content
    `;

    const blogs = getBlogs.map((blog: BlogFetchModel) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags ? blog.tags.split(",") : [],
    }));

    return res.status(200).json({
      status: "success",
      data: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching blogs. Try again.",
    });
  }
};

//get a single blog
const getSingleBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id;
    const getBlog: BlogFetchModel[] = await prisma.$queryRaw`
      SELECT
      blogs.id AS id,
      blogs.title,
      blogs.content,
      GROUP_CONCAT(tags.tag_name) AS tags
    FROM blogs
    LEFT JOIN blog_tags ON blogs.id = blog_tags.blog_id
    LEFT JOIN tags ON blog_tags.tag_id = tags.id
    WHERE blogs.id = ${id}
    `;

    const blogData = getBlog.map((blog: BlogFetchModel) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags ? blog.tags.split(",") : [],
    }));

    return res.status(200).json({
      status: "success",
      data: blogData,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching blog",
    });
  }
};

export default { createBlog, getAllBlogs, getSingleBlog };
