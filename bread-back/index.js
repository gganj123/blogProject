require('dotenv').config();
const express =  require('express');
const path = require('path');
const mongoose = require('mongoose');
const app  = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(process.cwd(), 'public')));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_DB_URI;


app.get('/', (req, res) => {
    res.send('hello express');
});

app.get('/api', (req, res) => {
    res.send('backend server');
});


mongoose.connect(MONGO_URI);
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log(' Connected to MongoDB')
})
const magazineRouter = require('../src/server/routes/magazinePostRoutes');
const breadRouter = require('../src/server/routes/breadRoutes');
const commentRouter = require('../src/server/routes/commentRoutes');
const postRouter = require('../src/server/routes/postRoutes');
const recipeRouter = require('../src/server/routes/recipeRoutes');
const reviewRouter = require('../src/server/routes/reviewRoutes');
const userRouter = require('../src/server/routes/userRoutes');
const likeRouter = require('../src/server/routes/likeRoutes');
const bookmarkRouter = require('../src/server/routes/bookmarkRoutes');


app.use('/api/magazines', magazineRouter);
app.use('/api/breads', breadRouter);
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);
app.use('/api/recipes', recipeRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);
app.use('/api/likes',likeRouter);
app.use('/api/bookmarks',bookmarkRouter);


// app.listen(port, () => console.log(`Server listening on port ${port}`));
app.listen(PORT, () => {
  console.log(`server listen ${PORT}`);
})

module.exports = app;
