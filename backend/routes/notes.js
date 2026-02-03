import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all notes for the logged-in user
router.get('/', authenticateToken, (req, res) => {
    try {
        const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
});

// Create a new note
router.post('/', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    try {
        const insert = db.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)');
        const result = insert.run(req.user.id, title, content);
        res.status(201).json({ id: result.lastInsertRowid, title, content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create note.' });
    }
});

// Update a note
router.put('/:id', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    try {
        const update = db.prepare('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?');
        const result = update.run(title, content, req.params.id, req.user.id);

        if (result.changes === 0) return res.status(404).json({ error: 'Note not found or unauthorized.' });
        res.json({ message: 'Note updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update note.' });
    }
});

// Delete a note
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const del = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');
        const result = del.run(req.params.id, req.user.id);

        if (result.changes === 0) return res.status(404).json({ error: 'Note not found or unauthorized.' });
        res.json({ message: 'Note deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note.' });
    }
});

export default router;
