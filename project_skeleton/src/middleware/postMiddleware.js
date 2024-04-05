const AppError = require("../misc/AppError");
const commonErrors = require("../misc/commonErrors");

// 미들웨어를 리턴하는 함수
// from은 어떤 값을 "어디"에서 체크해야하는지를 정하는 값
// e.g.
// - 만약 title이라는 값을 req.body에서 체크하고 싶다면 checkCompletePostFrom("body")
// - 만약 title이라는 값을 req.query에서 체크하고 싶다면 checkCompletePostFrom("query")
const checkCompletePostFrom = (from) => (req, res, next) => {
  const { title, content, author } = req[from];

  // 게시글에 타이틀이 없으면 안된다.
  if (title === undefined || title === "") {
    next(
      new AppError(
        commonErrors.requestValidationError,
        `${from}: title은 필수값입니다.`,
        400
      )
    );
    return;
  }
  // 게시글에 본문이 없으면 안된다.
  if (content === undefined || title === "") {
    next(
      new AppError(
        commonErrors.requestValidationError,
        `${from}: content는 필수값입니다.`,
        400
      )
    );
    return;
  }
  // 게시글에 작성자 정보가 없으면 안된다.
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
// - 만약 id이라는 값을 req.body에서 체크하고 싶다면 checkPostIdFrom("body")
// - 만약 id이라는 값을 req.query에서 체크하고 싶다면 checkPostIdFrom("query")
const checkPostIdFrom = (from) => (req, res, next) => {
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

// 위와 같은 미들웨어를 리턴하는 함수
// 게시글을 수정/삭제할 때 최소한의 조건을 체크해주는 미들웨어이다.
const checkMinPostConditionFrom = (from) => (req, res, next) => {
  const { title, content, author } = req[from];
  if (title === undefined && content === undefined && author === undefined) {
    next(
      new AppError(
        commonErrors.requestValidationError,
        `${from}: title, content, author중 최소 하나는 필요합니다.`,
        400
      )
    );
    return;
  }
  next();
};

module.exports = {
  checkCompletePostFrom,
  checkPostIdFrom,
  checkMinPostConditionFrom,
};
