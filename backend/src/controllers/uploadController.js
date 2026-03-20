const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyzeImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: `You are ResQ Bot, an AI emergency assistant. Analyze this image and:
1. Identify what emergency or injury is visible
2. Give immediate first aid or safety steps
3. Tell what kind of help is needed (ambulance, fire, police)
4. Provide relevant Indian emergency numbers (Police: 100, Ambulance: 108, Fire: 101)

Respond in a calm, clear way. If no emergency is visible, say so.`,
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed. Please try again.' });
  }
};

module.exports = { analyzeImage };