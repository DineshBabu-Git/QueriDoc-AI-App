const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    retrievedChunks: [
      {
        text: String,
        chunkIndex: Number,
        relevanceScore: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for chat messages
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
