const mongoose = require("mongoose");
const { commentSchema } = require("../schema");

// commentSchema 이용하여 Comment 모델 클래스를 생성. 이후 commentDAO 객체가 이 클래스를 사용해서 mongoDB를 향해 CRUD를 수행함.
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
