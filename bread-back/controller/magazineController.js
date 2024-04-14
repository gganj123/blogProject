const magazineService = require("../service/magazinePostService");
const magazineValidator = require("../validation/magazinePostValidation");
const Like = require("../db/repository/likeRepository");
const MagazinePost = require("../db/repository/magazinePostRepository");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const { accessTokenSecret } = config;

async function createMagazinePost(req, res, next) {
  try {
    const validationResult = magazineValidator.validateMagazinePostCreateReq(
      req.body
    );
    if (validationResult.error) {
      throw validationResult.error;
    }

    const transformedData = validationResult.value;

    const newMagazinePost = await magazineService.createMagazinePost(
      transformedData
    );

    res.status(201).json(newMagazinePost);
  } catch (error) {
    next(error);
  }
}
// 매거진 포스트 생성 컨트롤러
// async function createMagazinePost(req, res, next) {
//     try {
//         const postData = req.body;
//         const newPost = await magazineService.createMagazinePost(postData);
//         res.status(201).json(newPost);
//     } catch (error) {
//         // res.status(500).json({ message: error.message });
//         next(error);
//       }
// }

// 모든 매거진 포스트 가져오기 컨트롤러
// async function getAllMagazinePosts(req, res, next) {
//   try {
//     if (req.query.q) {
//       // 검색어가 있는 경우
//       const searchQuery = req.query.q;
//       const posts = await magazineService.getAllMagazinePosts(searchQuery);
//       res.json(posts);
//     } else {
//       // 검색어가 없는 경우
//       const posts = await magazineService.getAllMagazinePosts();
//       res.json(posts);
//     }
//   } catch (error) {
//     next(error);
//   }
// }
async function getAllMagazinePosts(req, res, next) {
  try {
    let limit = req.query.limit ? parseInt(req.query.limit) : null;
    let searchQuery = req.query.q || null;

    const posts = await magazineService.getAllMagazinePosts(searchQuery, limit);
    res.json(posts);
  } catch (error) {
    next(error);
  }
}

// 특정 매거진 포스트 가져오기 컨트롤러
// async function getMagazinePostById(req, res, next) {
//   try {
//     const postId = req.params.id;
//     const post = await magazineService.getMagazinePostById(postId);
//     if (!post) {
//       res.status(404).json({ message: "매거진 포스트를 찾을 수 없습니다." });
//       return;
//     }
//     res.json(post);
//   } catch (error) {
//     // res.status(500).json({ message: error.message });
//     next(error);
//   }
// }

// 특정 매거진 포스트 가져오기 컨트롤러
async function getMagazinePostById(req, res, next) {
  const postId = req.params.id; // 요청에서 postId 파라미터 추출

  try {
    // 매거진 포스트를 데이터베이스에서 조회합니다.
    const post = await MagazinePost.findById(postId);

    // 매거진 포스트가 존재하지 않는 경우 404 에러를 발생시킵니다.
    if (!post) {
      const error = new Error(
        "postId에 해당하는 매거진 글을 찾을 수 없습니다."
      );
      error.status = 404;
      throw error;
    }

    // 헤더에서 accessToken 가져오기
    const authorizationHeader = req.headers.authorization;
    let beLike = false; // 좋아요 상태 기본값은 false로 설정

    if (authorizationHeader) {
      const accessToken = authorizationHeader.split(" ")[1];
      // accessToken이 존재하는 경우에만 좋아요 상태 확인
      const decodedToken = jwt.verify(accessToken, accessTokenSecret);
      const like = await Like.findOne({
        user_id: decodedToken.userId,
        post_id: postId,
      });
      beLike = like ? true : false;
    }

    // 매거진 포스트와 좋아요 상태를 응답으로 반환합니다.
    res.json({ ...post.toObject(), beLike });
  } catch (error) {
    next(error); // 에러가 발생한 경우 에러 핸들러로 전달합니다.
  }
}
// 매거진 포스트 업데이트 컨트롤러
async function updateMagazinePost(req, res, next) {
  try {
    const validationResult = magazineValidator.validateMagazinePostCreateReq(
      req.body
    );
    if (validationResult.error) {
      throw validationResult.error;
    }

    const postId = req.params.id;
    const newData = validationResult.value;
    const updatedPost = await magazineService.updateMagazinePost(
      postId,
      newData
    );
    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
}

// 매거진 포스트 삭제 컨트롤러
async function deleteMagazinePost(req, res, next) {
  try {
    const postId = req.params.id;
    const deletedPost = await magazineService.deleteMagazinePost(postId);
    res.json(deletedPost);
  } catch (error) {
    // res.status(500).json({ message: error.message });
    next(error);
  }
}

// 게시물 좋아요 토글 컨트롤러
async function magazineToggleLikeController(req, res) {
  const { user_id, post_id } = req.body;

  try {
    // 좋아요 토글 함수 호출
    const updatedPost = await magazineService.magazineToggleLike(
      user_id,
      post_id
    );

    // 클라이언트에 업데이트된 게시물 데이터 전송
    res.json(updatedPost);
  } catch (error) {
    // 에러 발생 시 에러 메시지 전송
    console.error("좋아요 토글 중 오류 발생:", error);
    res.status(500).json({ error: "서버 오류" });
  }
}

//게시물 좋아요 상태 호출
async function getMagazinePostWithLikeStatusController(req, res, next) {
  const { post_id } = req.params;
  const user_id = req.body.user_id; // 가정: 사용자 ID는 요청 객체의 user 속성에 저장되어 있음
  try {
    const postInfo = await magazineService.getMagazinePostWithLikeStatus(
      post_id,
      user_id
    );
    res.json(postInfo);
  } catch (error) {
    console.error("매거진 포스트 정보 조회 중 오류 발생:", error);
    res.status(500).json({
      message: "매거진 포스트 정보를 가져오는 중 오류가 발생했습니다.",
    });
  }
}

// 매거진 포스트의 북마크 상태 호출
async function getMagazinePostWithBookmarkStatusController(req, res, next) {
  const { post_id } = req.params;
  const user_id = req.body.user_id; // 가정: 사용자 ID는 요청 객체의 user 속성에 저장되어 있음
  try {
    const postInfo = await magazineService.getMagazinePostWithBookmarkStatus(
      post_id,
      user_id
    );
    res.json(postInfo);
  } catch (error) {
    console.error("매거진 포스트 정보 조회 중 오류 발생:", error);
    res.status(500).json({
      message: "매거진 포스트 정보를 가져오는 중 오류가 발생했습니다.",
    });
  }
}

module.exports = {
  createMagazinePost,
  getAllMagazinePosts,
  getMagazinePostById,
  updateMagazinePost,
  deleteMagazinePost,
  magazineToggleLikeController,
  getMagazinePostWithLikeStatusController,
  getMagazinePostWithBookmarkStatusController,
};
