const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// 유저 인증 미들웨어
async function authenticateUser(req, res, next) {
    try {
        // 클라이언트로부터 받은 사용자 정보
        const { email, password } = req.body;

        // 이메일로 사용자 찾기
        const user = await User.findOne({ email });

        // 사용자가 없는 경우
        if (!user) {
            return res.status(401).json({ success: false, message: '인증 실패: 이메일이나 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // 비밀번호가 올바르지 않은 경우
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '인증 실패: 이메일이나 비밀번호가 올바르지 않습니다.' });
        }

        // 사용자 정보를 요청 객체에 추가
        req.user = user;

        // 다음 미들웨어로 제어 전달
        next();
    } catch (error) {
        // 오류 발생 시 에러 응답
        res.status(500).json({ success: false, message: '서버 오류: 사용자 인증에 실패했습니다.', error: error.message });
    }
}

module.exports = authenticateUser;