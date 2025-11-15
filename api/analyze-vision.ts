import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, prompt, useProvider } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Default prompt optimized for accessibility and analysis
    const defaultPrompt = `Analyze this screenshot comprehensively:

1. Extract ALL visible text (complete OCR)
2. Describe the main visual elements
3. Identify the type of content (document, webpage, application, etc.)
4. Summarize the purpose or main message

Provide the analysis in a clear, structured format in Spanish.`;

    // Call GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || defaultPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageData}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });

    const analysis = response.choices[0].message.content;

    if (!analysis) {
      throw new Error('No analysis returned from API');
    }

    // Generate markdown
    const markdown = `# Screen Analysis

**Date:** ${new Date().toLocaleString('es-ES')}
**Provider:** OpenAI GPT-4 Vision

---

## Analysis

${analysis}

---

*Generated with SnapSight AI - YuKeSong2025 Hackathon*
`;

    return res.status(200).json({
      success: true,
      analysis,
      markdown,
      provider: 'openai',
      timestamp: new Date()
    });

  } catch (error: any) {
    console.error('Error in analyze-vision:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze image'
    });
  }
}
