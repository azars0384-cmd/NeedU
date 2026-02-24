import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLotteryTypes, placeBet } from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/format';

const Bet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState(location.state?.lotteryId ? 'detail' : 'list');
  const [lotteries, setLotteries] = useState([]);
  const [selectedLotto, setSelectedLotto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Betting State
  const [tab, setTab] = useState('two'); // two, three, set
  const [betOption, setBetOption] = useState(null);
  const [number, setNumber] = useState('');
  const [slip, setSlip] = useState([]);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    fetchLotteries();
  }, []);

  useEffect(() => {
    if (location.state?.lotteryId && lotteries.length > 0) {
      const lotto = lotteries.find(l => l['รหัสประเภทหวย'] === location.state.lotteryId);
      if (lotto) selectLottery(lotto);
    }
  }, [location.state, lotteries]);

  useEffect(() => {
    let timer;
    if (selectedLotto && selectedLotto.rawClose) {
      const target = new Date(selectedLotto.rawClose).getTime();
      timer = setInterval(() => {
        const now = new Date().getTime();
        const dist = target - now;
        if (dist < 0) {
            setCountdown("ปิดรับแทง");
            clearInterval(timer);
        } else {
            const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((dist % (1000 * 60)) / 1000);
            setCountdown(`${h}:${m}:${s}`);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedLotto]);

  const fetchLotteries = async () => {
    setLoading(true);
    const res = await getLotteryTypes();
    setLoading(false);
    if (res.success) setLotteries(res.data);
  };

  const selectLottery = (lotto) => {
    setSelectedLotto(lotto);
    setView('detail');
    setSlip([]);
    setNumber('');
    setBetOption(null);
  };

  const handleKeyPress = (key) => {
    const limit = tab === 'two' ? 2 : (tab === 'three' ? 3 : 4);
    if (key === 'del') {
      setNumber(prev => prev.slice(0, -1));
    } else if (number.length < limit) {
      const newNum = number + key;
      setNumber(newNum);
      if (newNum.length === limit) {
        // Auto add logic if option selected, otherwise just wait
        if (betOption) {
            setTimeout(() => addBetToSlip(newNum), 200);
        }
      }
    }
  };

  const addBetToSlip = (num) => {
    if (!betOption) return;
    if (slip.some(s => s.number === num && s.option === betOption)) return;

    const newBet = {
        id: Date.now(),
        number: num,
        option: betOption,
        amount: tab === 'set' ? 120 : 5
    };
    setSlip([...slip, newBet]);
    setNumber('');
  };

  const updateAmount = (id, amount) => {
    setSlip(slip.map(s => s.id === id ? { ...s, amount: parseInt(amount) || 0 } : s));
  };

  const removeBet = (id) => {
    setSlip(slip.filter(s => s.id !== id));
  };

  const submitBet = async () => {
    if (slip.length === 0) return;
    setLoading(true);
    const bets = slip.map(s => ({ number: s.number, format: s.option, amount: s.amount }));
    const user = JSON.parse(localStorage.getItem('th_lotto_user'));

    const res = await placeBet(user.userId, selectedLotto['รหัสประเภทหวย'], JSON.stringify(bets));
    setLoading(false);

    if (res.success) {
        const newUser = { ...user, balance: res.data.newBalance };
        localStorage.setItem('th_lotto_user', JSON.stringify(newUser));
        setSlip([]);
        alert('ส่งโพยสำเร็จ!');
        navigate('/bet-history');
    } else {
        alert(res.error || 'ส่งโพยไม่สำเร็จ');
    }
  };

  const renderKeypad = () => {
    const keys = ['1','2','3','4','5','6','7','8','9','del','0',''];
    return (
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mt-4">
            {keys.map((k, i) => (
                k === '' ? <div key={i}></div> :
                <button
                    key={i}
                    onClick={() => handleKeyPress(k)}
                    className="h-14 bg-white border border-gray-200 rounded-xl shadow-sm text-xl font-medium active:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
                >
                    {k === 'del' ? <i className="fas fa-backspace text-red-400"></i> : k}
                </button>
            ))}
        </div>
    );
  };

  if (loading) return <Loader />;

  if (view === 'list') {
    return (
        <div className="pb-20 p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-brand-dark">แทงหวย</h1>
                <button onClick={() => navigate('/bet-history')} className="px-3 py-1.5 bg-white border border-green-200 rounded-lg text-xs font-bold text-brand-primary shadow-sm">
                    <i className="fas fa-receipt mr-1"></i> โพยของฉัน
                </button>
            </div>
            <div className="space-y-4">
                {lotteries.map((lotto, idx) => (
                    <div
                        key={idx}
                        onClick={() => selectLottery(lotto)}
                        className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        <div className="p-4 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
                            <div className="flex items-center gap-3">
                                <img src={lotto['ลิงก์รูปภาพ']} className="w-12 h-12 rounded-full border shadow-sm object-cover" alt="logo" />
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{lotto['ชื่อเต็ม']}</h3>
                                    <p className="text-xs text-gray-500 font-light">{lotto['ชื่อย่อ']} | งวด {lotto['รอบ/วันที่ออก']}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">เปิดรับแทง</span>
                        </div>
                        <div className="grid grid-cols-2 text-center py-2 bg-gray-50 border-t border-gray-100">
                            <div className="border-r border-gray-200">
                                <span className="text-[10px] text-gray-400 block">ปิดรับ</span>
                                <span className="text-sm font-bold text-red-500">{lotto['formattedClose']}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block">3 ตัวบน</span>
                                <span className="text-sm font-bold text-brand-primary">฿{lotto['อัตราจ่าย_สามตัวบน']}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
        <div className="bg-brand-primary p-4 text-white sticky top-0 z-30 shadow-md flex items-center gap-3">
            <button onClick={() => setView('list')}><i className="fas fa-arrow-left text-xl"></i></button>
            <span className="font-bold text-lg">{selectedLotto['ชื่อเต็ม']}</span>
        </div>

        <div className="p-4 space-y-4">
            {/* Live & Timer */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800">ปิดรับใน:</h3>
                    <div className="text-2xl font-mono font-bold text-red-500 bg-red-50 px-3 rounded-lg">
                        {countdown || '--:--:--'}
                    </div>
                </div>
                {selectedLotto['ลิงก์วิดีโอ'] && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mt-3">
                        <iframe src={selectedLotto['ลิงก์วิดีโอ']} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl shadow-sm flex">
                {['two', 'three', 'set'].map(t => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); setBetOption(null); setNumber(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === t ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500'}`}
                    >
                        {t === 'two' ? '2 ตัว' : (t === 'three' ? '3 ตัว' : 'หวยชุด')}
                    </button>
                ))}
            </div>

            {/* Options */}
            <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-2 gap-3">
                {tab === 'two' && ['สองตัวบน', 'สองตัวล่าง'].map(opt => (
                    <button key={opt} onClick={() => setBetOption(opt)} className={`border py-2 rounded-lg text-sm font-bold ${betOption === opt ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600'}`}>
                        {opt} <span className="text-[10px] text-gray-400 block font-light">บาทละ {selectedLotto[`อัตราจ่าย_${opt.replace(/ /g,'')}`] || 90}</span>
                    </button>
                ))}
                {tab === 'three' && ['สามตัวบน', 'สามตัวโต๊ด', 'สามตัวล่าง'].map(opt => (
                    <button key={opt} onClick={() => setBetOption(opt)} className={`border py-2 rounded-lg text-sm font-bold ${betOption === opt ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600'}`}>
                        {opt} <span className="text-[10px] text-gray-400 block font-light">บาทละ {selectedLotto[`อัตราจ่าย_${opt.replace(/ /g,'')}`] || 900}</span>
                    </button>
                ))}
                {tab === 'set' && <div className="col-span-2 text-center p-4 bg-gray-50 rounded-lg">หวยชุด 4 ตัว (ลุ้นรางวัลใหญ่)</div>}
            </div>

            {/* Display */}
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="flex justify-center gap-2 mb-4 h-12 items-center">
                    {Array.from({ length: tab === 'two' ? 2 : (tab === 'three' ? 3 : 4) }).map((_, i) => (
                        <div key={i} className="w-10 h-12 border-b-2 border-brand-primary text-3xl font-bold text-gray-800 flex items-center justify-center">
                            {number[i] || ''}
                        </div>
                    ))}
                </div>
                {renderKeypad()}
            </div>

            {/* Slip */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold border-b pb-2 mb-2">รายการแทง ({slip.length})</h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                    {slip.map(s => (
                        <div key={s.id} className="flex justify-between items-center text-sm">
                            <span><strong className="text-lg">{s.number}</strong> ({s.option})</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={s.amount}
                                    onChange={(e) => updateAmount(s.id, e.target.value)}
                                    className="w-16 border rounded text-center font-bold text-brand-primary"
                                />
                                <button onClick={() => removeBet(s.id)} className="text-red-500"><i className="fas fa-times"></i></button>
                            </div>
                        </div>
                    ))}
                    {slip.length === 0 && <p className="text-center text-gray-400 font-light text-xs">ยังไม่มีรายการ</p>}
                </div>
                <button
                    onClick={submitBet}
                    disabled={slip.length === 0}
                    className="w-full mt-4 bg-brand-dark text-white font-bold py-3 rounded-xl disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-lg"
                >
                    ส่งโพย (รวม {formatCurrency(slip.reduce((a,b) => a + b.amount, 0))})
                </button>
            </div>
        </div>
    </div>
  );
};

export default Bet;
