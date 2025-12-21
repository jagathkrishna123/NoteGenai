import { createContext, useContext, useEffect, useState } from "react";
import { GENERATEDNOTES } from "../assets/assets";

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  // load initial data
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    setNotes(saved ? JSON.parse(saved) : GENERATEDNOTES);
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = (note) => {
    setNotes((prev) => [...prev, note]);
  };

  const updateNote = (updatedNote) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotesContext.Provider
      value={{ notes, addNote, updateNote, deleteNote }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
