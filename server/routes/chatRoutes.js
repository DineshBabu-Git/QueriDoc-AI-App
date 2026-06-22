const express = require('express');
const {
  sendMessage,
  getChatHistory,
  getUserChats,
} = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/message', sendMessage);
router.get('/history/:documentId', getChatHistory);
router.get('/', getUserChats);

module.exports = router;
