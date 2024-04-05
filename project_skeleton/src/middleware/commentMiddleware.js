const AppError = require("../misc/AppError");
const commonErrors = require("../misc/commonErrors");

// 미들웨어를 리턴하는 함수
// from은 어떤 값을 "어디"에서 체크해야하는지를 정하는 값
// e.g.
// - 만약 title이라는 값을 req.body에서 체크하고 싶다면 checkCompleteCommentFrom("body")
// - 만약 title이라는 값을 req.query에서 체크하고 싶다면 checkCompleteCommentFrom("query")
const checkCompleteCommentFrom = (from) => (req, res, next) => {
  const { content, author } = req[from];
  // 댓글에 본문이 없으면 안된다.
  if (content === undefined || content === "") {
    next(
      new AppError(
        commonErrors.requestValidationError,
        `${from}: content는 필수값입니다.`,
        400
      )
    );
    return;
  }
  // 댓글에 작성자 정보가 없으면 안된다.
  if (author === undefined || author === "") {
    next(
      new AppError(
        commonErrors.requestValidationError,
        `${from}: author는 필수값입니다.`,
        400
      )
    );
    return;
  }
  next();
};

// 미들웨어를 리턴하는 함수
// from은 어떤 값을 "어디"에서 체크해야하는지를 정하는 값
// e.g.
// - 만약 id이라는 값을 req.body에서 체크하고 싶다면 checkCommentIdFrom("body")
// - 만약 id이라는 값을 req.query에서 체크하고 싶다면 checkCommentIdFrom("query")
const checkCommentIdFrom = (from) => (req, res, next) => {
  const { id } = req[from];
  // 게시글의 id 정보가 없으면 안된다.
  if (id === undefined) {
    next(
      new AppError(
        commonErrors.requestValidationError,
        `${from}: id는 필수값입니다.`,
        400
      )
    );
    return;
  }
  next();
};

const checkCommentContentFrom = (from) => (req, res, next) => {
  const { content } = req[from];
  if (content === undefined) {
    next(
      new AppError(
        commonErrors.requestValidationError,
        `${from}: contents는 필수값입니다.`,
        400
      )
    );
    return;
  }
  next();
};

module.exports = {
  checkCompleteCommentFrom,
  checkCommentContentFrom,
  checkCommentIdFrom,
};
