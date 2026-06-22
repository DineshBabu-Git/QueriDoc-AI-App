const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a document title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    filename: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    // Cloudinary public_id, used to delete the asset from Cloudinary storage.
    // Equal to `filename` for documents uploaded after the Cloudinary
    // migration; kept as a separate explicit field per architecture
    // requirements and to avoid any ambiguity about what `filename` means.
    cloudinaryPublicId: {
      type: String,
    },
    // Cloudinary secure URL for the stored file. Equal to `fileUrl` for
    // documents uploaded after the Cloudinary migration.
    cloudinaryUrl: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'md'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    textContent: {
      type: String,
      required: true,
    },
    chunks: [
      {
        text: String,
        keywords: [String],
        chunkIndex: Number,
      },
    ],
    chatCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user documents
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, title: 'text' });

module.exports = mongoose.model('Document', documentSchema);