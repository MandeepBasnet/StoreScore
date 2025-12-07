import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Performance from './pages/Performance';
import Login from './pages/Login';
import KPIEntry from './pages/KPIEntry';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="kpi" element={<KPIEntry />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
