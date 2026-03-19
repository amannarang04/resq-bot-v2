const { getCrisisResponse } = require('../services/geminiService');

const handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const reply = await getCrisisResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};

module.exports = { handleChat };