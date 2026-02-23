import React, { useEffect, useState } from 'react';
import { getLatestResults } from '../services/api';
import Loader from '../components/Loader';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchResults();
  }, [filter]);

  const fetchResults = async () => {
    setLoading(true);
    const res = await getLatestResults(filter);
    if (res.success) setResults(res.data);
    setLoading(false);
  };

  const ResultCard = ({ item }) => {
    const isGov = item.lotteryTypeId === 'TH_GOV';
    const isPending = item.prizeFirst === 'รอผล...' || !item.prizeFirst;

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
            <div className="flex items-center gap-3">
                <img src={item.lotteryFlag} alt="flag" className="w-10 h-10 rounded-full shadow-sm" />
                <div>
                    <h3 className="font-bold text-gray-800">{item.lotteryName}</h3>
                    <p className="text-xs text-gray-400 font-light">{item.drawDate}</p>
                </div>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${isPending ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                {isPending ? 'รอผล' : 'ตรวจแล้ว'}
            </span>
        </div>

        <div className="text-center mb-6">
            <p className="text-[10px] text-gray-400 mb-1">{isGov ? 'รางวัลที่ 1' : '3 ตัวบน'}</p>
            <h2 className={`font-extrabold text-4xl tracking-widest ${isPending ? 'text-gray-300' : 'text-brand-primary'}`}>
                {isGov ? (item.prize6 || 'xxxxxx') : (item.prize6 ? item.prize6.slice(-3) : 'XXX')}
            </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl">
            <div className="text-center border-r border-gray-200">
                <p className="text-lg font-bold text-gray-700">{item.prizeFirst3 || 'XXX'}</p>
                <p className="text-[9px] text-gray-400">{isGov ? '3 ตัวหน้า' : '3 ตัวบน'}</p>
            </div>
            <div className="text-center border-r border-gray-200">
                <p className="text-lg font-bold text-red-500">{item.prizeLast2 || 'XX'}</p>
                <p className="text-[9px] text-gray-400">2 ตัวล่าง</p>
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-gray-700">{isGov ? (item.prizeLast3 || 'XXX') : (item.prize6 ? item.prize6.slice(-2) : 'XX')}</p>
                <p className="text-[9px] text-gray-400">{isGov ? '3 ตัวท้าย' : '2 ตัวบน'}</p>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold text-brand-dark mb-4">ผลรางวัล</h1>

      <div className="mb-4">
        <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-primary"
        >
            <option value="ALL">ทั้งหมด</option>
            <option value="TH_GOV">รัฐบาลไทย</option>
            <option value="LAO_DEV">ลาวพัฒนา</option>
            <option value="HANOI">ฮานอย</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-4">
            {results.length > 0 ? results.map((r, i) => <ResultCard key={i} item={r} />) : (
                <div className="text-center py-10 text-gray-400 font-light">ไม่พบผลรางวัล</div>
            )}
        </div>
      )}
    </div>
  );
};

export default Results;
