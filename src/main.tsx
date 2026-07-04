import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Engine from './Engine.tsx';
import Database from './Database.tsx';
import { Layout } from './components/Layout.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/engine.html" element={<Engine />} />
          <Route path="/database.html" element={<Database />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>,
);
