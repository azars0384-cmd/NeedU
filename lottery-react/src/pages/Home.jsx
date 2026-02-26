import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomePageData, getLatestResults } from '../services/api';
import Loader from '../components/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [homeData, resultData] = await Promise.all([
        getHomePageData(),
        getLatestResults('ALL')
      ]);

      if (homeData.success) setData(homeData.data);
      if (resultData.success && resultData.data.length > 0) {
        setLatestResult(resultData.data[0]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 pb-20">
      {/* Sliders */}
      {data?.sliders && (
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={12}
          slidesPerView={'auto'}
          centeredSlides={true}
          loop={true}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          className="rounded-xl overflow-hidden shadow-md"
        >
          {data.sliders.map((s, idx) => (
            <SwiperSlide key={idx} className="w-[90%]">
              <a href={s['ลิงก์ปลายทาง'] || '#'}>
                <img src={s['ลิงก์รูปภาพ']} alt={s['หัวข้อ']} className="w-full h-auto aspect-[21/9] object-cover rounded-xl" />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Latest Result Hero */}
      {latestResult && (
        <div
          onClick={() => navigate('/results')}
          className="bg-brand-primary rounded-3xl p-6 text-white shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl"><i className="fas fa-trophy"></i></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <img src={latestResult.lotteryFlag} alt="flag" className="w-6 h-6 rounded-full border border-white/20" />
                <span className="font-bold text-sm">ผลล่าสุด: {latestResult.lotteryName}</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-light">{latestResult.drawDate}</span>
            </div>
            <div className="text-center py-2">
              <p className="text-[10px] opacity-80 uppercase tracking-widest mb-1">รางวัลที่ 1 / รางวัลหลัก</p>
              <h3 className="text-4xl font-extrabold tracking-tighter">{latestResult.prizeFirst || 'รอผล...'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-[10px] opacity-70 mb-1">2 ตัวล่าง</p>
                <p className="text-xl font-bold">{latestResult.prizeLast2 || '-'}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] opacity-70 mb-1">3 ตัวบน</p>
                <p className="text-xl font-bold">{latestResult.prize6 ? latestResult.prize6.slice(-3) : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Lotto */}
      <section>
        <h2 className="text-xl font-bold text-brand-dark mb-4 pl-2 border-l-4 border-brand-primary">หวยยอดนิยม</h2>
        <div className="grid grid-cols-3 gap-3">
          {data?.popularLotto?.map((lotto, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/bet', { state: { lotteryId: lotto['รหัสประเภทหวย'] } })}
              className="relative flex flex-col items-center bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-gray-100"
            >
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-1.5 rounded-bl-lg rounded-tr-lg font-bold shadow-sm z-10">HOT</span>
              <div className="relative mb-2">
                <img src={lotto['ลิงก์รูปภาพ']} alt={lotto['ชื่อย่อ']} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" />
                <span className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white shadow-sm"></span>
              </div>
              <span className="text-[10px] font-bold text-gray-800 text-center truncate w-full mb-0.5">{lotto['ชื่อย่อ']}</span>
              <span className="text-[8px] text-red-500 font-bold bg-red-50 px-2 rounded-full border border-red-100 italic">ปิด {lotto['formattedClose'] || lotto['เวลาปิดรับ']}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Promotions */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-brand-dark border-l-4 border-brand-primary pl-2">โปรโมชั่น</h2>
          <button onClick={() => navigate('/wallet')} className="text-brand-primary text-sm font-semibold hover:underline">ดูทั้งหมด</button>
        </div>
        <Swiper
          spaceBetween={15}
          slidesPerView={'auto'}
          className="pb-4 pl-2"
        >
          {data?.promos?.map((p, idx) => (
            <SwiperSlide key={idx} className="!w-[80%] max-w-[280px]">
              <div className="bg-white rounded-xl overflow-hidden shadow-md h-full flex flex-col">
                <img src={p['ลิงก์รูปภาพ']} alt={p['หัวข้อโปร']} className="w-full h-32 object-cover" />
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm text-brand-primary truncate">{p['หัวข้อโปร']}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 font-light flex-1">{p['ข้อความโปร (บรรทัด1)']}</p>
                  <button onClick={() => navigate('/wallet')} className="mt-3 w-full bg-brand-light text-brand-primary text-xs py-1.5 rounded-lg font-bold hover:bg-brand-primary hover:text-white transition">รับโปรโมชั่น</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Articles */}
      <section>
         <h2 className="text-xl font-bold text-brand-dark mb-4 pl-2 border-l-4 border-brand-primary">บทความ</h2>
         <div className="space-y-4 px-2">
            {data?.articles?.map((a, idx) => (
              <article key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition">
                <img src={a['ลิงก์รูปภาพ']} alt={a['หัวข้อ']} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800">{a['หัวข้อ']}</h3>
                  <div className="flex justify-between items-center border-t pt-3 mt-2">
                    <span className="text-xs text-gray-400 font-light">{new Date(a['วันที่สร้าง']).toLocaleDateString('th-TH')}</span>
                    <button className="text-brand-primary text-sm font-bold flex items-center gap-1 hover:underline">อ่านต่อ <i className="fas fa-arrow-right text-xs"></i></button>
                  </div>
                </div>
              </article>
            ))}
         </div>
      </section>
    </div>
  );
};

export default Home;
