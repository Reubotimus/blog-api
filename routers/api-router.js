const apiRouter = require('express').Router();
const {signIn, signUp, authenticate, isAdmin} = require('../controlers/sign-controller')
const {getPost, getPosts, postPost, deletePost} = require('../controlers/post-controller');
const { getComments, postComment, deleteComment } = require('../controlers/comment-controller');

apiRouter.post('/sign-in', signIn);
apiRouter.post('/sign-up', signUp);

apiRouter.post('/posts', authenticate, isAdmin, postPost);
apiRouter.delete('/posts/:postId', authenticate, isAdmin, deletePost)
apiRouter.get('/posts', getPosts);
apiRouter.get('/posts/:postId', getPost);

apiRouter.get('/posts/:postId/comments', getComments)
apiRouter.post('/posts/:postId/comments', authenticate, postComment)
apiRouter.delete('/posts/:postId/comments/:commentId', authenticate, isAdmin, deleteComment)

module.exports = apiRouter