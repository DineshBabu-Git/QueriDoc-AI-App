const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GOOGLE_GEMINI_API_KEY is missing from environment variables"
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const getGeminiResponse = async (
  question,
  context
) => {
  try {
    const prompt = `
You are QueriDoc AI, a document assistant.

Instructions:
- Answer ONLY using the provided document context.
- If the answer is not present in the context, say:
  "I could not find that information in the uploaded document."
- Keep answers concise and accurate.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;

    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "AI service timeout"
              )
            ),
          30000 // 30 seconds
        )
    );

    result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise,
    ]);

    break;
  } catch (error) {
        const msg =
          error?.message || "";

        if (
          msg.includes("429") &&
          attempt < 3
        ) {
          console.log(
            `Rate limited. Retrying (${attempt}/3)...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, 5000)
          );

          continue;
        }

        throw error;
      }
    }

    const response = result.response;
    return response.text();
  } catch (error) {
    const errorMessage =
      error?.message ||
      "Unknown Gemini error";

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("quota")
    ) {
      throw new Error(
        "AI service quota exceeded. Please try again later."
      );
    }

    throw new Error(
      `Failed to get response from Gemini: ${errorMessage}`
    );
  }
};

module.exports = {
  getGeminiResponse,
};
