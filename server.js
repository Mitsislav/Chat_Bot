/* server.js */

require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

/* Schema */
const ChatSchema = new mongoose.Schema({
  user: String,
  title: String,
  createdAt: { type: Date, default: Date.now },
  messages: [
    { question: String, answer: String }
  ]
});
const Chat = mongoose.model('Chat', ChatSchema);

/* MongoDB connection */
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected!'))
.catch(err => console.log('MongoDB error:', err));

/* Gemini function */
async function askGemini(question) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: question }] }] }
    );
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Δεν κατάλαβα, πες το αλλιώς!";
  } catch (err) {
    console.error('Gemini error:', err?.response?.data || err);
    return 'Συγγνώμη, το Gemini bot είναι προσωρινά μη διαθέσιμο.';
  }
}

/* API: new chat */
app.post('/api/chats', async (req, res) => {
  const chat = new Chat({ user: req.body.user, title: req.body.title || 'Νέο Chat', messages: [] });
  await chat.save();
  res.json(chat);
});

/* API: all chats for the user */
app.get('/api/chats/:user', async (req, res) => {
  const chats = await Chat.find({ user: req.params.user }).sort('-createdAt');
  res.json(chats); // ΠΡΕΠΕΙ να είναι array με _id σε κάθε object!
});

/* API: bring an existing selected chat */
app.get('/api/chats/id/:chatId', async (req, res) => {
  if (!req.params.chatId) return res.status(400).json({error: 'No chatId given'});
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({error: 'Not found'});
    res.json(chat);
  } catch (err) {
    res.status(400).json({error: 'Invalid id'});
  }
});

/* API: add Q&A in chat */
app.post('/api/chats/:chatId/message', async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({error: 'Not found'});

  /* Question from (req.body.question) 
     Answer from bot (if not receive, then call Gemini)  
  */
  let answer = req.body.answer;
  if (!answer) {
    answer = await askGemini(req.body.question);
  }
  chat.messages.push({ question: req.body.question, answer });
  await chat.save();
  res.json({ question: req.body.question, answer });
});

app.patch('/api/chats/:chatId/title', async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: 'Not found' });
  chat.title = req.body.title;
  await chat.save();
  res.json({ success: true });
});

/* Real-time (optional) */
io.on('connection', socket => {
  console.log('User connected:', socket.id);
  /* like the previous one */
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
