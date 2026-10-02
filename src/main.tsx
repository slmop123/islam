import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import Database from './Database.tsx';
import Report from './Report.tsx';
import Settings from './Settings.tsx';
import TafsirPage from './Tafsir.tsx';
import { Layout } from './components/Layout.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/tafsir.html" element={<TafsirPage />} />
          <Route path="/engine.html" element={<Navigate to="/tafsir.html" replace />} />
          <Route path="/database.html" element={<Database />} />
          <Route path="/report.html" element={<Report />} />
          <Route path="/settings.html" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>,
);
