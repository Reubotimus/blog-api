const prisma = require('../helpers/client');
const multer = require('multer');
const AWS =    require('aws-sdk');

class HttpError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
const upload = multer({ storage: multer.memoryStorage() });
const s3 = new AWS.S3({
    endpoint: 'https://db4a7c641126431f6cd519184dced40a.r2.cloudflarestorage.com',
    region: 'auto',
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    s3ForcePathStyle: true // Necessary for Cloudflare R2
});

async function uploadFile(req, res, next) {
    console.log('uploading')
    console.log(req.body);
    // Add file name to db and get id
    try {
        let post = await prisma.post.create({data: {title: req.body.title}});
        if (!post) return res.status(400).send({message: "error adding file to db"});
        console.log('added to db')
        const params = {
            Bucket: 'blog',
            Key: '' + post.id,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };
        s3.upload(params, (err, data) => {
            if (err) {
                throw err;
            }
        });
        return res.status(200).json({message: "successfully added post"})
    } catch (err) {
        return res.status(500).message({message: err.message})
    }
}

const postPost = [upload.single('file'), uploadFile];


async function getPost(req, res) {
    try {
        const post = await prisma.post.findUnique({where: {id: Number(req.params.postId)}});
        if (!post) {
            throw new HttpError("unable to find post", 404);
        }
        const params = {
            Bucket: 'blog',
            Key: req.params.postId
        };
        s3.getObject(params, (err, data) => {
            if (err) {
                throw new HttpError("Error getting post", 500);
            }
    
            // Set headers for download
            res.setHeader('Content-Disposition', 'attachment; filename=' + post.title);
            res.setHeader('Content-Type', data.ContentType);
    
            res.send(data.Body);
        });
    } catch(err) {
        return res.status(err.status).json({message: err.message})
    }
}

async function deletePost(req, res) {
    try {
        let file = await prisma.post.findUnique({where: {id: Number(req.params.postId)}});
        if (!file) {
            return res.status(404).json({message: "file does not exist"});
        }
        const params = {
            Bucket: 'blog',
            Key: req.params.postId
        };
        await s3.deleteObject(params).promise();
        await prisma.post.delete({where: {id: Number(req.params.postId)}});
        return res.status(200).json({message: "successfull deletion"})
    } catch (err) {
        return res.status(500).json({...err, message: "error when deleting your post"});
    }
}

async function getPosts(req, res) {
    try {
        const posts = await prisma.post.findMany();
        return res.status(200).json({posts})
    } catch (err) {
        return res.status(500).json({message: "unable to find posts"});
    }
}

module.exports = {getPost, getPosts, postPost, deletePost}