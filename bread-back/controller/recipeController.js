const recipeService = require("../service/recipeService");
const recipeValidation = require("../validation/recipeValidation");
const Like = require("../db/repository/likeRepository");
const Bookmark = require("../db/repository/bookmarkRepository");
const Recipe = require("../db/repository/recipeRepository");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const { accessTokenSecret } = config;

// 레시피 생성 컨트롤러
async function createRecipe(req, res, next) {
  try {
    const recipeData = req.body;

    // 요청 데이터의 유효성 검사
    const validationResult =
      recipeValidation.validateRecipeCreateReq(recipeData);
    if (validationResult.error) {
      throw validationResult.error;
    }

    // 레시피 생성
    const newRecipe = await recipeService.createRecipe(validationResult.value);
    res.status(201).json(newRecipe);
  } catch (error) {
    next(error);
  }
}

// 모든 레시피를 가져오는 컨트롤러
async function getAllRecipes(req, res, next) {
  try {
    let searchQuery = req.query.q || null;
    let limit = req.query.limit ? parseInt(req.query.limit) : null;
    let sortBy = req.query.sort || null;

    // 레시피 서비스를 통해 레시피를 가져옵니다.
    const recipes = await recipeService.getAllRecipes(
      searchQuery,
      limit,
      sortBy
    );

    // 클라이언트에게 레시피를 반환합니다.
    res.json(recipes);
  } catch (error) {
    // 오류가 발생한 경우 오류를 처리합니다.s
    next(error);
  }
}

//특정 레시피 조회 함수
async function getRecipeById(req, res, next) {
  const postId = req.params.id; // 요청에서 recipeId 파라미터 추출

  try {
    // 레시피를 데이터베이스에서 조회합니다.
    const recipe = await Recipe.findById(postId);

    // 레시피가 존재하지 않는 경우 404 에러를 발생시킵니다.
    if (!recipe) {
      const error = new Error("recipeId에 해당하는 레시피를 찾을 수 없습니다.");
      error.status = 404;
      throw error;
    }

    // 헤더에서 accessToken 가져오기
    const authorizationHeader = req.headers.authorization;
    let beLike = false; // 좋아요 상태 기본값은 false로 설정
    let beBookmark = false; // 북마크 상태 기본값은 false로 설정

    if (authorizationHeader) {
      const accessToken = authorizationHeader.split(" ")[1];
      // accessToken이 존재하는 경우에만 좋아요 상태 및 북마크 상태 확인
      const decodedToken = jwt.verify(accessToken, accessTokenSecret);
      const like = await Like.findOne({
        user_id: decodedToken.userId,
        post_id: postId,
      });
      beLike = like ? true : false;

      const bookmark = await Bookmark.findOne({
        user_id: decodedToken.userId,
        post_id: postId,
      });
      beBookmark = bookmark ? true : false;
    }

    // 레시피와 좋아요 상태, 북마크 상태를 응답으로 반환합니다.
    res.json({ ...recipe.toObject(), beLike, beBookmark });
  } catch (error) {
    next(error); // 에러가 발생한 경우 에러 핸들러로 전달합니다.
  }
}

// 레시피 업데이트 컨트롤러
async function updateRecipe(req, res, next) {
  try {
    const recipeId = req.params.id;
    const newData = req.body;

    // 요청 데이터의 유효성 검사
    const validationResult = recipeValidation.validateRecipeUpdateReq(newData);
    if (validationResult.error) {
      throw validationResult.error;
    }

    // 레시피 업데이트
    const updatedRecipe = await recipeService.updateRecipe(
      recipeId,
      validationResult.value
    );
    res.json(updatedRecipe);
  } catch (error) {
    next(error);
  }
}

// 레시피 삭제 컨트롤러
async function deleteRecipe(req, res, next) {
  try {
    const recipeId = req.params.id;
    const deletedRecipe = await recipeService.deleteRecipe(recipeId);
    res.json(deletedRecipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
}

// 레시피 선택 삭제 컨트롤러
async function deleteRecipes(req, res, next) {
  try {
    const recipeIds = req.body.recipeIds;
    const deletedRecipes = await recipeService.deleteRecipes(recipeIds);
    res.json(deletedRecipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
}

// 게시물 좋아요 토글 컨트롤러
async function recipeToggleLikeController(req, res) {
  const { user_id, post_id } = req.body;

  try {
    // 좋아요 토글 함수 호출
    const updatedPost = await recipeService.recipeToggleLike(user_id, post_id);

    // 클라이언트에 업데이트된 게시물 데이터 전송
    res.json(updatedPost);
  } catch (error) {
    // 에러 핸들러로 전달
    next(error);
  }
}

// 레시피 북마크 토글 컨트롤러
async function recipeToggleBookmarkController(req, res, next) {
  const { user_id, post_id } = req.body;

  try {
    // 레시피 북마크 토글 함수 호출
    const updatedRecipe = await recipeService.recipeToggleBookmark(
      user_id,
      post_id
    );

    // 클라이언트에 업데이트된 레시피 데이터 전송
    res.json(updatedRecipe);
  } catch (error) {
    // 에러 핸들러로 전달
    next(error);
  }
}

// 레시피 좋아요 상태 호출
async function getRecipeWithLikeStatusController(req, res, next) {
  const { post_id } = req.params;
  const user_id = req.body.user_id; // 가정: 사용자 ID는 요청 객체의 user 속성에 저장되어 있음
  try {
    const postInfo = await recipeService.getRecipeWithLikeStatus(
      post_id,
      user_id
    );
    res.json(postInfo);
  } catch (error) {
    // 에러 핸들러로 전달
    next(error);
  }
}

// 레시피 북마크 상태 호출
async function getRecipeWithBookmarkStatusController(req, res, next) {
  const { post_id } = req.params;
  const user_id = req.body.user_id; // 가정: 사용자 ID는 요청 객체의 user 속성에 저장되어 있음
  try {
    const postInfo = await recipeService.getRecipeWithBookmarkStatus(
      post_id,
      user_id
    );
    res.json(postInfo);
  } catch (error) {
    // 에러 핸들러로 전달
    next(error);
  }
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  deleteRecipes,
  recipeToggleLikeController,
  recipeToggleBookmarkController,
  getRecipeWithLikeStatusController,
  getRecipeWithBookmarkStatusController,
};
