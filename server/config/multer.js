const multer = require("multer");
const path = require("path");

const { CloudinaryStorage } = require(
  "multer-storage-cloudinary"
);

const cloudinary = require(
  "../config/cloudinary"
);

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "queridoc-ai",

    resource_type: "raw",

    public_id:
      Date.now() +
      "-" +
      file.originalname.replace(
        /\s+/g,
        "-"
      ),
  }),
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/octet-stream",

    "text/plain",

    "text/markdown",

    "text/x-markdown",
  ];

  const allowedExts = [
    ".pdf",
    ".docx",
    ".txt",
    ".md",
  ];

  const ext = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedMimes.includes(file.mimetype) ||
    allowedExts.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${file.mimetype}". Only PDF, DOCX, TXT, and MD are allowed.`
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:
      parseInt(
        process.env.MAX_FILE_SIZE
      ) || 20971520, // 20MB
  },
});

module.exports = upload;