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
  const [inputType, setInputType] = useState("file"); // 'file' or 'text'
  const [manualSyllabus, setManualSyllabus] = useState("");
  const [headerDetails, setHeaderDetails] = useState({
    collegeName: "",
    examName: "",
    subjectName: "",
    year: ""
  });
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

  const handleManualSyllabusSubmit = () => {
    if (!manualSyllabus.trim()) return;
    setRawText(manualSyllabus);
    extractTopics(manualSyllabus);
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      alert('Please login to save files');
      return;
    }

    const savedFiles = JSON.parse(localStorage.getItem('questionPapers') || '[]');

    const fileData = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title: `${outputType.replace("-", " ").toUpperCase()} - ${new Date().toLocaleDateString()}`,
      outputType,
      createdAt: new Date().toISOString(),
      syllabusTopics: topics,
      paperStructure,
      generatedQuestions,
      headerDetails,
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
    const totalMarks = paperStructure.reduce((sum, s) => sum + s.totalMarks, 0);

    pdf.addFileToVFS("Outfit-Regular.ttf", OutfitRegular);
    pdf.addFont("Outfit-Regular.ttf", "Outfit", "normal");
    pdf.setFont("Outfit");

    let y = 15;

    // ---------------------------
    // Professional Header Structure
    // ---------------------------

    // College Name (Centered, Bold)
    if (headerDetails.collegeName) {
      pdf.setFontSize(18);
      pdf.setFont("Outfit", "bold");
      const splitCollege = pdf.splitTextToSize(headerDetails.collegeName.toUpperCase(), 180);
      splitCollege.forEach(line => {
        pdf.text(line, 105, y, { align: "center" });
        y += 8;
      });
      y += 2;
    }

    // Exam Name and Year (Centered)
    if (headerDetails.examName || headerDetails.year) {
      pdf.setFontSize(14);
      pdf.setFont("Outfit", "normal");
      const examStr = `${headerDetails.examName} ${headerDetails.year ? `- ${headerDetails.year}` : ""}`.trim();
      pdf.text(examStr, 105, y, { align: "center" });
      y += 10;
    }

    // Subject Name (Left) and Marks (Right)
    pdf.setFontSize(12);
    if (headerDetails.subjectName) {
      pdf.text(`Subject: ${headerDetails.subjectName}`, 15, y);
    }
    pdf.text(`Total Marks: ${totalMarks}`, 195, y, { align: "right" });
    y += 8;

    // Horizontal Line
    pdf.setLineWidth(0.5);
    pdf.line(15, y, 195, y);
    y += 12;

    // Instructions
    pdf.setFontSize(11);
    pdf.setFont("Outfit", "bold");
    pdf.text("General Instructions:", 15, y);
    y += 6;
    pdf.setFont("Outfit", "normal");
    pdf.setFontSize(10);
    const instructions = [
      "1. All questions are compulsory.",
      "2. The question paper consists of " + paperStructure.length + " sections.",
      "3. Use of calculators is " + (paperStructure.some(s => s.bloomsLevel === 'applying' || s.bloomsLevel === 'analyzing') ? "permitted for complex calculations." : "not permitted."),
      "4. Figures to the right indicate full marks."
    ];
    instructions.forEach(inst => {
      pdf.text(inst, 20, y);
      y += 5;
    });
    y += 10;

    let questionNumber = 1;

    // Sections and Questions
    generatedQuestions.forEach((section) => {
      if (y > 260) {
        pdf.addPage();
        y = 20;
      }

      // Section Header (Centered Box)
      pdf.setFontSize(12);
      pdf.setFont("Outfit", "bold");
      const sectionTitle = `${section.section.toUpperCase()} (${BLOOMS_LEVELS[section.bloomsLevel] || section.bloomsLevel})`;
      const titleWidth = pdf.getTextWidth(sectionTitle);
      pdf.rect(105 - (titleWidth / 2) - 5, y - 5, titleWidth + 10, 8);
      pdf.text(sectionTitle, 105, y, { align: "center" });
      y += 12;

      section.questions.forEach((question) => {
        if (y > 260) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont("Outfit", "normal");
        pdf.setFontSize(11);

        let questionText = `${questionNumber}. ${question.question || question.text || ""}`;
        const wrappedQuestion = pdf.splitTextToSize(questionText, 160);

        // Render Question Text
        pdf.text(wrappedQuestion, 15, y);

        // Render Marks on the same line as the start of the question
        pdf.setFontSize(10);
        pdf.text(`[${section.marksPerQuestion}]`, 195, y, { align: "right" });

        y += wrappedQuestion.length * 5 + 2;

        // MCQ Options if available
        if (section.questionType === 'mcq' && question.options) {
          pdf.setFontSize(10);
          const options = Array.isArray(question.options) ? question.options : [];
          options.forEach((opt, optIdx) => {
            if (y > 275) { pdf.addPage(); y = 20; }
            pdf.text(`${String.fromCharCode(97 + optIdx)}) ${opt}`, 25, y);
            y += 5;
          });
        }

        // Answer / Solution handling (conditional based on outputType)
        if (outputType !== "question-paper") {
          y += 2;
          pdf.setFont("Outfit", "bold");
          pdf.setTextColor(100, 100, 100);

          if (outputType === "answer-key" && question.correctAnswer) {
            pdf.text(`Correct Option: ${question.correctAnswer}`, 20, y);
            y += 6;
          } else if (outputType === "questions-answers" && question.answer) {
            const wrappedAnswer = pdf.splitTextToSize(`Solution: ${question.answer}`, 170);
            pdf.text(wrappedAnswer, 20, y);
            y += wrappedAnswer.length * 5 + 4;
          }
          pdf.setTextColor(0, 0, 0);
        }

        y += 4;
        questionNumber++;
      });
      y += 5;
    });

    const filename = `${headerDetails.subjectName || outputType}_${Date.now()}.pdf`;
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

      {/* Step 1: Syllabus Input */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Step 1: Provide Syllabus</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setInputType("file")}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${inputType === "file" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setInputType("text")}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${inputType === "text" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Manual Input
            </button>
          </div>
        </div>

        {inputType === "file" ? (
          <div className="space-y-4">
            <label className="block p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group bg-gray-50/50">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-700 font-medium mb-1">Click to upload syllabus PDF</p>
                <p className="text-sm text-gray-500">Only PDF files are supported</p>
              </div>
            </label>
            {loadingPdf && (
              <div className="flex items-center justify-center gap-3 text-blue-600 font-medium">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Reading PDF...
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={manualSyllabus}
              onChange={(e) => setManualSyllabus(e.target.value)}
              placeholder="Paste your syllabus text here... For best results, include each topic on a new line."
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50/50 transition-all"
            />
            <button
              onClick={handleManualSyllabusSubmit}
              disabled={!manualSyllabus.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Process Syllabus
            </button>
          </div>
        )}
      </div>

      {/* Paper Header Details (Optional) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Step 2: Paper Header Details <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">College/Institution Name</label>
            <input
              type="text"
              value={headerDetails.collegeName}
              onChange={(e) => setHeaderDetails({ ...headerDetails, collegeName: e.target.value })}
              placeholder="e.g., St. Joseph's College of Engineering"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Examination Name</label>
            <input
              type="text"
              value={headerDetails.examName}
              onChange={(e) => setHeaderDetails({ ...headerDetails, examName: e.target.value })}
              placeholder="e.g., Semester End Examinations"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
            <input
              type="text"
              value={headerDetails.subjectName}
              onChange={(e) => setHeaderDetails({ ...headerDetails, subjectName: e.target.value })}
              placeholder="e.g., Data Structures and Algorithms"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year / Session</label>
            <input
              type="text"
              value={headerDetails.year}
              onChange={(e) => setHeaderDetails({ ...headerDetails, year: e.target.value })}
              placeholder="e.g., 2023-2024"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Extracted Topics */}
      {topics.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Extracted Topics ({topics.length})</h2>
          </div>
          <div className="max-h-52 overflow-y-auto border-2 border-gray-100 rounded-xl p-4 bg-gray-50/30">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {topics.map((topic, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Paper Structure Builder */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Step 3: Design Paper Structure</h2>
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
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 4: Select Output Format</h2>
          <div className="flex gap-4 justify-center">
            {[
              { value: "question-paper", label: "Question Paper", icon: FileText },
              { value: "answer-key", label: "Answer Key", icon: Key },
              { value: "questions-answers", label: "Questions with Answers", icon: BookOpen }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setOutputType(value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${outputType === value
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