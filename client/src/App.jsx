// import React from 'react'
// import { Route, Routes } from 'react-router-dom'
// import Home from './pages/Home'
// import Layout from './pages/Layout'
// import Dashboard from './pages/Dashboard'
// import NoteGenPage from './pages/NoteGenPage'
// import Login from './pages/Login'

// const App = () => {
//   return (
//     <>
//       <Routes>
//         <Route path='/' element={<Home/>}/>
//         <Route path='app' element={<Layout/>}>
//           <Route index element={<Dashboard/>}/>
//           <Route path='notegen/:noteId' element={<NoteGenPage/>}/>
//         </Route>

        
//         <Route path='login' element={<Login/>}/>
//       </Routes>
//     </>
//   )
// }

// export default App

import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import NoteGenPage from "./pages/NoteGenPage";
import NotePreview from "./pages/NotePreview";
import Login from "./pages/Login";
import AllFiles from "./pages/AllFiles";
import UploadPdfNotes from "./pages/UploadPdfNotes";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="uploadfile" element={<UploadPdfNotes/>} />
          <Route path="allfiles" element={<AllFiles/>} />

          {/* CREATE / EDIT NOTE */}
          <Route path="notegen/:id" element={<NoteGenPage />} />

          {/* PREVIEW NOTE */}
          <Route path="preview/:id" element={<NotePreview />} />
        </Route>

        <Route path="login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
