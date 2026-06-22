const STOP_WORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'from', 'have', 'will',
  'been', 'were', 'they', 'their', 'what', 'when', 'where', 'which',
  'there', 'then', 'than', 'also', 'into', 'some', 'your', 'more',
  'would', 'could', 'should', 'about', 'after', 'before', 'these',
  'those', 'them', 'such', 'each', 'just', 'like', 'over', 'very',
]);

// Chunk text into smaller pieces
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let startIndex = 0;
  const maxChunks = 500;

  while (startIndex < text.length && chunks.length < maxChunks) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.substring(startIndex, endIndex).trim();

    if (chunk && chunk.length > 0) {
      chunks.push(chunk);
    }

    // Break when we have consumed all text.
    // Without this, startIndex rewinds to (text.length - overlap)
    // every iteration and the final chunk is duplicated up to maxChunks times.
    if (endIndex >= text.length) break;

    startIndex = endIndex - overlap;
    if (startIndex < 0) startIndex = 0;
  }

  console.log(`[CHUNK] Created ${chunks.length} chunks from ${text.length} chars`);
  return chunks;
};

// Extract keywords from text
const extractKeywords = (text) => {
  if (!text || text.length === 0) return [];

  try {
    const words = text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      // Removed .slice(0, 10) — previously only the first 10 words
      // of a 1000-char chunk were ever stored as keywords, making names and
      // domain-specific terms later in the chunk completely invisible to scoring.
      .filter(word => word && word.length > 3)
      // Filter stop words so common words like "that", "with",
      // "from", "have" don't pollute keyword sets and inflate irrelevant scores.
      .filter(word => !STOP_WORDS.has(word));

    // Deduplicate to keep keyword array compact
    return Array.isArray(words) ? [...new Set(words)] : [];
  } catch (error) {
    console.error(`[KEYWORDS] Error extracting keywords: ${error.message}`);
    return [];
  }
};

// Create chunks with keywords
const createChunks = (text, chunkSize = 1000, overlap = 200) => {
  try {
    console.log(`[CHUNK] Starting chunk creation for ${text.length} chars`);

    const textChunks = chunkText(text, chunkSize, overlap);

    const chunks = textChunks.map((chunk, index) => ({
      text: chunk,
      keywords: extractKeywords(chunk),
      chunkIndex: index,
    }));

    console.log(`[CHUNK] Finished creating ${chunks.length} chunks with keywords`);

    textChunks.length = 0;

    return chunks;
  } catch (error) {
    console.error(`[CHUNK] Error in createChunks: ${error.message}`);
    throw error;
  }
};

module.exports = {
  chunkText,
  extractKeywords,
  createChunks,
};
