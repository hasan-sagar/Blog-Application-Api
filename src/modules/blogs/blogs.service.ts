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
// const getAllBlogs = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const getBlogs: BlogFetchModel[] = await prisma.$queryRaw`
//       SELECT
//         blogs.id AS id,
//         blogs.title,
//         blogs.content,
//         GROUP_CONCAT(tags.tag_name) AS tags
//         FROM blogs
//         LEFT JOIN blog_tags ON blogs.id = blog_tags.blog_id
//         LEFT JOIN tags ON blog_tags.tag_id = tags.id
//         GROUP BY blogs.id, blogs.title, blogs.content
//     `;

//     const blogs = getBlogs.map((blog: BlogFetchModel) => ({
//       id: blog.id,
//       title: blog.title,
//       content: blog.content,
//       tags: blog.tags ? blog.tags.split(",") : [],
//     }));

//     return res.status(200).json({
//       status: "success",
//       data: blogs,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Error fetching blogs. Try again.",
//     });
//   }
// };

// get all blogs
const getAllBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    //blogapi.com/api?page=2&pageSize=10
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 10;
    const offset: number = (page - 1) * pageSize;

    const totalBlogsResult: any = await prisma.$queryRaw`
      SELECT COUNT(*) AS count FROM blogs
    `;

    const totalBlogs = Number(totalBlogsResult[0].count);

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
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const blogs = getBlogs.map((blog: BlogFetchModel) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags ? blog.tags.split(",") : [],
    }));

    const totalPages = Math.ceil(totalBlogs / pageSize);

    return res.status(200).json({
      status: "success",
      data: blogs,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalBlogs: totalBlogs,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error(error);
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

    if (getBlog[0].id === null) {
      return res.status(404).json({
        status: "error",
        message: "No blog found",
      });
    } else {
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
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching blog",
    });
  }
};

//delete blog
const deleteBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const blogId = req.params.id;
    const userId = req.userId;

    const findBlog: BlogModel[] = await prisma.$queryRaw`
      SELECT * FROM blogs WHERE id=${blogId}
    `;

    if (findBlog.length > 0) {
      await prisma.$queryRaw`
      DELETE FROM blogs WHERE blogs.id=${blogId} AND blogs.user_id=${userId}
    `;
      return res.status(200).json({
        status: "success",
        message: "Blog deleted success",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error deleting blog",
    });
  }
};

//user's blog show
const currentUserBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const getBlogs: BlogFetchModel[] = await prisma.$queryRaw`
    SELECT
      blogs.id AS id,
      blogs.title,
      blogs.content,
      GROUP_CONCAT(tags.tag_name) AS tags
    FROM blogs
    LEFT JOIN blog_tags ON blogs.id = blog_tags.blog_id
    LEFT JOIN tags ON blog_tags.tag_id = tags.id
    WHERE blogs.user_id=${userId}
    GROUP BY blogs.id`;

    const blogData = getBlogs.map((blog: BlogFetchModel) => ({
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

//update blog

const updateBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id;
    const { title, content } = req.body;
    const userId = req.userId;

    const findBlog: BlogModel[] = await prisma.$queryRaw`
    SELECT * FROM blogs WHERE id=${id}
  `;

    if (findBlog.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }
    if (findBlog[0].user_id !== userId) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden access",
      });
    }

    await prisma.$queryRaw`
      UPDATE blogs 
      SET title=${title} , content=${content}
      WHERE blogs.id=${id}
    `;

    return res.status(200).json({
      status: "success",
      message: "Blog updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating blog",
    });
  }
};

//search blogs by title and content
const searchBlogPost = async (req: Request, res: Response): Promise<any> => {
  try {
    const searchQuery = req.query.search;

    const getSearchData = await prisma.$queryRaw`
      SELECT 
      blogs.id AS id,
      blogs.title,
      blogs.content,
      GROUP_CONCAT(tags.tag_name) AS tags
    FROM blogs
    LEFT JOIN blog_tags ON blogs.id = blog_tags.blog_id
    LEFT JOIN tags ON blog_tags.tag_id = tags.id
    WHERE blogs.title LIKE ${"%" + searchQuery + "%"} 
    OR blogs.content LIKE ${"%" + searchQuery + "%"}
    GROUP BY blogs.id
    `;

    return res.status(200).json({
      status: "success",
      data: getSearchData,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching blog",
    });
  }
};

//get blogs by tag
const getBlogsByTag = async (req: Request, res: Response): Promise<any> => {
  try {
    const tagId = req.params.id;

    const getBlogs: BlogFetchModel[] = await prisma.$queryRaw`
    SELECT
      blogs.id AS id,
      blogs.title,
      blogs.content,
      GROUP_CONCAT(tags.tag_name) AS tags
      FROM blogs
      LEFT JOIN blog_tags ON blogs.id = blog_tags.blog_id
      LEFT JOIN tags ON blog_tags.tag_id = tags.id
      WHERE tags.id = ${tagId}
      GROUP BY blogs.id
    `;

    return res.status(200).json({
      status: "success",
      data: getBlogs,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: "error",
      message: "Error fetching blog",
    });
  }
};

export default {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  deleteBlog,
  currentUserBlogs,
  updateBlog,
  searchBlogPost,
  getBlogsByTag,
};
