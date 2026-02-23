import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, getBanks } from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    pin: '',
    confirmPin: '',
    name: '',
    referrer: '',
    bank: '',
    accountName: '',
    accountNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchBanks = async () => {
    setLoading(true);
    const res = await getBanks(true);
    setLoading(false);
    if (res.success) {
      setBanks(res.data);
    } else {
      setError('ไม่สามารถโหลดข้อมูลธนาคารได้');
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (formData.pin !== formData.confirmPin) {
      setError('รหัส PIN ไม่ตรงกัน');
      return;
    }
    if (step === 1) {
      fetchBanks();
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register({
      phone: formData.phone,
      pin: formData.pin,
      name: formData.name,
      referrer: formData.referrer,
      bankName: formData.bank,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber
    });
    setLoading(false);

    if (res.success) {
      localStorage.setItem('th_lotto_user', JSON.stringify(res.data));
      navigate('/home');
    } else {
      setError(res.error || 'การสมัครสมาชิกผิดพลาด');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      {loading && <Loader />}

      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm relative">
        <button onClick={() => step === 1 ? navigate('/login') : setStep(1)} className="absolute top-4 left-4 text-gray-400 hover:text-brand-primary">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-brand-dark">สมัครสมาชิก ({step}/2)</h2>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="relative">
              <i className="fas fa-mobile-alt absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <input type="tel" name="phone" placeholder="เบอร์โทรศัพท์" required value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none" />
            </div>
            <div className="relative">
              <i className="fas fa-key absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <input type="password" name="pin" maxLength="4" placeholder="ตั้งรหัส PIN (4 หลัก)" required value={formData.pin} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none tracking-widest" />
            </div>
            <div className="relative">
              <i className="fas fa-check-circle absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <input type="password" name="confirmPin" maxLength="4" placeholder="ยืนยันรหัส PIN" required value={formData.confirmPin} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none tracking-widest" />
            </div>
            <div className="relative">
              <i className="fas fa-user absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <input type="text" name="name" placeholder="ชื่อ-นามสกุล (ตรงกับบัญชีธนาคาร)" required value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none" />
            </div>
            <div className="relative">
              <i className="fas fa-user-friends absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <input type="text" name="referrer" placeholder="รหัสผู้แนะนำ (ถ้ามี)" value={formData.referrer} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none" />
            </div>
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-brand-dark transition-all">ถัดไป</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <i className="fas fa-university absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <select name="bank" required value={formData.bank} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none appearance-none bg-white">
                <option value="" disabled>เลือกธนาคาร</option>
                {banks.map((bank, idx) => (
                  <option key={idx} value={bank['ชื่อธนาคาร']}>{bank['ชื่อธนาคาร']}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            <div className="relative">
              <i className="fas fa-file-signature absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <input type="text" name="accountName" placeholder="ชื่อบัญชี" required value={formData.accountName} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none" />
            </div>
            <div className="relative">
              <i className="fas fa-money-check absolute top-1/2 left-4 transform -translate-y-1/2 text-brand-primary"></i>
              <input type="text" name="accountNumber" placeholder="เลขที่บัญชี" required value={formData.accountNumber} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border focus:border-brand-primary outline-none" />
            </div>
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-brand-dark transition-all">ยืนยันการสมัคร</button>
          </form>
        )}
      </div>

      {error && (
        <Modal
          isOpen={!!error}
          onClose={() => setError(null)}
          title="แจ้งเตือน"
          actions={<button onClick={() => setError(null)} className="px-6 py-2 bg-brand-primary text-white rounded-lg">ตกลง</button>}
        >
          <div className="text-red-500 font-bold mb-2">ข้อผิดพลาด</div>
          <p>{error}</p>
        </Modal>
      )}
    </div>
  );
};

export default Register;
