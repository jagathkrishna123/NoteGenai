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

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";
import { OutfitRegular } from "../fonts/outfitFonts";
import { Plus, Trash2, Download, FileText, Key, BookOpen } from "lucide-react";

import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Bloom's Taxonomy Levels
const BLOOMS_LEVELS = {
  remembering: "Remembering",
  understanding: "Understanding",
  applying: "Applying",
  analyzing: "Analyzing",
  evaluating: "Evaluating",
  creating: "Creating"
};

// Question Types
const QUESTION_TYPES = {
  mcq: "Multiple Choice Questions (MCQ)",
  objective: "Objective Type",
  short: "Short Answer",
  long: "Long Answer"
};

const UploadPdfNotes = () => {
  const [rawText, setRawText] = useState("");
  const [topics, setTopics] = useState([]);
  const [paperStructure, setPaperStructure] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [outputType, setOutputType] = useState("question-paper");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  // ---------------------------
  // 1️⃣ Read PDF Syllabus
  // ---------------------------
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingPdf(true);
    setRawText("");
    setTopics([]);
    setGeneratedQuestions([]);

    const reader = new FileReader();

    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        text += strings.join(" ") + "\n";
      }

      setRawText(text);
      extractTopics(text);
      setLoadingPdf(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // ---------------------------
  // 2️⃣ Extract Topics from Syllabus
  // ---------------------------
  const extractTopics = (text) => {
    const lines = text
      .split(/[.\n]/)
      .map((l) => l.trim())
      .filter((l) => l.length > 20 && l.length < 200)
      .filter((l) => !/^\d+\./.test(l)) // Remove numbered items
      .slice(0, 20); // Limit to 20 topics

    setTopics(lines);
  };

  // ---------------------------
  // 3️⃣ Paper Structure Management
  // ---------------------------
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      name: `Section ${paperStructure.length + 1}`,
      questionType: "mcq",
      bloomsLevel: "remembering",
      numQuestions: 5,
      marksPerQuestion: 1,
      totalMarks: 5
    };
    setPaperStructure([...paperStructure, newSection]);
  };

  const updateSection = (id, field, value) => {
    setPaperStructure(sections =>
      sections.map(section => {
        if (section.id === id) {
          const updated = { ...section, [field]: value };
          if (field === 'numQuestions' || field === 'marksPerQuestion') {
            updated.totalMarks = updated.numQuestions * updated.marksPerQuestion;
          }
          return updated;
        }
        return section;
      })
    );
  };

  const removeSection = (id) => {
    setPaperStructure(sections => sections.filter(section => section.id !== id));
  };

  // ---------------------------
  // 4️⃣ Generate Questions with AI
  // ---------------------------
  const generateQuestions = async () => {
    if (!topics.length || !paperStructure.length) return;

    setLoadingAI(true);
    const generated = [];

    for (const section of paperStructure) {
      try {
        const res = await fetch("http://localhost:5000/api/ai/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topics: topics.slice(0, section.numQuestions),
            questionType: section.questionType,
            bloomsLevel: section.bloomsLevel,
            numQuestions: section.numQuestions,
            marks: section.marksPerQuestion,
            syllabusText: rawText // Pass the full syllabus text to AI
          }),
        });

        const data = await res.json();

        generated.push({
          section: section.name,
          questions: data.questions || [],
          questionType: section.questionType,
          bloomsLevel: section.bloomsLevel,
          marksPerQuestion: section.marksPerQuestion
        });
      } catch (error) {
        console.error("Error generating section:", error);
        generated.push({
          section: section.name,
          questions: [],
          questionType: section.questionType,
          bloomsLevel: section.bloomsLevel,
          marksPerQuestion: section.marksPerQuestion,
          error: "Failed to generate questions"
        });
      }
    }

    setGeneratedQuestions(generated);
    setLoadingAI(false);
  };

  // ---------------------------
  // 5️⃣ Save to LocalStorage
  // ---------------------------
  const saveToLocalStorage = () => {
    const savedFiles = JSON.parse(localStorage.getItem('questionPapers') || '[]');

    const fileData = {
      id: Date.now().toString(),
      title: `${outputType.replace("-", " ").toUpperCase()} - ${new Date().toLocaleDateString()}`,
      outputType,
      createdAt: new Date().toISOString(),
      syllabusTopics: topics,
      paperStructure,
      generatedQuestions,
      totalMarks: paperStructure.reduce((sum, s) => sum + s.totalMarks, 0)
    };

    savedFiles.unshift(fileData); // Add to beginning of array

    // Keep only last 50 files to prevent localStorage overflow
    if (savedFiles.length > 50) {
      savedFiles.splice(50);
    }

    localStorage.setItem('questionPapers', JSON.stringify(savedFiles));
    alert('Question paper saved successfully!');
  };

  // ---------------------------
  // 6️⃣ Download PDF
  // ---------------------------
  const downloadPDF = () => {
    const pdf = new jsPDF();

    pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
    pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");
    pdf.setFont("Outfit");

    let y = 20;
    let questionNumber = 1;

    // Title
    pdf.setFontSize(20);
    pdf.text("Question Paper", 105, y, { align: "center" });
    y += 20;

    // Instructions
    pdf.setFontSize(12);
    pdf.text("Instructions:", 15, y);
    y += 10;
    pdf.setFontSize(10);
    const instructions = [
      "• Attempt all questions.",
      "• Marks are indicated against each question.",
      "• Write your answers clearly and neatly."
    ];
    instructions.forEach(inst => {
      pdf.text(inst, 20, y);
      y += 6;
    });
    y += 10;

    // Generate content based on output type
    generatedQuestions.forEach((section) => {
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }

      // Section Header
      pdf.setFontSize(14);
      pdf.text(`${section.section} (${BLOOMS_LEVELS[section.bloomsLevel]})`, 15, y);
      y += 10;

      section.questions.forEach((question, index) => {
        if (y > 250) {
          pdf.addPage();
          y = 20;
        }

        // Question
        pdf.setFontSize(11);
        let questionText = "";

        if (outputType === "question-paper") {
          questionText = `${questionNumber}. ${question.question || question.text}`;
        } else if (outputType === "answer-key") {
          questionText = `${questionNumber}. ${question.question || question.text}`;
          if (question.correctAnswer) {
            questionText += ` [${question.correctAnswer}]`;
          }
        } else if (outputType === "questions-answers") {
          questionText = `${questionNumber}. ${question.question || question.text}`;
        }

        const wrappedQuestion = pdf.splitTextToSize(questionText, 180);
        pdf.text(wrappedQuestion, 15, y);
        y += wrappedQuestion.length * 5 + 5;

        // Answer (only for questions-answers)
        if (outputType === "questions-answers" && question.answer) {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          const wrappedAnswer = pdf.splitTextToSize(`Answer: ${question.answer}`, 170);
          pdf.text(wrappedAnswer, 20, y);
          y += wrappedAnswer.length * 4 + 5;
          pdf.setTextColor(0, 0, 0);
        }

        // Marks
        pdf.setFontSize(9);
        pdf.text(`(${section.marksPerQuestion} marks)`, 180, y - 5);
        y += 8;

        questionNumber++;
      });

      y += 10;
    });

    const filename = `${outputType.replace("-", "_")}.pdf`;
    pdf.save(filename);
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-700">
        Syllabus to Question Paper Generator
      </h1>

      {/* PDF Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 1: Upload Syllabus PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePdfUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:border border-blue-500 file:text-blue-700 hover:file:bg-blue-100"
        />
        {loadingPdf && <p className="mt-2 text-blue-600">Reading PDF...</p>}
      </div>

      {/* Extracted Topics */}
      {topics.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Extracted Topics ({topics.length})</h2>
          <div className="max-h-40 overflow-y-auto border-2 border-gray-400 rounded p-4 bg-gray-50">
            <ul className="space-y-2">
              {topics.map((topic, i) => (
                <li key={i} className="text-sm text-gray-700">• {topic}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Paper Structure Builder */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Step 2: Design Paper Structure</h2>
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus size={16} /> Add Section
          </button>
        </div>

        <div className="space-y-4">
          {paperStructure.map((section) => (
            <div key={section.id} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Section Name</label>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Question Type</label>
                  <select
                    value={section.questionType}
                    onChange={(e) => updateSection(section.id, 'questionType', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700  rounded"
                  >
                    {Object.entries(QUESTION_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Bloom's Level</label>
                  <select
                    value={section.bloomsLevel}
                    onChange={(e) => updateSection(section.id, 'bloomsLevel', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700 rounded outline-none"
                  >
                    {Object.entries(BLOOMS_LEVELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-gray-600">Questions</label>
                    <input
                      type="number"
                      min="1"
                      value={section.numQuestions}
                      onChange={(e) => updateSection(section.id, 'numQuestions', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-gray-600">Marks/Q</label>
                    <input
                      type="number"
                      min="1"
                      value={section.marksPerQuestion}
                      onChange={(e) => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-gray-300 text-gray-700 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">
                  Total Marks: {section.totalMarks}
                </span>
                <button
                  onClick={() => removeSection(section.id)}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500/90 border border-red-500 text-white rounded hover:bg-red-700"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {paperStructure.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-gray-700">
              Total Paper Marks: {paperStructure.reduce((sum, s) => sum + s.totalMarks, 0)}
            </p>
          </div>
        )}
      </div>

      {/* Output Type Selection */}
      {paperStructure.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 3: Select Output Format</h2>
          <div className="flex gap-4 justify-center">
            {[
              { value: "question-paper", label: "Question Paper", icon: FileText },
              { value: "answer-key", label: "Answer Key", icon: Key },
              { value: "questions-answers", label: "Questions with Answers", icon: BookOpen }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setOutputType(value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                  outputType === value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {topics.length > 0 && paperStructure.length > 0 && (
        <div className="text-center">
          <button
            onClick={generateQuestions}
            disabled={loadingAI}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingAI ? "Generating Questions..." : "Generate Question Paper"}
          </button>
        </div>
      )}

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Questions Preview</h2>
            <div className="flex gap-3">
              <button
                onClick={saveToLocalStorage}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                💾 Save File
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={16} />
                Download {outputType.replace("-", " ").toUpperCase()}
              </button>
            </div>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {generatedQuestions.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">
                  {section.section} - {QUESTION_TYPES[section.questionType]}
                  <span className="text-sm text-gray-600 ml-2">
                    ({BLOOMS_LEVELS[section.bloomsLevel]})
                  </span>
                </h3>

                {section.questions.length > 0 ? (
                  <div className="space-y-4">
                    {section.questions.map((question, qIndex) => (
                      <div key={qIndex} className="border-l-4 border-blue-200 pl-4">
                        <div className="font-medium">
                          Q{qIndex + 1}. {question.question || question.text}
                          <span className="text-sm text-gray-500 ml-2">
                            ({section.marksPerQuestion} marks)
                          </span>
                        </div>

                        {outputType === "answer-key" && question.correctAnswer && (
                          <div className="mt-2 text-green-700 font-medium">
                            Correct Answer: {question.correctAnswer}
                          </div>
                        )}

                        {outputType === "questions-answers" && question.answer && (
                          <div className="mt-2 text-gray-700">
                            <strong>Answer:</strong> {question.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-600">{section.error || "No questions generated"}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPdfNotes;