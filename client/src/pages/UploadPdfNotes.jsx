// import { useState } from "react";
// import * as pdfjsLib from "pdfjs-dist";
// import jsPDF from "jspdf";
// import { OutfitRegular } from "../fonts/outfitFonts";

// import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.js?url";

// pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// const UploadPdfNotes = () => {
//   const [rawText, setRawText] = useState("");
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState([]);
//   const [loadingPdf, setLoadingPdf] = useState(false);
//   const [loadingAI, setLoadingAI] = useState(false);

//   // ---------------------------
//   // 1️⃣ Read PDF
//   // ---------------------------
//   const handlePdfUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setLoadingPdf(true);
//     setRawText("");
//     setQuestions([]);
//     setAnswers([]);

//     const reader = new FileReader();

//     reader.onload = async () => {
//       const typedArray = new Uint8Array(reader.result);
//       const pdf = await pdfjsLib.getDocument(typedArray).promise;

//       let text = "";

//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const content = await page.getTextContent();
//         const strings = content.items.map((item) => item.str);
//         text += strings.join(" ") + "\n";
//       }

//       setRawText(text);
//       extractQuestions(text);
//       setLoadingPdf(false);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   // ---------------------------
//   // 2️⃣ Extract questions/topics
//   // ---------------------------
//   const extractQuestions = (text) => {
//     const lines = text
//       .split("\n")
//       .map((l) => l.trim())
//       .filter((l) => l.length > 10);

//     setQuestions(lines);
//   };

//   // ---------------------------
//   // 3️⃣ Generate answers with AI
//   // ---------------------------
//   const generateAnswers = async () => {
//     if (!questions.length) return;

//     setLoadingAI(true);
//     const generated = [];

//     for (const q of questions) {
//       try {
//         const res = await fetch("http://localhost:5000/api/ai/generate", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ topic: q }),
//         });

//         const data = await res.json();
//         generated.push({
//           question: q,
//           answer: data.answer || "No answer generated",
//         });
//       } catch {
//         generated.push({
//           question: q,
//           answer: "AI generation failed.",
//         });
//       }
//     }

//     setAnswers(generated);
//     setLoadingAI(false);
//   };

//   // ---------------------------
//   // 4️⃣ Download as PDF
//   // ---------------------------
//   const downloadPDF = () => {
//     const pdf = new jsPDF();

//     pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
//     pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");
//     pdf.setFont("Outfit");

//     let y = 20;

//     pdf.setFontSize(20);
//     pdf.text("Generated Notes", 105, y, { align: "center" });
//     y += 15;

//     answers.forEach((item, index) => {
//       if (y > 270) {
//         pdf.addPage();
//         y = 20;
//       }

//       pdf.setFontSize(14);
//       pdf.text(`Q${index + 1}. ${item.question}`, 15, y);
//       y += 6;

//       pdf.setFontSize(11);
//       const wrapped = pdf.splitTextToSize(item.answer, 180);
//       pdf.text(wrapped, 15, y);
//       y += wrapped.length * 5 + 8;
//     });

//     pdf.save("ai-generated-notes.pdf");
//   };

//   // ---------------------------
//   // UI
//   // ---------------------------
//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
//       <h1 className="text-2xl font-semibold">
//         Upload PDF & Generate Notes
//       </h1>

//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={handlePdfUpload}
//       />

//       {loadingPdf && <p>Reading PDF…</p>}

//       {rawText && (
//         <>
//           <h2 className="font-medium mt-4">Extracted Topics</h2>
//           <ul className="list-decimal ml-6 text-sm space-y-1">
//             {questions.map((q, i) => (
//               <li key={i}>{q}</li>
//             ))}
//           </ul>

//           <button
//             onClick={generateAnswers}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
//             disabled={loadingAI}
//           >
//             {loadingAI ? "Generating…" : "Generate Answers with AI"}
//           </button>
//         </>
//       )}

//       {answers.length > 0 && (
//         <>
//           <h2 className="font-medium mt-6">Preview</h2>

//           <div className="space-y-4 max-h-[50vh] overflow-y-auto border p-4 rounded">
//             {answers.map((a, i) => (
//               <div key={i}>
//                 <h3 className="font-semibold">
//                   Q{i + 1}. {a.question}
//                 </h3>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {a.answer}
//                 </p>
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={downloadPDF}
//             className="mt-4 px-4 py-2 bg-black text-white rounded"
//           >
//             Download PDF
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default UploadPdfNotes;

import React from 'react'

const UploadPdfNotes = () => {
  return (
    <div>UploadSyllabus</div>
  )
}

export default UploadPdfNotes