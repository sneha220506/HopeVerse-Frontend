import { useState } from 'react';

export default function VerifyEmail({ email, onVerify, onResendOTP }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling) element.nextSibling.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onVerify(email, otp.join(''));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-10 shadow-2xl border border-white text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-2">Verify <span className="text-[#8E7CC3]">Email</span></h2>
        <p className="text-slate-400 text-sm mb-8 font-semibold">Code sent to <br/> <span className="text-slate-600">{email}</span></p>
        
        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-14 border-2 border-slate-100 rounded-xl text-center text-xl font-bold focus:border-[#8E7CC3] focus:outline-none transition-all"
                value={data}
                onChange={e => handleChange(e.target, index)}
                onFocus={e => e.target.select()}
              />
            ))}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#8E7CC3] text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black shadow-lg hover:-translate-y-1 transition-all"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <button 
          onClick={() => onResendOTP(email)}
          className="mt-8 text-xs font-bold text-slate-400 hover:text-[#8E7CC3] transition-colors"
        >
          Didn't receive code? <span className="text-[#8E7CC3] underline underline-offset-4 ml-1">Resend</span>
        </button>
      </div>
    </div>
  );
}