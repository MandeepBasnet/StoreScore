import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Performance from './pages/Performance';
import Login from './pages/Login';
import KPIEntry from './pages/KPIEntry';
import AddManager from './pages/AddManager';
import SetTargets from './pages/SetTargets';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="kpi" element={<KPIEntry />} />
            <Route path="set-targets" element={<SetTargets />} />
            <Route path="add-manager" element={<AddManager />} /> {/* New Route */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
