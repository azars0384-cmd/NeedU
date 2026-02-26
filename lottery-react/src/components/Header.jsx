import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHeadset, FaTimes, FaRobot, FaPaperPlane, FaCommentDots } from 'react-icons/fa';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([{ type: 'bot', text: 'สวัสดีครับ ยินดีต้อนรับสู่ TH-LOTTO หากมีข้อสงสัยสอบถามได้เลยครับ' }]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { type: 'user', text: inputText }]);
    setInputText('');
    setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: 'ขณะนี้แอดมินให้บริการลูกค้าจำนวนมาก กรุณาติดต่อทาง Line เพื่อความรวดเร็วครับ' }]);
    }, 1000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full max-w-md mx-auto bg-gradient-to-b from-brand-primary to-brand-secondary text-white p-4 flex justify-between items-center shadow-md">
        <div onClick={() => navigate('/home')} className="flex items-center gap-2 cursor-pointer">
          <img src="https://img2.pic.in.th/pic/TH-LOTTO.md.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white/20" />
          <span className="font-bold text-xl tracking-tight drop-shadow-sm">TH-LOTTO</span>
        </div>

        {user ? (
          <div onClick={() => navigate('/profile')} className="flex items-center gap-2 bg-black/20 rounded-full p-1 pr-3 cursor-pointer hover:bg-black/30 transition-colors">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700">
              <FaUser />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-xs font-bold truncate max-w-[80px]">{user.username}</span>
              <span className="block text-xs font-medium text-yellow-300">฿ {user.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        ) : (
            <button onClick={() => navigate('/login')} className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition">เข้าสู่ระบบ</button>
        )}
      </header>

      {/* Chat Widget */}
      <div className="fixed bottom-[100px] right-4 z-50 flex flex-col items-end">
        {showChat && (
          <div className="bg-white w-72 h-96 rounded-2xl shadow-2xl mb-3 flex flex-col overflow-hidden border border-gray-100 animate-slide-up">
            <div className="bg-brand-primary p-3 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                 <FaHeadset />
                 <span className="text-sm font-bold">ติดต่อสอบถาม</span>
              </div>
              <button onClick={() => setShowChat(false)} className="hover:bg-white/20 rounded-full p-1"><FaTimes /></button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3 text-sm scrollbar-hide">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 items-start ${msg.type === 'user' ? 'justify-end' : ''}`}>
                  {msg.type === 'bot' && <div className="w-7 h-7 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-gray-500"><FaRobot /></div>}
                  <div className={`p-3 rounded-xl shadow-sm max-w-[85%] font-light ${msg.type === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white text-gray-700 rounded-bl-none border'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white border-t flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition font-medium"
                placeholder="พิมพ์ข้อความ..."
              />
              <button onClick={handleSend} className="w-9 h-9 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-dark shadow-md transition transform active:scale-95">
                <FaPaperPlane className="text-xs" />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform duration-200 relative group active:scale-95"
        >
          <FaCommentDots className="text-2xl group-hover:animate-bounce" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">1</span>
        </button>
      </div>
    </>
  );
};

export default Header;
