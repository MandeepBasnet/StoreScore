import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            // Role-based Redirect Logic
            if (user.role === 'super_admin') {
                navigate('/add-store');
            } else if (user.role === 'admin') {
                navigate('/add-manager');
            } else {
                // Default for Managers and others
                navigate('/kpi');
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-xl text-gray-600">Redirecting...</div>
        </div>
    );
};

export default HomeRedirect;
