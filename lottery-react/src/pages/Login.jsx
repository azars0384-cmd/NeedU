import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(phone, pin);
    setLoading(false);

    if (res.success) {
      localStorage.setItem('th_lotto_user', JSON.stringify(res.data));
      navigate('/home');
    } else {
      setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-light relative overflow-hidden font-kanit">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl w-full max-w-sm relative z-10 border border-white/50">
        <div className="text-center mb-8">
           <img src="https://img2.pic.in.th/pic/TH-LOTTO.md.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg border-4 border-white" />
           <h1 className="text-3xl font-bold text-brand-dark tracking-tight">TH-LOTTO</h1>
           <p className="text-gray-500 text-sm mt-2 font-light">เข้าสู่ระบบเพื่อเริ่มใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <i className="fas fa-phone-alt absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
            <input
              type="tel"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-prompt"
              placeholder="เบอร์โทรศัพท์"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <i className="fas fa-lock absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
            <input
              type="password"
              maxLength="4"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-prompt tracking-widest text-lg"
              placeholder="รหัส PIN (4 หลัก)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs mb-3 font-light">ยังไม่มีบัญชี?</p>
          <button
            onClick={() => navigate('/register')}
            className="text-brand-primary font-bold text-sm bg-green-50 px-6 py-2 rounded-full hover:bg-green-100 transition border border-green-100"
          >
            สมัครสมาชิกใหม่
          </button>
        </div>
      </div>

      {error && (
        <Modal
          isOpen={!!error}
          onClose={() => setError(null)}
          title="แจ้งเตือน"
          actions={<button onClick={() => setError(null)} className="px-6 py-2 bg-brand-primary text-white rounded-lg">ตกลง</button>}
        >
          <div className="text-red-500 font-bold text-lg mb-2"><i className="fas fa-exclamation-circle"></i> ผิดพลาด</div>
          <p>{error}</p>
        </Modal>
      )}
    </div>
  );
};

export default Login;
