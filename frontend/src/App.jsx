import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomeRedirect from './components/HomeRedirect';
import Inventory from './pages/Inventory';
import Performance from './pages/Performance';
import Login from './pages/Login';
import KPIEntry from './pages/KPIEntry';
import AddManager from './pages/AddManager';
import SetTargets from './pages/SetTargets';
import AddStore from './pages/AddStore';
import AddStoreOwner from './pages/AddStoreOwner';
import Stores from './pages/Stores';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}><Layout /></ProtectedRoute>}>
            <Route index element={<HomeRedirect />} />
            <Route path="kpi" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}>
                <KPIEntry />
              </ProtectedRoute>
            } />
            <Route path="set-targets" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <SetTargets />
              </ProtectedRoute>
            } />
            <Route path="add-manager" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <AddManager />
              </ProtectedRoute>
            } />
            <Route path="add-store" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AddStore />
              </ProtectedRoute>
            } />
            <Route path="add-store-owner" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AddStoreOwner />
              </ProtectedRoute>
            } />
            <Route path="stores" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Stores />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
