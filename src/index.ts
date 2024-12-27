import express, { Request, Response } from "express";
import "dotenv/config";
import authRouter from "./modules/auth/auth.route";
import userRouter from "./modules/users/user.route";
import blogRouter from "./modules/blogs/blogs.route";
import likeRouter from "./modules/likes/likes.route";
import commentsRouter from "./modules/comments/comments.route";

const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentsRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

app.listen(5500, () => {
  console.log("Server port 5500");
});
