import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Performance from './pages/Performance';
import Login from './pages/Login';
import KPIEntry from './pages/KPIEntry';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/kpi" replace />} />
          <Route path="kpi" element={<KPIEntry />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
