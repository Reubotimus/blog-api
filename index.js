const express = require('express');
const path = require('path')
const cors = require('cors')
const prisma = require('./helpers/client');
const apiRouter = require('./routers/api-router')

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.json({message: "hello from main"}));
app.use('/api', apiRouter)

app.listen(process.env.PORT || 3000, () => console.log('listening on port 3000...'));

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);