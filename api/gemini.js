const fetch = require('node-fetch');

// Vercel Serverless Function for Gemini API
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Define break categories
const BREAK_CATEGORIES = [
    'mindful breathing exercise',
    'gentle desk stretches',
    'mindful observation practice',
    'quick body scan meditation',
    'hand and finger exercises',
    'neck and shoulder release',
    'mindful posture adjustment',
    'eye relaxation technique'
];

// The base prompt template
const PROMPT_TEMPLATE = "Generate a unique and specific (1-2 sentences) %CATEGORY% that: 1) is easy to do at a desk, 2) takes 30-60 seconds, 3) helps reduce stress or physical tension, and 4) requires no special equipment. Make it different from common suggestions and immediately actionable. Focus on being specific and novel.";

// Track last used categories
let lastUsedCategories = [];

function getNextCategory() {
    // If all categories have been used, reset the tracking
    if (lastUsedCategories.length >= BREAK_CATEGORIES.length) {
        lastUsedCategories = [];
    }
    
    // Filter out recently used categories
    const availableCategories = BREAK_CATEGORIES.filter(
        category => !lastUsedCategories.includes(category)
    );
    
    // Select a random category from available ones
    const selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    
    // Add to tracking
    lastUsedCategories.push(selectedCategory);
    
    return selectedCategory;
}

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

        // Generate current prompt with a specific category
        const currentCategory = getNextCategory();
        const CURRENT_PROMPT = PROMPT_TEMPLATE.replace('%CATEGORY%', currentCategory);

        // Prepare request to Gemini API
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: CURRENT_PROMPT }]
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

        // Return success response with category info
        return res.status(200).json({ 
            text: generatedText.trim(),
            category: currentCategory // Optional: include category for debugging
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate break idea',
            details: error.message 
        });
    }
}; 