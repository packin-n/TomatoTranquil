const fetch = require('node-fetch');

// Vercel Serverless Function for Gemini API
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// The prompt is fixed as per requirements
const FIXED_PROMPT = "Generate a very short (1-2 sentence) description of a simple mindfulness activity or physical stretch suitable for a student taking a quick study break at their desk. Make it actionable and under 1 minute.";

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get API key from environment variable
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set' });
        }

        // Prepare request to Gemini API
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: FIXED_PROMPT }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ 
                error: `Gemini API error: ${errorData?.error?.message || response.statusText}` 
            });
        }

        const data = await response.json();
        
        // Extract the generated text
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) {
            return res.status(500).json({ error: 'No text generated from Gemini API' });
        }

        // Return success response
        return res.status(200).json({ text: generatedText.trim() });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate break idea',
            details: error.message 
        });
    }
}; 