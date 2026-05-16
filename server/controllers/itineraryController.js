const Group = require("../models/GroupModel");
const groq = require("../config/groq");

const generateItinerary = async (req, res) => {
    try {
        const { groupId } = req.body;

        // ✅ 1. Validate groupId
        if (!groupId) {
            return res.status(400).json({ message: "Group ID missing" });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // ✅ 2. Validate destination
        if (!group.destination && !group.groupName) {
            return res.status(400).json({
                message: "Destination required to generate itinerary"
            });
        }

        console.log("📦 GROUP:", group._id);

        // ✅ 3. Handle missing/invalid dates safely
        let startDate = group.startDate ? new Date(group.startDate) : null;
        let endDate = group.endDate ? new Date(group.endDate) : null;

        if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
            console.log("⚠️ Missing or invalid dates, using defaults");

            startDate = new Date();
            endDate = new Date();
            endDate.setDate(startDate.getDate() + 2); // default 3 days
        }

        // ✅ 4. Calculate days safely
        const days = Math.max(
            1,
            Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        );

        // 🔥 PROMPT
        const prompt = `
Create a detailed travel itinerary for ${group.destination || group.groupName}.

Trip Duration: ${days} days
Dates: ${startDate.toDateString()} to ${endDate.toDateString()}

Rules:
- Generate EXACTLY ${days} days
- Each day must include:
  - title
  - subtitle
  - 3 to 5 activities
- Activities must include:
  - time
  - title
  - description
- Keep travel flow logical
- Mix popular + local experiences
- Avoid repetition

Return ONLY JSON:
[
  {
    "day": 1,
    "date": "YYYY-MM-DD",
    "title": "Day Title",
    "subtitle": "Theme",
    "activities": [
      {
        "time": "09:00 AM",
        "title": "Activity name",
        "description": "Short description"
      }
    ]
  }
]
`;

        console.log("🚀 Generating itinerary...");

        // ✅ OpenAI call (replaces Gemini)
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a professional travel planner." },
                { role: "user", content: prompt }
            ]
        });
        let text = completion.choices[0].message.content;
        console.log("🧠 RAW AI RESPONSE:", text);

        // ✅ 5. Clean AI response
        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let itinerary;

        try {
            // 🔥 Extract ONLY JSON array
            const jsonMatch = cleanText.match(/\[\s*{[\s\S]*}\s*\]/);

            if (!jsonMatch) {
                console.error("❌ No JSON found in response");
                throw new Error("Invalid AI format");
            }

            itinerary = JSON.parse(jsonMatch[0]);

        } catch (err) {
            console.error("❌ FULL ERROR:", err);

            return res.status(500).json({
                message: err.message || "AI generation failed"
            });
        }

        // ✅ 6. Ensure correct length
        if (!Array.isArray(itinerary) || itinerary.length === 0) {
            return res.status(500).json({
                message: "AI failed to generate valid itinerary"
            });
        }

        itinerary = itinerary.slice(0, days);

        // ✅ 7. Add correct dates
        itinerary = itinerary.map((day, index) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + index);

            return {
                ...day,
                day: index + 1,
                date: date.toISOString().split("T")[0]
            };
        });

        // ✅ 8. Save to DB
        group.itinerary = itinerary;
        await group.save();

        console.log("✅ Itinerary saved");

        res.status(200).json({
            message: "Itinerary generated successfully",
            itinerary
        });

    } catch (err) {
        console.error("❌ ERROR:", err.message);
        res.status(500).json({ message: "AI generation failed" });
    }
};

module.exports = { generateItinerary };
