const Groq = require("groq-sdk");

const createMissingKeyError = () => {
    const error = new Error("GROQ_API_KEY is required for legacy LLM itinerary generation.");
    error.statusCode = 503;
    return error;
};

const groq = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : {
        chat: {
            completions: {
                create: async () => {
                    throw createMissingKeyError();
                }
            }
        }
    };

module.exports = groq;
