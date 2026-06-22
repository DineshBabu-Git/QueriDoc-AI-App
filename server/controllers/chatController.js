const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Document = require('../models/Document');
const { retrieveRelevantChunks } = require('../services/retrieval');
const { getGeminiResponse } = require('../services/gemini');

// Send chat message
const sendMessage = async (req, res, next) => {
  try {
    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide documentId and message',
      });
    }

    // Verify document exists and user has access
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      userId: req.userId,
      documentId,
    });

    if (!chat) {
      chat = new Chat({
        userId: req.userId,
        documentId,
        title: `Chat - ${document.title}`,
      });
      await chat.save();
    }

    // Retrieve relevant chunks
    const relevantChunks = retrieveRelevantChunks(message, document.chunks, 3);

    // Build context from relevant chunks
    const context = relevantChunks
      .map(chunk => chunk.text || chunk._doc?.text || '')
      .filter(Boolean)
      .join('\n\n---\n\n');

    // Get Gemini response
    let assistantResponse;
    try {
      assistantResponse = await getGeminiResponse(message, context);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to generate response: ${error.message}`,
      });
    }

    // Save user message
    const userMessage = new Message({
      chatId: chat._id,
      documentId,
      userId: req.userId,
      role: 'user',
      content: message,
      retrievedChunks: relevantChunks.map(chunk => ({
        text: chunk.text || chunk._doc?.text || '',
        chunkIndex: chunk.chunkIndex || chunk._doc?.chunkIndex,
        relevanceScore: chunk.relevanceScore,
      })),
    });

    await userMessage.save();

    // Save assistant message
    const assistantMsg = new Message({
      chatId: chat._id,
      documentId,
      userId: req.userId,
      role: 'assistant',
      content: assistantResponse,
    });

    await assistantMsg.save();

    // Update chat message count
    chat.messageCount = await Message.countDocuments({ chatId: chat._id });
    await chat.save();

    // Increment document chatCount so the Dashboard card reflects activity
    await Document.findByIdAndUpdate(documentId, { $inc: { chatCount: 1 } });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      chat: {
        id: chat._id,
        userMessage: userMessage.content,
        assistantMessage: assistantResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get chat history
const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // Verify document exists and user has access
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Get chat for this document
    const chat = await Chat.findOne({
      userId: req.userId,
      documentId,
    });

    if (!chat) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    // Get messages
    const messages = await Message.find({ chatId: chat._id })
      .select('role content createdAt')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// Get user chats
const getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .populate('documentId', 'title')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getUserChats,
};
