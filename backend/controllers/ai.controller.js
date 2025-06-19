import { generateResult } from '../services/ai.service.js';

export const getResult = async (req, res) => {
    try {
        const { prompt, model } = req.query;
        
        if (!prompt) {
            return res.status(400).send({ message: "Prompt is required" });
        }

        const result = await generateResult(prompt, model);
        res.send({ response: result });
        
    } catch(error) {
        console.error("AI Controller Error:", error);
        res.status(500).send({ 
            message: "Failed to generate AI response",
            error: error.message 
        });
    }
}