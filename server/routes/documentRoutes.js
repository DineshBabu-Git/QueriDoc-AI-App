const express = require('express');
const {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getUserDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
