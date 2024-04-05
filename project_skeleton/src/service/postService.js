const { postDAO, commentDAO } = require("../data-access");
const AppError = require("../misc/AppError");
const commonErrors = require("../misc/commonErrors");

/**
 * 아래로는 Persistence layer에 있는 객체와 위로는 Presentation layer에 있는 객체와 소통하는 객체의 클래스
 * Business layer에 속하며, Persistence layer에 있는 DAO 객체를 불러서 비즈니스에 필요한 데이터를 CRUD한다.
 * 중요한 점은 DB가 어떤 DB인지 관심이 없다(관심사 분리, DB agnostic). 자신이 사용하는 데이터는 오직 DAO 객체만을 통해 가져온다.
 * 비즈니스 로직을 담당한다. 레스토랑에서 "쉐프"와 같은 위치.
 * 레스토랑의 비유를 들자면 controller/middleware 함수는 주문 담당자, service 객체는 쉐프. 주문 담당자는 주문(DTO: Data Transfer Object)을 고객으로 부터 받아 쉐프에게 믿고 주문을 맡긴다.
 * 쉐프는 재료 관리자(DAO)로 부터 받은 재료를 가지고 잘 조리(business logic)해서 음식(DTO, 요청에 대한 응답을 위한 데이터)을 제공한다.
 *
 * 아래 service 객체는 단순한 로직(게시글 생성, 가져오기, 수정, 삭제)을 다루기 때문에 각 메소드들의 내용이 짧지만 비즈니스 로직일 복잡할 수록 코드가 길어진다.
 */
class PostService {
  // 게시글 생성 메소드
  async createPost({ title, content, author }) {
    // 아래 계층에 있는 DAO를 호출!
    const newPost = await postDAO.create({
      title,
      content,
      author,
    });
    return newPost;
  }
  // 특정 id를 갖는 하나의 게시글을 가져오는 메소드
  async getPost(id) {
    // 아래 계층에 있는 DAO를 호출!
    const post = await postDAO.findOne(id);
    return post;
  }
  // 특정 조건(title과 author)에 맞는 여러 개의 게시글을 가져오는 메소드
  async getPosts({ title, author }) {
    // 아래 계층에 있는 DAO를 호출!
    const posts = await postDAO.findMany({ title, author });
    return posts;
  }
  // 특정 id를 갖는 하나의 게시글을 업데이트하는 메소드
  async updatePost(id, { title, content, author }) {
    // 아래 계층에 있는 DAO를 호출!
    const updatedPost = await postDAO.updateOne(id, { title, content, author });
    if (updatedPost === null) {
      throw new AppError(
        commonErrors.resourceNotFoundError,
        "해당 게시글이 존재하지 않습니다",
        404
      );
    }
    return updatedPost;
  }
  // 특정 id를 갖는 하나의 게시글을 삭제하는 메소드
  async deletePost(id) {
    // 아래 계층에 있는 DAO를 호출!
    const deletedPost = await postDAO.deleteOne(id);
    if (deletedPost === null) {
      throw new AppError(
        commonErrors.resourceNotFoundError,
        "해당 게시글이 존재하지 않습니다",
        404
      );
    }
    return deletedPost;
  }

  async addComment(postId, { content, author }) {
    const newComment = await commentDAO.create({ postId, content, author });
    return newComment;
  }

  async getComments(postId) {
    const comments = await commentDAO.findMany({ postId });
    return comments;
  }

  async updateComment(postId, commentId, content) {
    const [isExistingPost, isExistingComment] = await Promise.all([
      postDAO.findById(postId).then((post) => post !== null),
      commentDAO
        .findByIdAndPostId(commentId, postId)
        .then((comment) => comment !== null),
    ]);

    if (!isExistingPost || !isExistingComment) {
      throw new AppError(
        commonErrors.resourceNotFoundError,
        "해당 게시물 또는 댓글이 존재하지 않습니다.",
        404
      );
    }

    const updatedComment = await commentDAO.updateOne(commentId, { content });
    return updatedComment;
  }

  async deleteComment(postId, commentId) {
    const [isExistingPost, isExistingComment] = await Promise.all([
      postDAO.findById(postId).then((post) => post !== null),
      commentDAO
        .findByIdAndPostId(commentId, postId)
        .then((comment) => comment !== null),
    ]);

    if (!isExistingPost || !isExistingComment) {
      throw new AppError(
        commonErrors.resourceNotFoundError,
        "해당 게시물 또는 댓글이 존재하지 않습니다.",
        404
      );
    }

    const deletedComment = await commentDAO.deleteOne(commentId);
    return deletedComment;
  }
}

module.exports = new PostService();
