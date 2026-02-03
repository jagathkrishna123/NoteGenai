import { createContext, useContext, useEffect, useState } from "react";
import { GENERATEDNOTES } from "../assets/assets";

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const refreshUser = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setUserId(currentUser?.id || null);
    setToken(currentUser?.token || null);
  };

  // Get current user on mount and when storage changes
  useEffect(() => {
    refreshUser();
    window.addEventListener('storage', refreshUser);
    return () => window.removeEventListener('storage', refreshUser);
  }, []);

  // Load notes from backend when userId or token changes
  useEffect(() => {
    if (!token) {
      setNotes([]);
      return;
    }

    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Parse content back into sections if it's JSON
          const formattedNotes = data.map(note => {
            try {
              return {
                ...note,
                sections: JSON.parse(note.content),
                updatedAt: note.created_at // Use created_at as fallback for updatedAt
              };
            } catch (e) {
              return { ...note, sections: [] };
            }
          });
          setNotes(formattedNotes);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    fetchNotes();
  }, [token]);

  const addNote = async (note) => {
    if (!token) return null;
    try {
      const payload = {
        title: note.title,
        content: JSON.stringify(note.sections)
      };
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        const newNote = { ...data, sections: JSON.parse(data.content), updatedAt: data.created_at };
        setNotes(prev => [newNote, ...prev]);
        return newNote;
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
    return null;
  };

  const updateNote = async (updatedNote) => {
    if (!token) return;
    try {
      const payload = {
        title: updatedNote.title,
        content: JSON.stringify(updatedNote.sections)
      };
      const response = await fetch(`http://localhost:5000/api/notes/${updatedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : n));
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const deleteNote = async (id) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <NotesContext.Provider
      value={{ notes, userId, token, addNote, updateNote, deleteNote, refreshUser }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
