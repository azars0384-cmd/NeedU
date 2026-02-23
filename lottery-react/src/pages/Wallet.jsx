import React, { useEffect, useState } from 'react';
import { getWalletPageData, createTransaction, updateTransactionDetails, getSystemBankDetails } from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { formatCurrency } from '../utils/format';

const IMGBB_API_KEY = '8e158836403df86adce925f6108ebea0';

const Wallet = () => {
  const [data, setData] = useState(null);
  const [view, setView] = useState('main'); // main, deposit_amount, deposit_qr, deposit_upload, withdraw
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(true);
  const [systemBank, setSystemBank] = useState(null);
  const [currentTxId, setCurrentTxId] = useState(null);

  // Upload State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [transferTime, setTransferTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('th_lotto_user'));
    const res = await getWalletPageData(user.userId);
    if (res.success) setData(res.data);
    setLoading(false);
  };

  const handleKeypad = (val) => {
    if (val === 'del') setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    else setAmount(prev => prev === '0' ? val : prev + val);
  };

  const startDeposit = async () => {
    setLoading(true);
    const bankRes = await getSystemBankDetails();
    if (bankRes.success) setSystemBank(bankRes.data);
    setLoading(false);
    setView('deposit_amount');
    setAmount('0');
  };

  const confirmDepositAmount = async () => {
    const val = parseFloat(amount);
    if (val <= 0) return alert('ระบุจำนวนเงิน');

    setLoading(true);
    const user = JSON.parse(localStorage.getItem('th_lotto_user'));
    // Create 'pending' transaction first
    const res = await createTransaction({ userId: user.userId, type: 'deposit', amount: val });
    setLoading(false);

    if (res.success) {
      setCurrentTxId(res.transactionId);
      setView('deposit_qr');
    } else {
      alert(res.error);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    }
  };

  const submitUpload = async () => {
    if (!file || !transferTime) return alert('กรุณาแนบสลิปและระบุเวลา');

    setLoading(true);
    // 1. Upload to ImgBB
    const formData = new FormData();
    formData.append('image', file);

    try {
      const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const imgData = await imgRes.json();

      if (imgData.success) {
        // 2. Update Transaction
        const updateRes = await updateTransactionDetails({
          transactionId: currentTxId,
          slipUrl: imgData.data.url,
          transferTime: transferTime
        });

        if (updateRes.success) {
          alert('แจ้งฝากเงินสำเร็จ กรุณารอการตรวจสอบ');
          setView('main');
          fetchData();
        } else {
          alert('อัปเดตข้อมูลไม่สำเร็จ: ' + updateRes.error);
        }
      } else {
        alert('อัปโหลดรูปภาพไม่สำเร็จ');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const submitWithdraw = async () => {
    const val = parseFloat(amount);
    if (val <= 0) return alert('ระบุจำนวนเงิน');
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('th_lotto_user'));
    const res = await createTransaction({ userId: user.userId, type: 'withdraw', amount: val });
    setLoading(false);
    if (res.success) {
      alert('แจ้งถอนเงินสำเร็จ');
      setView('main');
      fetchData();
    } else {
      alert(res.error);
    }
  };

  if (loading) return <Loader />;

  // --- Views ---

  if (view === 'main') {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-sm opacity-80 mb-1">ยอดเงินคงเหลือ</p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{formatCurrency(data?.balance)}</h1>
            <div className="flex gap-3">
                <button onClick={startDeposit} className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl font-bold backdrop-blur-sm transition flex items-center justify-center gap-2">
                    <i className="fas fa-arrow-down"></i> ฝากเงิน
                </button>
                <button onClick={() => { setView('withdraw'); setAmount('0'); }} className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl font-bold backdrop-blur-sm transition flex items-center justify-center gap-2">
                    <i className="fas fa-arrow-up"></i> ถอนเงิน
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-brand-dark mb-4 border-l-4 border-brand-primary pl-2">ประวัติล่าสุด</h3>
            <div className="space-y-3">
                {data?.history?.length > 0 ? data.history.map((h, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${h.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <i className={`fas ${h.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800">{h.type === 'deposit' ? 'ฝากเงิน' : (h.type === 'withdraw' ? 'ถอนเงิน' : 'แทงหวย')}</p>
                                <p className="text-[10px] text-gray-400">{h.time}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${h.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                {h.type === 'deposit' ? '+' : '-'}{formatCurrency(h.amount)}
                            </p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${h.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {h.status}
                            </span>
                        </div>
                    </div>
                )) : <p className="text-center text-gray-400 text-xs">ไม่มีรายการ</p>}
            </div>
        </div>
      </div>
    );
  }

  // Common Keypad Layout for Deposit/Withdraw Amount
  if (view === 'deposit_amount' || view === 'withdraw') {
    return (
        <div className="pb-20">
            <button onClick={() => setView('main')} className="mb-4 text-gray-500"><i className="fas fa-arrow-left"></i> กลับ</button>
            <h1 className="text-2xl font-bold text-brand-dark mb-6">{view === 'deposit_amount' ? 'ฝากเงิน' : 'ถอนเงิน'}</h1>

            <div className="bg-white p-6 rounded-3xl shadow-lg text-center">
                <p className="text-gray-400 text-sm mb-2">ระบุจำนวนเงิน</p>
                <div className="text-4xl font-bold text-brand-primary mb-6">{parseFloat(amount).toLocaleString()}</div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                    {[1,2,3,4,5,6,7,8,9,'del',0].map(k => (
                        k === 'del' ?
                        <button key="del" onClick={() => handleKeypad('del')} className="p-4 bg-gray-200 rounded-xl"><i className="fas fa-backspace"></i></button> :
                        <button key={k} onClick={() => handleKeypad(String(k))} className="p-4 bg-white border rounded-xl font-bold text-xl shadow-sm active:scale-95 transition">{k}</button>
                    ))}
                </div>

                <button
                    onClick={() => view === 'deposit_amount' ? confirmDepositAmount() : submitWithdraw()}
                    className="w-full mt-6 bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-brand-dark transition"
                >
                    ยืนยัน
                </button>
            </div>
        </div>
    );
  }

  if (view === 'deposit_qr') {
    return (
        <div className="pb-20 p-4">
            <h2 className="text-xl font-bold text-brand-dark text-center mb-4">สแกนจ่าย</h2>
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                <p className="text-sm text-gray-500">ยอดเงินที่ต้องชำระ</p>
                <h3 className="text-3xl font-bold text-brand-primary mb-4">฿{formatCurrency(amount)}</h3>

                <div className="bg-white p-2 border-2 border-brand-primary rounded-xl inline-block mb-4">
                    <img
                        src={`https://promptpay.io/${systemBank?.promptpay}/${amount}`}
                        alt="QR Code"
                        className="w-48 h-48 object-contain"
                    />
                </div>

                <p className="text-sm font-bold text-gray-700">{systemBank?.accountName}</p>
                <p className="text-xs text-gray-500">{systemBank?.bankName} - {systemBank?.promptpay}</p>

                <div className="mt-6 flex flex-col gap-2">
                    <button
                        onClick={() => setView('deposit_upload')}
                        className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl"
                    >
                        แจ้งโอนเงิน / อัพโหลดสลิป
                    </button>
                    <button onClick={() => setView('main')} className="w-full text-gray-500 py-2">ยกเลิก</button>
                </div>
            </div>
        </div>
    );
  }

  if (view === 'deposit_upload') {
    return (
        <div className="pb-20 p-4">
            <button onClick={() => setView('deposit_qr')} className="mb-4 text-gray-500"><i className="fas fa-arrow-left"></i> กลับ</button>
            <h1 className="text-2xl font-bold text-brand-dark mb-4">ยืนยันการโอน</h1>

            <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">เวลาที่โอน (ตามสลิป)</label>
                    <input
                        type="time"
                        value={transferTime}
                        onChange={(e) => setTransferTime(e.target.value)}
                        className="w-full p-3 border rounded-xl outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">หลักฐานการโอน</label>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 relative overflow-hidden">
                        {preview ? (
                            <img src={preview} className="w-full h-full object-contain" alt="preview" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-gray-500">คลิกเพื่ออัพโหลดรูปภาพ</p>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>

                <button
                    onClick={submitUpload}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg mt-4"
                >
                    ยืนยันการแจ้งฝาก
                </button>
            </div>
        </div>
    );
  }

  return <div>Error</div>;
};

export default Wallet;
