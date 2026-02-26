import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = ({ role = 'user' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const user = JSON.parse(localStorage.getItem('th_lotto_user'));

  useEffect(() => {
    if (user) {
      if (role === 'admin' && user.role !== 'admin') {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [user, role]);

  if (isAuthenticated === null) return null; // or a loading spinner

  if (!isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
