const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚨 ResQ Bot API is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});