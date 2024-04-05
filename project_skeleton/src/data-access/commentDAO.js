const { Comment } = require("./model");
const utils = require("../misc/utils");

class CommentDAO {
  // 새로운 댓글 document 객체를 생성하여 DB에 저장하는 메소드
  async create({ postId, content, author }) {
    // 모델 클래스로 댓글 document 객체를 생성하고
    const comment = new Comment({ postId, content, author });
    // 모델 객체의 save 메소드를 호출하여 댓글 요소(postId, content, author)들을 검증하고 저장. 검증하는 과정 중 문제가 있으면 에러 발생.
    await comment.save();
    // comment 객체는 값만 있는 객체가 아닌 메소드까지 포함한 non-POJO 객체이다. toObject를 이용해서 POJO로 바꿔주자.
    return comment.toObject();
  }

  // 댓글 ID와 post ID로 DB에서 댓글 document 객체를 찾아오는 메소드
  async findByIdAndPostId(id, postId) {
    const plainComment = await Comment.find({ _id: id, postId }).lean();
    return plainComment;
  }
  // 특정 조건(filter)에 맞는 복수의 댓글 document 객체를 찾아오는 메소드
  // filter는 일반 JS 객체로 mongoose의 모델 객체의 find 메소드를 부를 때 사용하는 조건 필터링용 객체이다.
  async findMany({ postId, author }) {
    // utils.sanitizeObject함수를 사용해서 { postId, author } 객체 내부에 undefined로 할당 되어있는 값들을 다 없애준다(데이터 클렌징).
    // e.g. utils.sanitizeObject({ a: undefined, b: 1 })의 결과는 { b: 1 }이다.
    // 이 함수는 의도하지 않았거나 예상하지 못한 조건을 없애기 위해 사용한다.
    const sanitizedFilter = utils.sanitizeObject({
      postId,
      author,
    });
    // 정리가된 필터 조건으로 DB로부터 댓글 document 객체들을 가져오며 이번에도 lean을 사용해서 POJO 형식(+배열에 담긴 형태)으로 가져온다.
    const plainComments = await Comment.find(sanitizedFilter).lean();
    return plainComments;
  }
  // 특정 id를 _id로 갖고 있는 댓글 document를 toUpdate 객체의 내용으로 덮어 씌운다(overwrite).
  // 덮어 씌우는 것이기 때문에 잘못된 값이 의도치 않게 들어가면 문제가 발생할 수 있다.
  // 그렇기 때문에 사전에 utils.sanitizeObject로 데이터 클렌징을 한 번 해준다.
  async updateOne(id, { content, author }) {
    const sanitizedToUpdate = utils.sanitizeObject({
      content,
      author,
    });
    // 해당 id를 갖는 댓글 document를 먼저 찾고 있으면 업데이트하는 메소드
    // "하나"의 document를 업데이트하며,
    // updateOne 메소드와의 차이점은 이 메소드는 document 객체(기본적으로 업데이트 전의 document)를 리턴하는 반면
    // updateOne 메소드는 아래와 같은 값들을 리턴한다:
    // - matchedCount
    // - modifiedCount
    // - acknowledged
    // - upsertedId
    // - upsertedCount
    // 업데이트 후 바로 document 객체가 필요하다면 findByIdAndUpdate가 사용하기 편하다.
    const plainUpdatedComment = await Comment.findByIdAndUpdate(
      id, // document의 id이며 이는 곧 mongoDB에 저장된 _id에 저장된 값이다.
      sanitizedToUpdate, // update할 객체의 모습, 원래 update는 { $set: { content: 'hello world', author: 'someone' } } 이런식으로 $set을 명시해줘야하지만 여기서는 생략해줘도 된다
      {
        runValidators: true, // 기본적으로 findOneAnd*의 형식의 메소드들은 schema 체크를 안한다. 이 옵션을 true로 해주면 schema 체크(업데이트 될 데이터에 대한 검증)를 진행한다.
        new: true, // 기본적으로 findOneAnd*의 형식의 메소드들은 업데이트 전의 document를 리턴한다. 업데이트 후의 document를 리턴받기 위해서는 이 옵션을 true로 해주면 된다.
      }
    ).lean(); // 여기서도 lean을 사용하여 POJO를 리턴 받자.
    return plainUpdatedComment;
  }
  // 특정 id를 _id로 갖고 있는 댓글 document를 삭제한다(hard delete).
  async deleteOne(id) {
    // 위의 findByIdAndUpdate와 비슷하지만 update가 아니라 delete를 하며, 삭제된 document 객체를 반환한다.
    const plainDeletedComment = await Comment.findByIdAndDelete(id).lean(); // 여기서도 lean을 사용하여 POJO를 리턴 받자.
    return plainDeletedComment;
  }
}

module.exports = new CommentDAO();
