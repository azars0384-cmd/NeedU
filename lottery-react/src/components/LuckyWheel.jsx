import React, { useEffect, useState, useRef } from 'react';
import { getWheelPrizes, spinWheel } from '../services/api';
import { FaPlay, FaTimes, FaGift, FaFrown } from 'react-icons/fa';

const LuckyWheel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({ dailyLimit: 3, spinCost: 0 });
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchPrizes();
    }
  }, [isOpen]);

  const fetchPrizes = async () => {
    const res = await getWheelPrizes();
    if (res.success) {
      setItems(res.data);
      setSettings(res.settings);
      drawWheel(res.data, 0);
    }
  };

  const drawWheel = (prizes, currentRotation) => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const segmentAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentRotation * Math.PI / 180);
    ctx.translate(-center, -center);

    prizes.forEach((item, i) => {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item['สี'] || ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5];
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Kanit';
      const text = item['ชื่อรางวัล'];
      ctx.fillText(text.length > 12 ? text.substring(0, 12) + '..' : text, radius - 20, 4);
      ctx.restore();
    });
    ctx.restore();
  };

  const handleSpin = async () => {
    if (spinning) return;
    const user = JSON.parse(localStorage.getItem('th_lotto_user'));
    if (!user) return alert('กรุณาเข้าสู่ระบบ');

    setSpinning(true);
    const res = await spinWheel(user.userId);

    if (res.success) {
      const prizeIndex = items.findIndex(i => i['รหัสรางวัล'] === res.prize.id); // Assuming API returns ID
      // If API returns name, match by name. Let's assume name for now based on previous code.
      // Better: The mock API in code.gs returns { name: ..., value: ... }
      // We need to match index.
      const winningIndex = items.findIndex(i => i['ชื่อรางวัล'] === res.prize.name);

      const segmentAngle = 360 / items.length;
      // Calculate target rotation to land the winning segment at 270 degrees (top)
      // Actually standard draw starts -90 (top). So index 0 is at top.
      // To land index i at top, we need to rotate wheel by - (i * segmentAngle).
      // Adding extra spins.

      const targetRotation = 3600 + (360 - (winningIndex * segmentAngle));

      // Animate
      let start = null;
      const duration = 4000;

      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const currentRot = easeOut(Math.min(progress / duration, 1)) * targetRotation;

        drawWheel(items, currentRot);

        if (progress < duration) {
          requestAnimationFrame(animate);
        } else {
          setSpinning(false);
          setResult(res.prize);
          // Update local balance if credit won
          if (res.prize.value > 0) {
             const newUser = { ...user, balance: (user.balance || 0) + res.prize.value };
             localStorage.setItem('th_lotto_user', JSON.stringify(newUser));
          }
        }
      };
      requestAnimationFrame(animate);

    } else {
      alert(res.error);
      setSpinning(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[170px] right-4 z-40 w-[60px] h-[60px] bg-gradient-to-br from-amber-400 to-orange-600 rounded-full shadow-lg flex items-center justify-center animate-bounce-slow hover:scale-110 transition text-white text-2xl border-2 border-white"
      >
        <i className="fas fa-dharmachakra"></i>
      </button>

      {/* Game Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden relative shadow-2xl">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex justify-between items-center">
               <h3 className="font-bold text-xl"><i className="fas fa-star mr-2"></i>กงล้อนำโชค</h3>
               <button onClick={() => setIsOpen(false)}><FaTimes /></button>
            </div>

            <div className="p-6 bg-gray-50 flex flex-col items-center relative">
               {/* Arrow */}
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-red-600 text-4xl drop-shadow-md">
                 <i className="fas fa-caret-down"></i>
               </div>

               <canvas ref={canvasRef} width={280} height={280} className="rounded-full shadow-xl border-4 border-amber-400" />

               {/* Center Button */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-16 h-16 rounded-full shadow-inner flex items-center justify-center border-4 border-gray-100">
                 <span className="text-amber-500 font-bold text-xs">SPIN</span>
               </div>

               <button
                 onClick={handleSpin}
                 disabled={spinning}
                 className="mt-6 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 transition transform active:scale-95"
               >
                 {spinning ? 'กำลังหมุน...' : 'หมุนเลย!'}
               </button>

               <p className="mt-2 text-xs text-gray-500">สิทธิ์คงเหลือ: {settings.dailyLimit} ครั้ง</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full animate-zoom-in">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 ${result.value > 0 ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                 {result.value > 0 ? <FaGift /> : <FaFrown />}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{result.value > 0 ? 'ยินดีด้วย!' : 'เสียใจด้วย'}</h3>
              <p className="text-gray-600 mb-4">{result.name}</p>
              {result.value > 0 && <p className="text-3xl font-bold text-green-600 mb-6">+฿{result.value}</p>}
              <button onClick={() => setResult(null)} className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg">ตกลง</button>
           </div>
        </div>
      )}
    </>
  );
};

export default LuckyWheel;
