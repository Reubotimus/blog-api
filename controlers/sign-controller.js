const prisma = require('../helpers/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require("express-validator");

async function signIn(req, res) {
    let { username, password } = req.body;
    let user = await prisma.user.findUnique({where: { username }});
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Auth Failed" })
    }
    
    //token expires in 2min
    const token = jwt.sign({ username }, process.env.SECRET, {expiresIn: '1d'});
    return res.status(200).json({
        message: "Auth Passed",
        token
    })
    
}

async function authenticate(req, res, next) {
    console.log('authenticating');
    if (req.path === '/sign-in' || req.path === '/sign-up') {return next()}
    const bearerHeader = req.headers['authorization'];
    let data;
    try {
        if(!bearerHeader) {
            throw new Error("Auth token not given");
        }
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, process.env.SECRET, (err, authData) => {
            if(err) {
                throw new Error("invalid token")
            }
            data = authData
        });
        req.user = await prisma.user.findUnique({where: {username: data["username"]}});
        if (!req.user) {
            throw new Error("invalid username in token")
        }
        console.log('valid user')
        return next()
    } catch(err) {
        return res.status(401).json({ message: err.message, data })
    }
}

async function isAdmin(req, res, next) {
    console.log('checking if admit');
    const admin = await prisma.admin.findUnique({where: {userId: req.user.id}});
    if (!admin) return res.status(403).json({message: "requires admin status"});
    console.log('user is admin')
    next();
}

async function postEndpoint(req, res, next) {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if (err) { return res.status(500) }
            try {
                await prisma.user.create({data: {
                        username: req.body.username,
                        password: hashedPassword,
                    }})
            } catch (err) {
                return res.status(500)
            }});
    } else {
        return res.status(400).json({message: errors.array()})
    }
}

const signUp = [
    body('username', 'please enter a username').notEmpty(),
    body('username', 'sorry this username has already been taken')
        .custom(async username => {
            const user = await prisma.user.findUnique({ where: { username: username } });
            if (user == null) {
                return true;
            }
            throw new error('sorry this username has already been taken')
        })
        .withMessage('Sorry, username has already been taken'),
    body('password', 'please enter a password between 5 and 30 characters long')
        .isLength(5, 30),
    postEndpoint
]

module.exports = {signIn, signUp, authenticate, isAdmin}
