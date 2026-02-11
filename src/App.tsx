import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/dashboard';
import { Stock } from './pages/stock';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona / para /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rotas com layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock" element={<Stock />} />
          {/* Adicione mais rotas conforme precisar */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;