const express = require('express');
const prisma = require('./helpers/client');
const apiRouter = require('./routers/api-router')
const app = express();

app.get('/', (req, res) => res.send('hello world'));
app.use('/api', apiRouter)

app.listen(process.env.PORT || 3000, () => console.log('listening on port 3000...'));

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);