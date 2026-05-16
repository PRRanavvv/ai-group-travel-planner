const groq = require("../config/groq");
const cosineSimilarity = require("../utils/cosineSimilarity");

let embedder;

// load once
const getEmbedder = async () => {
    if (!embedder) {
        const { pipeline } = await import("@xenova/transformers");
        embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }
    return embedder;
};

const getEmbedding = async (text) => {
    const model = await getEmbedder();

    const output = await model(text, {
        pooling: "mean",
        normalize: true
    });

    return Array.from(output.data);
};

const regenerateItineraryWithAI = async (group) => {
    try {

        const approvedProposals = group.proposals.filter(
            p => p.status === "approved"
        );

        if (approvedProposals.length === 0) {
            return group.itinerary;
        }

        // flatten activities
        const activities = [];

        group.itinerary.forEach((day, dayIndex) => {
            (day.activities || []).forEach((act, actIndex) => {
                activities.push({
                    dayIndex,
                    actIndex,
                    text: `${act.time} ${act.title} ${act.description}`
                });
            });
        });

        // embed activities once
        const activityEmbeddings = [];

        for (let act of activities) {
            const emb = await getEmbedding(act.text);

            activityEmbeddings.push({
                ...act,
                embedding: emb
            });
        }

        // apply EACH proposal
        for (let proposal of approvedProposals) {

            const proposalEmbedding =
                await getEmbedding(proposal.text);

            let bestMatch = null;
            let bestScore = 0;

            for (let act of activityEmbeddings) {

                const score = cosineSimilarity(
                    proposalEmbedding,
                    act.embedding
                );

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = act;
                }
            }

            // threshold (important)
            if (!bestMatch || bestScore < 0.55) continue;

            const { dayIndex, actIndex } = bestMatch;

            const oldActivity =
                group.itinerary[dayIndex].activities[actIndex];

            group.itinerary[dayIndex].activities[actIndex] = {
                ...oldActivity,
                title: proposal.text,
                description: "Updated based on group vote"
            };
        }

        // OPTIONAL: ask LLM to smooth only, not rewrite
        const prompt = `
You are updating an itinerary.
Only refine wording.
DO NOT change structure.
Return same JSON.

${JSON.stringify(group.itinerary)}
`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "user", content: prompt }
            ]
        });

        try {
            return JSON.parse(
                completion.choices[0].message.content
            );
        } catch {
            return group.itinerary;
        }

    } catch (err) {
        console.log("AI ERROR:", err);
        return group.itinerary;
    }
};


module.exports = {
    regenerateItineraryWithAI
};
