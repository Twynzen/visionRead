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
    const { text, voice = 'nova', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Generate audio
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as any,
      input: text,
      speed: speed
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return audio as base64
    const base64Audio = buffer.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return res.status(200).json({
      success: true,
      audioUrl
    });

  } catch (error: any) {
    console.error('Error in generate-tts:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate audio'
    });
  }
}
