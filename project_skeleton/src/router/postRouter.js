const express = require("express");
const { postController } = require("../controller");
const { postMiddleware, commentMiddleware } = require("../middleware");

const postRouter = express.Router();

// POST /api/v1/posts
postRouter.post(
  "/",
  postMiddleware.checkCompletePostFrom("body"), // 게시글 생성 시에는 모든 값(title, content, author)이 있어야하기에 미들웨어로 체크
  postController.postPost // 마지막으로 controller객체에 있는 request handler를 등록
);
// GET /api/v1/posts/:postId
postRouter.get(
  "/:postId",
  postMiddleware.checkPostIdFrom("params"), // 특정 게시글을 가져오기 위해서는 id가 필수이기에 미들웨어로 체크
  postController.getPost // 마지막으로 controller객체에 있는 request handler를 등록
);
// GET /api/v1/posts
postRouter.get("/", postController.getPosts); // controller객체에 있는 request handler를 등록
// PUT /api/v1/posts/:postId
postRouter.put(
  "/:postId",
  postMiddleware.checkPostIdFrom("params"), // 특정 게시글을 수정하기 위해서는 id가 필수이기에 미들웨어로 체크
  postMiddleware.checkMinPostConditionFrom("body"), // 게시글을 수정하기 위해서는 최소한의 수정할 값이 있어야하기 때문에 미들웨어로 체크
  postController.putPost // 마지막으로 controller객체에 있는 request handler를 등록
);
// DELETE /api/v1/posts/:postId
postRouter.delete(
  "/:postId",
  postMiddleware.checkPostIdFrom("params"), // 특정 게시글을 삭제하기 위해서는 id가 필수이기에 미들웨어로 체크
  postController.deletePost // 마지막으로 controller객체에 있는 request handler를 등록
);
// POST /api/v1/posts/:postId/comments
postRouter.post(
  "/:postId/comments",
  commentMiddleware.checkCompleteCommentFrom("body"),
  postController.postPostComment
);
// GET /api/v1/posts/:postId/comments
postRouter.get("/:postId/comments", postController.getPostComments);
// PUT /api/v1/posts/:postId/comments/:commentId
postRouter.put(
  "/:postId/comments/:commentId",
  commentMiddleware.checkCommentContentFrom("body"),
  postController.putPostComment
);
// DELETE /api/v1/posts/:postId/comments/:commentId
postRouter.delete(
  "/:postId/comments/:commentId",
  postController.deletePostComment
);

module.exports = postRouter;
