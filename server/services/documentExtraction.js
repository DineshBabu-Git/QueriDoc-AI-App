const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Extract text from PDF
// NOTE: previously read from a local disk path via fs.readFile(filePath).
// Now receives the file contents directly as a Buffer (downloaded from
// Cloudinary by the caller), so this works identically whether the bytes
// originated from local disk or remote storage.
const extractPDF = async (fileBuffer) => {
  try {
    console.log(`[PDF] Extracting text from buffer: ${fileBuffer.length} bytes`);

    const data = await pdfParse(fileBuffer);
    console.log(`[PDF] Extraction complete: ${data.text.length} characters`);

    return data.text;
  } catch (error) {
    console.error(`[PDF] Extraction failed: ${error.message}`);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

// Extract text from DOCX
const extractDOCX = async (fileBuffer) => {
  try {
    console.log(`[DOCX] Extracting text from buffer: ${fileBuffer.length} bytes`);

    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    console.log(`[DOCX] Extraction complete: ${result.value.length} characters`);

    return result.value;
  } catch (error) {
    console.error(`[DOCX] Extraction failed: ${error.message}`);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
};

// Extract text from TXT or MD
const extractText = async (fileBuffer) => {
  try {
    console.log(`[TEXT] Extracting text from buffer: ${fileBuffer.length} bytes`);
    const text = fileBuffer.toString('utf-8');
    console.log(`[TEXT] Extraction complete: ${text.length} characters`);
    return text;
  } catch (error) {
    console.error(`[TEXT] Extraction failed: ${error.message}`);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};

// Main extraction function
// fileBuffer: Buffer containing the raw file bytes (already fetched by the caller)
// fileType: 'pdf' | 'docx' | 'txt' | 'md'
const extractDocumentText = async (fileBuffer, fileType) => {
  try {
    console.log(`[EXTRACT] Processing ${fileType} file: ${fileBuffer.length} bytes`);
    switch (fileType) {
      case 'pdf':
        return await extractPDF(fileBuffer);
      case 'docx':
        return await extractDOCX(fileBuffer);
      case 'txt':
      case 'md':
        return await extractText(fileBuffer);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`[EXTRACT] Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  extractDocumentText,
};