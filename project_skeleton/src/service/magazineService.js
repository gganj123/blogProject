const MagazinePost = require("../db/repository/magazinePostRepository");
const Like = require("../db/repository/likeRepository"); // Like 모델을 가져옵니다.
const Bookmark = require("../db/repository/bookmarkRepository");

const { ObjectId } = require("mongoose").Types;

// 매거진 포스트 생성
async function createMagazinePost(postData) {
  const newPost = await MagazinePost.create(postData);
  if (!newPost) {
    const error = new Error("매거진 포스트를 생성할 수 없습니다.");
    error.status = 500;
    throw error;
  }
  return newPost;
}

// 모든 매거진 포스트 가져오기
async function getAllMagazinePosts(searchQuery) {
  try {
    let query = {};

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");

      query = {
        $or: [
          { title: { $regex: regex } },
          { content: { $regex: regex } },
          { nickname: { $regex: regex } },
        ],
      };
    }

    const posts = await MagazinePost.find(query);
    if (!posts || posts.length === 0) {
      const error = new Error("매거진 글을 찾을 수 없습니다.");
      error.status = 404;
      throw error;
    }
    return posts;
  } catch (error) {
    throw error;
  }
}

// 특정 매거진 포스트 가져오기
async function getMagazinePostById(postId) {
  try {
    const post = await MagazinePost.findById(postId);
    if (!post) {
      const error = new Error(
        "postId에 해당하는 매거진 글을 찾을 수 없습니다."
      );
      error.status = 404;
      throw error;
    }
    return post;
  } catch (error) {
    throw error;
  }
}

// 매거진 포스트 업데이트
async function updateMagazinePost(postId, newData) {
  const updatedPost = await MagazinePost.findByIdAndUpdate(postId, newData, {
    new: true,
  });
  if (!updatedPost) {
    const error = new Error(
      "postId에 해당하는 매거진 포스트를 찾을 수 없습니다."
    );
    error.status = 404;
    throw error;
  }
  return updatedPost;
}

// 매거진 포스트 삭제
async function deleteMagazinePost(postId) {
  const deletedPost = await MagazinePost.findByIdAndDelete(postId);
  if (!deletedPost) {
    const error = new Error(
      "postId에 해당하는 매거진 포스트를 찾을 수 없습니다."
    );
    error.status = 404;
    throw error;
  }
  return deletedPost;
}

// 게시물의 좋아요를 처리하는 함수

async function magazineToggleLike(user_id, post_id) {
  try {
    const userId = new ObjectId(user_id);
    const postId = new ObjectId(post_id);

    const existingLike = await Like.findOne({
      user_id: userId,
      post_id: postId,
    });

    if (existingLike) {
      await MagazinePost.findByIdAndUpdate(postId, {
        $inc: { like_count: -1 },
      });
      await Like.findOneAndRemove({ user_id: userId, post_id: postId });
    } else {
      await MagazinePost.findByIdAndUpdate(postId, { $inc: { like_count: 1 } });
      await Like.create({ user_id: userId, post_id: postId });
    }

    const updatedPost = await MagazinePost.findById(postId);
    return updatedPost;
  } catch (error) {
    console.error("좋아요 토글 중 오류 발생:", error);
    throw error;
  }
}
// 매거진 포스트의 좋아요 상태 함수
async function getMagazinePostWithLikeStatus(post_id, user_id) {
  try {
    const postId = new ObjectId(post_id);
    const userId = new ObjectId(user_id);

    const magazinePost = await MagazinePost.findById(postId);
    if (!magazinePost) {
      throw new Error("매거진 포스트를 찾을 수 없습니다.");
    }

    const like = await Like.findOne({
      user_id: userId,
      post_id: postId,
    });

    const isLikedByUser = like ? true : false;

    return {
      magazinePost: magazinePost,
      isLikedByUser: isLikedByUser,
    };
  } catch (error) {
    console.error("매거진 포스트 정보 조회 중 오류 발생:", error);
    throw error;
  }
}
// 매거진의 북마크 상태 함수
async function getMagazinePostWithBookmarkStatus(post_id, user_id) {
  try {
    const postId = new ObjectId(post_id);
    const userId = new ObjectId(user_id);

    const magazinePost = await MagazinePost.findById(postId);
    if (!magazinePost) {
      throw new Error("매거진을 찾을 수 없습니다.");
    }

    const bookmark = await Bookmark.findOne({
      user_id: userId,
      post_id: postId,
    });

    const isBookmarkedByUser = bookmark ? true : false;

    return {
      magazine: magazinePost,
      isBookmarkedByUser: isBookmarkedByUser,
    };
  } catch (error) {
    console.error("매거진 정보 조회 중 오류 발생:", error);
    throw error;
  }
}

module.exports = {
  createMagazinePost,
  getAllMagazinePosts,
  getMagazinePostById,
  updateMagazinePost,
  deleteMagazinePost,
  magazineToggleLike,
  getMagazinePostWithLikeStatus,
  getMagazinePostWithBookmarkStatus,
};
