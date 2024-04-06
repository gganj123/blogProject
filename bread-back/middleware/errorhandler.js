function handleBadRequest(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: '잘못된 요청 형식입니다.' });
    }
    next(err);
}

// 401 Unauthorized 에러 핸들러
function handleUnauthorized(err, req, res, next) {
    if (err.status === 401) {
        return res.status(401).json({ message: '인증되지 않았거나 인증 자격 증명이 유효하지 않습니다.' });
    }
    next(err);
}

// 403 Forbidden 에러 핸들러
function handleForbidden(err, req, res, next) {
    if (err.status === 403) {
        return res.status(403).json({ message: '요청한 리소스에 접근할 수 있는 권한이 없습니다.' });
    }
    next(err);
}

// 404 Not Found 에러 핸들러
function handleNotFound(err, req, res, next) {
    if (err.status === 404) {
        return res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
    }
    next(err);
}

// 500 Internal Server Error 에러 핸들러
function handleInternalServerError(err, req, res, next) {
    console.error(err.stack); // 에러 로그 출력
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
}

module.exports = {
    handleBadRequest,
    handleUnauthorized,
    handleForbidden,
    handleNotFound,
    handleInternalServerError
};

