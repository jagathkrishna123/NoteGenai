// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import jsPDF from "jspdf";
// import { OutfitRegular } from "../fonts/outfitFonts";
// import { useNotes } from "../context/NotesContext";

// const NoteGenPage = () => {
//   const { id } = useParams();          // note id or "new"
//   const navigate = useNavigate();
//   const { notes, addNote, updateNote } = useNotes();

//   const [noteTitle, setNoteTitle] = useState("");
//   const [sections, setSections] = useState([
//     { id: crypto.randomUUID(), topic: "", answer: "" },
//   ]);

//   // 🔹 Load existing note for edit
//   useEffect(() => {
//     if (!id || id === "new") return;

//     const existingNote = notes.find((n) => n.id === id);
//     if (existingNote) {
//       setNoteTitle(existingNote.title);
//       setSections(existingNote.sections);
//     }
//   }, [id, notes]);

//   // handle input change
//   const handleChange = (index, key, value) => {
//     const updated = [...sections];
//     updated[index] = { ...updated[index], [key]: value };
//     setSections(updated);
//   };

//   // add new question
//   const addSection = () => {
//     setSections([
//       ...sections,
//       { id: crypto.randomUUID(), topic: "", answer: "" },
//     ]);
//   };

//   // remove question
//   const removeSection = (index) => {
//     setSections(sections.filter((_, i) => i !== index));
//   };

//   // 🔹 Save note to global state
//   const saveNote = () => {
//     const noteData = {
//       id: id === "new" ? crypto.randomUUID() : id,
//       title: noteTitle || "Untitled Note",
//       sections,
//       createdAt:
//         id === "new" ? new Date().toISOString() : undefined,
//       updatedAt: new Date().toISOString(),
//     };

//     if (id === "new") {
//       addNote(noteData);
//     } else {
//       updateNote(noteData);
//     }

//     return noteData.id;
//   };

//   // 🔹 Generate PDF + Save note
//   const generatePDF = () => {
//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     });

//     // Register Outfit font
//     pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
//     pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");

//     const marginX = 15;
//     const pageHeight = 297;
//     const maxY = pageHeight - 20;
//     let y = 25;

//     // Title
//     pdf.setFont("Outfit", "normal");
//     pdf.setFontSize(20);
//     pdf.setTextColor(40, 90, 255);
//     pdf.text(noteTitle || "Study Notes", 105, y, { align: "center" });

//     y += 15;

//     sections.forEach((section, index) => {
//       if (y > maxY) {
//         pdf.addPage();
//         y = 25;
//       }

//       // Question
//       pdf.setFontSize(14);
//       pdf.setTextColor(0);
//       pdf.text(`Q${index + 1}. ${section.topic}`, marginX, y);

//       y += 3;

//       // Answer
//       pdf.setFontSize(11);
//       pdf.setTextColor(60);
//       const wrappedAnswer = pdf.splitTextToSize(
//         section.answer || "—",
//         180
//       );
//       pdf.text(wrappedAnswer, marginX, y);

//       y += wrappedAnswer.length * 5 + 2;
//     });

//     // Footer
//     const pageCount = pdf.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       pdf.setPage(i);
//       pdf.setFontSize(9);
//       pdf.setTextColor(150);
//       pdf.text(`Page ${i} of ${pageCount}`, 105, 290, {
//         align: "center",
//       });
//     }

//     pdf.save("notes.pdf");

//     // ✅ SAVE + REDIRECT
//     const savedId = saveNote();
//     navigate(`/app/preview/${savedId}`);
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//         {/* LEFT FORM */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 space-y-6">
//           <input
//             className="w-full text-xl font-semibold border-b pb-2 focus:outline-none"
//             placeholder="Note title"
//             value={noteTitle}
//             onChange={(e) => setNoteTitle(e.target.value)}
//           />

//           {sections.map((section, index) => (
//             <div
//               key={section.id}
//               className="bg-gray-50 border border-gray-400 rounded-lg p-4 space-y-3"
//             >
//               <div className="flex justify-between">
//                 <h3 className="font-medium">
//                   Question {index + 1}
//                 </h3>
//                 {sections.length > 1 && (
//                   <button
//                     onClick={() => removeSection(index)}
//                     className="text-xs text-red-500 hover:underline"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>

//               <input
//                 className="w-full border rounded-md px-3 py-2 text-sm"
//                 placeholder="Question / Topic"
//                 value={section.topic}
//                 onChange={(e) =>
//                   handleChange(index, "topic", e.target.value)
//                 }
//               />

//               <textarea
//                 className="w-full border rounded-md px-3 py-2 text-sm h-28 resize-none"
//                 placeholder="Answer"
//                 value={section.answer}
//                 onChange={(e) =>
//                   handleChange(index, "answer", e.target.value)
//                 }
//               />
//             </div>
//           ))}

//           <button
//             onClick={addSection}
//             className="w-full py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//           >
//             + Add Another Question
//           </button>
//         </div>

//         {/* RIGHT PREVIEW */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 lg:sticky lg:top-24 h-fit">
//           <h2 className="text-xl font-semibold mb-4">
//             {noteTitle || "Preview"}
//           </h2>

//           <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
//             {sections.map((section, index) => (
//               <div key={section.id}>
//                 <h3 className="font-semibold">
//                   Q{index + 1}. {section.topic || "Untitled"}
//                 </h3>
//                 <p className="text-sm text-gray-600 whitespace-pre-line">
//                   {section.answer || "No answer yet..."}
//                 </p>
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={generatePDF}
//             className="mt-6 w-full py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-900"
//           >
//             Download PDF
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default NoteGenPage;


///////////////////////////////////////////////////////////////////

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import { OutfitRegular } from "../fonts/outfitFonts";
import { useNotes } from "../context/NotesContext";

const NoteGenPage = () => {
  const { id } = useParams(); // note id or "new"
  const navigate = useNavigate();
  const { notes, addNote, updateNote } = useNotes();

  const [noteTitle, setNoteTitle] = useState("");
  const [sections, setSections] = useState([
    { id: crypto.randomUUID(), topic: "", answer: "" },
  ]);

  const [aiLoadingId, setAiLoadingId] = useState(null);

  // 🔹 Load existing note for edit
  useEffect(() => {
    if (!id || id === "new") return;

    const existingNote = notes.find((n) => n.id === id);
    if (existingNote) {
      setNoteTitle(existingNote.title);
      setSections(existingNote.sections);
    }
  }, [id, notes]);

  // handle input change
  const handleChange = (index, key, value) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [key]: value };
    setSections(updated);
  };

  // add new question
  const addSection = () => {
    setSections([
      ...sections,
      { id: crypto.randomUUID(), topic: "", answer: "" },
    ]);
  };

  // remove question
  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // 🔹 Generate answer using AI
  const generateWithAI = async (index) => {
    const topic = sections[index].topic;
    if (!topic) return alert("Please enter a question/topic first");

    try {
      setAiLoadingId(sections[index].id);

      const res = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      handleChange(index, "answer", data.answer);
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally {
      setAiLoadingId(null);
    }
  };

  // 🔹 Save note
  const saveNote = () => {
    const noteData = {
      id: id === "new" ? crypto.randomUUID() : id,
      title: noteTitle || "Untitled Note",
      sections,
      createdAt:
        id === "new" ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    if (id === "new") {
      addNote(noteData);
    } else {
      updateNote(noteData);
    }

    return noteData.id;
  };

  // 🔹 Generate PDF + Save note
  const generatePDF = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Register Outfit font
    pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
    pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");

    const marginX = 15;
    const pageHeight = 297;
    const maxY = pageHeight - 20;
    let y = 25;

    // Title
    pdf.setFont("Outfit", "normal");
    pdf.setFontSize(20);
    pdf.setTextColor(40, 90, 255);
    pdf.text(noteTitle || "Study Notes", 105, y, { align: "center" });

    y += 15;

    sections.forEach((section, index) => {
      if (y > maxY) {
        pdf.addPage();
        y = 25;
      }

      // Question
      pdf.setFontSize(14);
      pdf.setTextColor(0);
      pdf.text(`Q${index + 1}. ${section.topic}`, marginX, y);

      y += 3;

      // Answer
      pdf.setFontSize(11);
      pdf.setTextColor(60);
      const wrappedAnswer = pdf.splitTextToSize(
        section.answer || "—",
        180
      );
      pdf.text(wrappedAnswer, marginX, y);

      y += wrappedAnswer.length * 5 + 2;
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text(`Page ${i} of ${pageCount}`, 105, 290, {
        align: "center",
      });
    }

    pdf.save("notes.pdf");

    const savedId = saveNote();
    navigate(`/app/preview/${savedId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 space-y-6">
          <input
            className="w-full text-xl font-semibold border-b pb-2 focus:outline-none"
            placeholder="Note title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />

          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-gray-50 border border-gray-400 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">
                  Question {index + 1}
                </h3>
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(index)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Question / Topic"
                value={section.topic}
                onChange={(e) =>
                  handleChange(index, "topic", e.target.value)
                }
              />

              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm h-28 resize-none"
                placeholder="Answer"
                value={section.answer}
                onChange={(e) =>
                  handleChange(index, "answer", e.target.value)
                }
              />

              <button
                onClick={() => generateWithAI(index)}
                disabled={aiLoadingId === section.id}
                className="
                  text-xs font-medium px-3 py-1.5 rounded-md
                  border border-blue-800
                  bg-blue-300 text-blue-900
                  hover:bg-blue-600 hover:text-white transition-all duration-500
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {aiLoadingId === section.id
                  ? "Generating..."
                  : "Generate with AI"}
              </button>
            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Another Question
          </button>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 lg:sticky lg:top-24 h-fit">
          <h2 className="text-xl font-semibold mb-4">
            {noteTitle || "Preview"}
          </h2>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
            {sections.map((section, index) => (
              <div key={section.id}>
                <h3 className="font-semibold">
                  Q{index + 1}. {section.topic || "Untitled"}
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {section.answer || "No answer yet..."}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={generatePDF}
            className="mt-6 w-full py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-900"
          >
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default NoteGenPage;
