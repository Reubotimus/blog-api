const prisma = require('../helpers/client');

async function getComments(req, res) {
    try {
        const comments = await prisma.comment.findMany({where: {postId: Number(req.params.postId)}})
        return res.status(200).json(comments)
    } catch (err) {
        return res.status(500).json(err.message);
    }
}

async function postComment(req, res) {
    try {
        await prisma.comment.create({data: {postId: Number(req.params.postId), userId: req.user.id, contents: req.body.contents}})
        return res.status(200).json({message: "created"})
    } catch (err) {
        return res.status(500).json(err.message)
    }

}

async function deleteComment(req, res) {
    await prisma.comment.delete({where: {id: Number(req.params.commentId)}})
    return res.status(200).json({message: "deleted"});
    

}
module.exports = {getComments, postComment, deleteComment}