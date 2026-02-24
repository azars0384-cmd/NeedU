import React, { useEffect, useState } from 'react';
import { getUITexts } from '../services/api';

const Announcement = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const check = async () => {
      const seen = sessionStorage.getItem('announcement_shown');
      if (seen) return;

      const res = await getUITexts();
      if (res.success) {
        const settings = res.data;
        if (settings.announcement_active === 'TRUE' || settings.announcement_active === true) {
            setData({
                title: settings.announcement_title || 'ประกาศ',
                text: settings.announcement_text || '',
                image: settings.announcement_image || ''
            });
            sessionStorage.setItem('announcement_shown', 'true');
        }
      }
    };
    check();
  }, []);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative animate-zoom-in">
        <button
            onClick={() => setData(null)}
            className="absolute top-3 right-3 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center hover:bg-black/50 transition z-10"
        >
            <i className="fas fa-times"></i>
        </button>

        {data.image && (
            <img src={data.image} alt="Announcement" className="w-full h-48 object-cover" />
        )}

        <div className="p-6 text-center">
            {!data.image && (
                <div className="w-16 h-16 bg-brand-light text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i className="fas fa-bullhorn"></i>
                </div>
            )}
            <h3 className="text-xl font-bold text-brand-dark mb-2">{data.title}</h3>
            <p className="text-gray-600 font-light text-sm leading-relaxed mb-6">{data.text}</p>

            <button
                onClick={() => setData(null)}
                className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-dark transition"
            >
                รับทราบ
            </button>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
