const axios = require('axios');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const Document = require('../models/Document');
const User = require('../models/User');
const { extractDocumentText } = require('../services/documentExtraction');
const { createChunks } = require('../services/chunking');

// Maximum file size: 20MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 20971520;
// Maximum text content to store: 5MB (to prevent memory issues)
const MAX_TEXT_CONTENT_SIZE = 5 * 1024 * 1024;

// Remove an orphaned file from Cloudinary if something fails after upload
// but before the Document record is saved. Mirrors the previous
// fs.unlink(...).catch(() => {}) cleanup pattern, just targeting Cloudinary
// instead of the local disk (which no longer holds the file at all).
const cleanupCloudinaryFile = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log(`[CLEANUP] Removed orphaned Cloudinary file: ${publicId}`);
  } catch (error) {
    console.warn(`[CLEANUP] Could not remove Cloudinary file ${publicId}: ${error.message}`);
  }
};

// Upload document
const uploadDocument = async (req, res, next) => {
  // multer-storage-cloudinary has already streamed the file to Cloudinary by the time this handler runs. 
  // req.file.filename is the Cloudinary public_id and req.file.path is the Cloudinary (secure) URL.
  let uploadedPublicId = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    uploadedPublicId = req.file.filename;
    const cloudinaryFileUrl = req.file.path;

    // Validate file size
    if (req.file.size > MAX_FILE_SIZE) {
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    const { title } = req.body;
    if (!title || title.trim().length === 0) {
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: 'Please provide a document title',
      });
    }

    // Validate title length
    if (title.length > 200) {
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 200 characters',
      });
    }

    // Get file extension
    const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
    const validTypes = ['pdf', 'docx', 'txt', 'md'];

    if (!validTypes.includes(ext)) {
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Supported: PDF, DOCX, TXT, MD',
      });
    }

    console.log(`[UPLOAD] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Fetch the uploaded file's bytes back from Cloudinary so it can be extracted.
    // The file no longer exists on local disk (Render's filesystem is ephemeral), so extraction operates on an in-memory buffer downloaded from the Cloudinary URL instead.
    
    let fileBuffer;
    try {
      const response = await axios.get(cloudinaryFileUrl, {
        responseType: 'arraybuffer',
        timeout: parseInt(process.env.CLOUDINARY_FETCH_TIMEOUT_MS) || 30000,
      });
      fileBuffer = Buffer.from(response.data);
      console.log(`[UPLOAD] Downloaded file from Cloudinary: ${fileBuffer.length} bytes`);
    } catch (error) {
      console.error(`[UPLOAD] Failed to download file from Cloudinary: ${error.message}`);
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: 'Failed to retrieve uploaded file from storage',
      });
    }

    // Extract text from document
    let textContent;
    try {
      textContent = await extractDocumentText(fileBuffer, ext);
    } catch (error) {
      console.error(`[UPLOAD] Extraction failed: ${error.message}`);
      fileBuffer = null;
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: `Failed to extract text: ${error.message}`,
      });
    }

    // Release buffer from memory now that extraction is done
    fileBuffer = null;

    // Validate extracted content
    if (!textContent || textContent.trim().length === 0) {
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: 'Document contains no readable text',
      });
    }

    if (textContent.length > MAX_TEXT_CONTENT_SIZE) {
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: `Extracted text exceeds limit of ${MAX_TEXT_CONTENT_SIZE / 1024 / 1024}MB`,
      });
    }

    console.log(`[UPLOAD] Text extracted: ${textContent.length} characters`);

    // Create chunks
    let chunks;
    try {
      chunks = createChunks(
        textContent,
        parseInt(process.env.CHUNK_SIZE) || 1000,
        parseInt(process.env.CHUNK_OVERLAP) || 200
      );
      console.log(`[UPLOAD] Chunks created: ${chunks.length} chunks`);

      // Limit chunks stored to prevent memory issues
      const maxChunksToStore = 100;
      if (chunks.length > maxChunksToStore) {
        console.log(`[UPLOAD] Limiting chunks from ${chunks.length} to ${maxChunksToStore}`);
        chunks = chunks.slice(0, maxChunksToStore);
      }
    } catch (error) {
      console.error(`[UPLOAD] Chunking failed: ${error.message}`);
      textContent = null; // Release memory
      await cleanupCloudinaryFile(uploadedPublicId);
      return res.status(400).json({
        success: false,
        message: `Failed to process document: ${error.message}`,
      });
    }

    // Create document - store first 500KB of text and chunks
    const maxTextToStore = 500 * 1024; // 500KB
    const textToStore = textContent.substring(0, maxTextToStore);

    const document = new Document({
      userId: req.userId,
      title: title.trim(),
      filename: req.file.filename,
      fileUrl: cloudinaryFileUrl,
      cloudinaryPublicId: req.file.filename,
      cloudinaryUrl: cloudinaryFileUrl,
      fileType: ext,
      fileSize: req.file.size,
      textContent: textToStore,
      chunks,
    });

    console.log(`[UPLOAD] Saving document to database...`);

    // Release original text from memory
    textContent = null;
    await document.save();
    console.log(`[UPLOAD] Document saved: ${document._id}`);

    // Update user document count
    await User.findByIdAndUpdate(req.userId, { $inc: { documentCount: 1 } });
    console.log(`[UPLOAD] User document count incremented`);

    // Don't return full textContent in response to save bandwidth
    const responseDoc = document.toObject();
    delete responseDoc.textContent;
    delete responseDoc.chunks;

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: responseDoc,
    });
  } catch (error) {
    console.error(`[UPLOAD] Unexpected error: ${error.message}`);
    if (uploadedPublicId) {
      await cleanupCloudinaryFile(uploadedPublicId);
    }
    next(error);
  } finally {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
};

// Get user documents
const getUserDocuments = async (req, res, next) => {
  try {
    console.log(`[GET DOCS] Fetching documents for user: ${req.userId}`);

    const documents = await Document.find({ userId: req.userId })
      .select('_id title fileType fileSize createdAt chatCount')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[GET DOCS] Found ${documents.length} documents`);

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(`[GET DOCS] Error: ${error.message}`);
    next(error);
  }
};

// Get document by ID
const getDocumentById = async (req, res, next) => {
  try {
    console.log(`[GET DOC] Fetching document: ${req.params.id}`);

    const document = await Document.findById(req.params.id);

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

    console.log(`[GET DOC] Document retrieved: ${document._id}`);

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(`[GET DOC] Error: ${error.message}`);
    next(error);
  }
};

// Update document
const updateDocument = async (req, res, next) => {
  try {
    console.log(`[UPDATE DOC] Updating document: ${req.params.id}`);

    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new title',
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 200 characters',
      });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.userId.toString() !== req.userId) {
      console.warn(`[UPDATE DOC] Unauthorized access attempt to document: ${req.params.id}`);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    document.title = title.trim();
    await document.save();

    console.log(`[UPDATE DOC] Document updated: ${document._id}`);

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      document: { _id: document._id, title: document.title },
    });
  } catch (error) {
    console.error(`[UPDATE DOC] Error: ${error.message}`);
    next(error);
  }
};

// Delete document
const deleteDocument = async (req, res, next) => {
  try {
    console.log(`[DELETE DOC] Deleting document: ${req.params.id}`);

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.userId.toString() !== req.userId) {
      console.warn(`[DELETE DOC] Unauthorized access attempt to document: ${req.params.id}`);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Delete file from Cloudinary. Fall back to `filename` for any documents created before cloudinaryPublicId existed, since filename already stores the Cloudinary public_id under the current multer config.
    const publicId = document.cloudinaryPublicId || document.filename;
    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        console.log(`[DELETE DOC] Cloudinary file deleted: ${publicId} (${result.result})`);
      } catch (error) {
        console.warn(`[DELETE DOC] Could not delete Cloudinary file: ${error.message}`);
      }
    }

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);
    console.log(`[DELETE DOC] Document deleted from database: ${req.params.id}`);

    // Update user document count
    await User.findByIdAndUpdate(req.userId, { $inc: { documentCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error(`[DELETE DOC] Error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};