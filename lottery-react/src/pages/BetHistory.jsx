import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBetHistory } from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/format';

const BetHistory = () => {
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, won, pending, lose

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('th_lotto_user'));
    const res = await getUserBetHistory(user.userId);
    if (res.success) setBets(res.data);
    setLoading(false);
  };

  const filteredBets = bets.filter(b => filter === 'all' ? true : b.status === filter);
  const totalWin = filteredBets.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.winAmount || 0), 0);

  const getStatusColor = (status) => {
    switch(status) {
        case 'won': return 'bg-green-100 text-green-700 border-green-200';
        case 'lose': return 'bg-red-50 text-red-500 border-red-100';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
        case 'won': return 'ถูกรางวัล';
        case 'lose': return 'ไม่ถูกรางวัล';
        case 'pending': return 'รอผล';
        default: return status;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-brand-primary p-4 text-white sticky top-0 z-30 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/bet')} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
            <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-xl font-bold">โพยของฉัน</h1>
      </div>

      <div className="p-4">
        {/* Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
            {['all', 'won', 'pending', 'lose'].map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filter === f ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                    {f === 'all' ? 'ทั้งหมด' : getStatusLabel(f)}
                </button>
            ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex justify-between items-center border border-gray-100">
            <div>
                <p className="text-xs text-gray-400 font-light">ยอดถูกรางวัลรวม (รายการที่แสดง)</p>
                <p className="text-xl font-bold text-green-600">฿{formatCurrency(totalWin)}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-400 font-light">จำนวนรายการ</p>
                <p className="text-lg font-bold text-gray-800">{filteredBets.length}</p>
            </div>
        </div>

        {/* List */}
        <div className="space-y-3">
            {filteredBets.length > 0 ? filteredBets.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-xs font-bold">
                                {(item.lotteryName || '?').substring(0, 2)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">{item.lotteryName}</h4>
                                <p className="text-[10px] text-gray-400 font-light">{item.date}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-2 mb-2">
                        <div className="text-center flex-1 border-r border-gray-200">
                            <p className="text-[10px] text-gray-400 font-light">เลขที่แทง</p>
                            <p className="text-lg font-bold text-brand-dark">{item.number}</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[10px] text-gray-400 font-light">ประเภท</p>
                            <p className="text-sm font-bold text-gray-600">{item.type}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <div>
                            <span className="text-gray-400 font-light">เดิมพัน:</span>
                            <span className="font-bold ml-1">฿{formatCurrency(item.amount)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 font-light">ผลรางวัล:</span>
                            <span className={`font-bold ml-1 ${item.winAmount > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                {item.winAmount > 0 ? '+' + formatCurrency(item.winAmount) : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center py-10 text-gray-400 font-light flex flex-col items-center">
                    <i className="far fa-file-alt text-4xl mb-3 opacity-30"></i>
                    <p>ยังไม่มีประวัติการแทง</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BetHistory;
