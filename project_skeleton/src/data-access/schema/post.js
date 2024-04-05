const mongoose = require("mongoose");

// 게시글 저장을 위한 스키마 생성
// 게시글은 "타이틀", "내용", "작성자"의 세 가지 요소를 갖음
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  {
    collection: "Post", // Post라는 이름의 컬랙션에 저장하기 위해 명시적으로 기입, 이 부분이 빠지면 mongoose는 posts라는 복수형 lowercase 알파벳 이름으로 컬랙션을 생성해버림
    versionKey: false,
    timestamps: true, // 게시글 정보가 새로 컬랙션에 추가될 때 createdAt과 updatedAt값을 추가, 이후 해당 document가 수정되면 updatedAt을 갱신해줌
  }
);

module.exports = postSchema;
