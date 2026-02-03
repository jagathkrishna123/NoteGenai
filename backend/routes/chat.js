import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get chat history for the logged-in user
router.get('/', authenticateToken, (req, res) => {
    try {
        const messages = db.prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC').all(req.user.id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

// Save a new chat message
router.post('/', authenticateToken, (req, res) => {
    const { type, content } = req.body;
    if (!type || !content) return res.status(400).json({ error: 'Type and content are required.' });

    try {
        const insert = db.prepare('INSERT INTO chat_messages (user_id, type, content) VALUES (?, ?, ?)');
        const result = insert.run(req.user.id, type, content);
        res.status(201).json({ id: result.lastInsertRowid, type, content, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save message.' });
    }
});

// Clear chat history for the logged-in user
router.delete('/', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.user.id);
        res.json({ message: 'Chat history cleared.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear chat history.' });
    }
});

export default router;
