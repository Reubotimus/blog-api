const apiRouter = require('express').Router();
const {signIn, signUp, authenticate} = require('../controlers/sign-controller')

apiRouter.use(authenticate);
apiRouter.post('/sign-in', signIn);
apiRouter.post('/sign-up', signUp);
apiRouter.get('/something', (req, res) => res.json({message: "hello"}))
module.exports = apiRouter