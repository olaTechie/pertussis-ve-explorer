import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import StudiesPage from './pages/StudiesPage';
import StudyDetailPage from './pages/StudyDetailPage';
import ForestPlotPage from './pages/ForestPlotPage';
import DataNavigatorPage from './pages/DataNavigatorPage';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter basename="/pertussis-ve-explorer">
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/studies" replace />} />
              <Route path="/studies" element={<StudiesPage />} />
              <Route path="/studies/:id" element={<StudyDetailPage />} />
              <Route path="/forest-plot" element={<ForestPlotPage />} />
              <Route path="/data/:section" element={<DataNavigatorPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
