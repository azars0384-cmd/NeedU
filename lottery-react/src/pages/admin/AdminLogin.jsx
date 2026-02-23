import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api';
import Loader from '../../components/Loader';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await adminLogin(username, password);
    setLoading(false);

    if (res.success) {
      localStorage.setItem('th_lotto_user', JSON.stringify({ ...res.data, role: 'admin' }));
      navigate('/admin/dashboard');
    } else {
      alert('Login Failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 font-kanit">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Panel</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 border rounded-lg"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
