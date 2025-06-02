import { NextResponse } from 'next/server';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// The prompt is fixed as per requirements
const FIXED_PROMPT = "Generate a very short (1-2 sentence) description of a simple mindfulness activity or physical stretch suitable for a student taking a quick study break at their desk. Make it actionable and under 1 minute.";

export const runtime = 'edge';

export async function GET() {
    try {
        // Get API key from environment variable
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY environment variable is not set' },
                { status: 500 }
            );
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
            return NextResponse.json(
                { error: `Gemini API error: ${errorData?.error?.message || response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        // Extract the generated text
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) {
            return NextResponse.json(
                { error: 'No text generated from Gemini API' },
                { status: 500 }
            );
        }

        // Return success response
        return NextResponse.json({ text: generatedText.trim() });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to generate break idea',
                details: error.message 
            },
            { status: 500 }
        );
    }
} 