import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Engine from './Engine.tsx';
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
          <Route path="/engine.html" element={<Engine />} />
          <Route path="/database.html" element={<Database />} />
          <Route path="/report.html" element={<Report />} />
          <Route path="/settings.html" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>,
);
