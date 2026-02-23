import React, { useEffect, useState } from 'react';
import { getUserInfo, getUserReferralSummary, getUserWithdrawalsToday } from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [refSummary, setRefSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const localUser = JSON.parse(localStorage.getItem('th_lotto_user'));
      const [uRes, rRes] = await Promise.all([
        getUserInfo(localUser.userId),
        getUserReferralSummary(localUser.userId)
      ]);

      if (uRes.success) setUser({ ...localUser, ...uRes.data });
      if (rRes.success) setRefSummary(rRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    if (window.confirm('ต้องการออกจากระบบ?')) {
        localStorage.removeItem('th_lotto_user');
        navigate('/login');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="pb-20 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
                    <i className="fas fa-user"></i>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-brand-dark">{user?.name}</h2>
                    <p className="text-sm text-gray-500 font-light">{user?.username}</p>
                </div>
            </div>
            <button className="text-xs border border-brand-primary text-brand-primary px-3 py-1 rounded-full hover:bg-brand-primary hover:text-white transition">แก้ไข</button>
        </div>

        {/* Affiliate */}
        <div className="bg-gradient-to-br from-brand-primary to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2"><i className="fas fa-users"></i> ระบบแนะนำเพื่อน</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-xl font-bold">{formatCurrency(refSummary?.totalCommission || 0)}</p>
                    <p className="text-[10px] opacity-80">ค่าคอมมิชชั่น</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-xl font-bold">{refSummary?.totalMembers || 0}</p>
                    <p className="text-[10px] opacity-80">สมาชิก</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition">
                    <p className="text-xl font-bold"><i className="fas fa-link"></i></p>
                    <p className="text-[10px] opacity-80">คัดลอกลิงก์</p>
                </div>
            </div>
        </div>

        {/* Bank Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">ข้อมูลธนาคาร</h3>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-xl">
                    <i className="fas fa-university"></i>
                </div>
                <div>
                    <p className="font-bold text-brand-dark">{user?.bankName}</p>
                    <p className="text-sm text-gray-500 font-light">{user?.accountNumber}</p>
                    <p className="text-xs text-gray-400 mt-1">{user?.accountName}</p>
                </div>
            </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center text-gray-700">
                <span className="font-medium"><i className="fas fa-question-circle mr-3 text-gray-400"></i> ช่วยเหลือ</span>
                <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            </button>
            <button className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center text-gray-700">
                <span className="font-medium"><i className="fas fa-file-alt mr-3 text-gray-400"></i> เงื่อนไขการใช้งาน</span>
                <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            </button>
            <button onClick={handleLogout} className="w-full text-left p-4 hover:bg-red-50 flex justify-between items-center text-red-500">
                <span className="font-bold"><i className="fas fa-sign-out-alt mr-3"></i> ออกจากระบบ</span>
            </button>
        </div>
    </div>
  );
};

export default Profile;
