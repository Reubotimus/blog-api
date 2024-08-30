const apiRouter = require('express').Router();
const {signIn, signUp, authenticate, isAdmin} = require('../controlers/sign-controller')
const {getPost, getPosts, postPost, deletePost} = require('../controlers/post-controller')

apiRouter.use(authenticate);
apiRouter.post('/sign-in', signIn);
apiRouter.post('/sign-up', signUp);

apiRouter.post('/posts', isAdmin, postPost);
apiRouter.delete('/posts/:postId', isAdmin, deletePost)
apiRouter.get('/posts', getPosts);
apiRouter.get('/posts/:postId', getPost);

module.exports = apiRouter