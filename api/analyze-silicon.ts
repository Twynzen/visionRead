import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * SiliconFlow API integration for hackathon special track
 * TODO: Add SiliconFlow API key and implementation
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, prompt } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // TODO: Implement SiliconFlow API call
    // For now, return placeholder response

    return res.status(200).json({
      success: true,
      analysis: 'SiliconFlow integration coming soon! This will enable us to compete for the special track prize.',
      markdown: '# SiliconFlow Analysis\n\nComing soon...',
      provider: 'siliconflow',
      timestamp: new Date()
    });

  } catch (error: any) {
    console.error('Error in analyze-silicon:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze with SiliconFlow'
    });
  }
}
