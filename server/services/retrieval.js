const QUERY_STOP_WORDS = new Set([
  'where', 'does', 'what', 'when', 'which', 'that', 'this', 'with',
  'from', 'have', 'will', 'been', 'were', 'they', 'their', 'there',
  'then', 'than', 'also', 'into', 'some', 'your', 'more', 'about',
  'after', 'before', 'would', 'could', 'should', 'very', 'just',
  'like', 'over', 'each', 'such', 'them', 'these', 'those',
]);

// Strip punctuation from a word so "live?" becomes "live",
// "sarah's" becomes "sarahs", etc. Applied to all query tokens before matching.
const normalizeWord = (word) => word.replace(/[^a-z0-9]/g, '');

// Calculate keyword relevance score
const calculateRelevanceScore = (queryKeywords, chunkKeywords) => {
  if (chunkKeywords.length === 0 || queryKeywords.length === 0) return 0;

  const matches = queryKeywords.filter(keyword =>
    chunkKeywords.some(
      chunkKeyword =>
        chunkKeyword.includes(keyword) || keyword.includes(chunkKeyword)
    )
  );

  return (matches.length / queryKeywords.length) * 100;
};

// Calculate keyword match score
const calculateMatchScore = (query, chunkText) => {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    // Normalize each word to strip trailing/embedded punctuation
    // before matching. "live?" will now correctly match "live" in chunk text.
    .map(normalizeWord)
    .filter(word => word.length > 2);

  if (queryWords.length === 0) return 0;

  const chunkLower = chunkText.toLowerCase();
  const matches = queryWords.filter(word => chunkLower.includes(word));

  return (matches.length / queryWords.length) * 100;
};

// Retrieve relevant chunks
const retrieveRelevantChunks = (query, chunks, topK = 5) => {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Normalize query words AND filter stop words for keyword scoring.
  // Stop words like "where", "does" carry no semantic weight and waste the
  // score budget — filtering them focuses matching on meaningful content words.
  const queryKeywords = query
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeWord)
    .filter(word => word.length > 2 && !QUERY_STOP_WORDS.has(word));

  // Score each chunk
  const scoredChunks = chunks.map(chunk => {
    const keywordScore = calculateRelevanceScore(
      queryKeywords,
      chunk.keywords || []
    );

    const matchScore = calculateMatchScore(
      query,
      chunk.text || ''
    );

    const totalScore = keywordScore * 0.4 + matchScore * 0.6;

    return {
      text: chunk.text || chunk._doc?.text || '',
      keywords: chunk.keywords || chunk._doc?.keywords || [],
      chunkIndex: chunk.chunkIndex || chunk._doc?.chunkIndex || 0,
      relevanceScore: totalScore,
    };
  });

  scoredChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const bestChunks = scoredChunks.slice(0, topK);

  // Deduplicate by text content
  const uniqueChunks = [
    ...new Map(
      bestChunks.map(chunk => [chunk.text, chunk])
    ).values()
  ];

  // Fallback when all scores are zero — return first few chunks
  // as a best-effort context. Previously this fallback was dead code: an
  // identical fallback existed after a return statement and never executed.
  if (uniqueChunks.length > 0 && uniqueChunks[0].relevanceScore === 0) {
    return chunks.slice(0, Math.min(3, chunks.length));
  }

  return uniqueChunks;
};

module.exports = {
  calculateRelevanceScore,
  calculateMatchScore,
  retrieveRelevantChunks,
};
