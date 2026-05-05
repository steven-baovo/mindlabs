'use client'

import { useState, useEffect } from 'react'
import { initSmokeSessionWithSurvey, incrementCravingDefeated, resetSmokeSession, dailyCheckIn } from '@/app/(frontend)/smoke/actions'
import { useAppTime } from '@/hooks/useAppTime'
import { Shield, Brain, Activity, AlertTriangle, AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react'

type SmokeState = {
  user_id?: string
  start_time: string
  cravings_defeated: number
  cigarettes_per_day?: number
  years_smoked?: number
  last_check_in_at?: string | null
} | null

const MILESTONES = [
  { day: 1, label: 'Ngày 1', title: 'Bước chân đầu tiên', description: 'Nồng độ CO trong máu trở về mức bình thường. Phổi bắt đầu quá trình thanh lọc đầu tiên.' },
  { day: 2, label: 'Ngày 2', title: 'Đối mặt sự bứt rứt', description: 'Nicotine rời khỏi cơ thể hoàn toàn. Vị giác bắt đầu nhạy bén hơn.' },
  { day: 3, label: 'Ngày 3', title: 'Giải phóng thể chất', description: 'Thanh lọc vật lý hoàn tất. Bạn đã vượt qua rào cản lớn nhất của cơ thể.' },
  { day: 7, label: 'Ngày 7', title: 'Các giác quan tỉnh thức', description: 'Vị giác và khứu giác đang phục hồi rõ rệt. Nhịp tim ổn định.' },
  { day: 14, label: 'Ngày 14', title: 'Vượt qua Extinction Burst', description: 'Đỉnh điểm của sự bứt rứt tâm lý đã qua. Não bộ đang học lại cách tự sản sinh Dopamine.' },
  { day: 21, label: 'Ngày 21', title: 'Thói quen đã hình thành', description: 'Chúc mừng! Đây không phải điểm kết thúc, mà là sự khởi đầu của một cuộc đời tự do mới. Hãy giữ vững nó.' },
]

// ─── INITIATION RITUAL ───────────────────────────────────────────────────────
function InitiationRitual({ onComplete }: { onComplete: (d: { cigarettesPerDay: number; yearsSmoked: number; startDate: string }) => Promise<void> }) {
  const [step, setStep] = useState(1)
  const [cigarettes, setCigarettes] = useState('')
  const [years, setYears] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [confirmText, setConfirmText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const COMMIT_PHRASE = 'TÔI ĐÃ SẴN SÀNG ĐỐI MẶT'
  const canProceed = cigarettes !== '' && years !== '' && parseInt(cigarettes) > 0 && parseInt(years) > 0

  const handleSubmit = async () => {
    if (confirmText !== COMMIT_PHRASE) return
    setIsSubmitting(true)
    const dateObj = new Date(startDate)
    dateObj.setHours(0, 0, 0, 0)
    await onComplete({ cigarettesPerDay: parseInt(cigarettes), yearsSmoked: parseInt(years), startDate: dateObj.toISOString() })
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest transition-colors ${step === s ? 'bg-[#1a2b49] text-white' : step > s ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-300'}`}>Bước {s}</div>
        ))}
      </div>
      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div><h2 className="font-lora text-2xl font-bold text-[#1a2b49] mb-2">Thiết lập lộ trình</h2><p className="text-gray-500 text-sm">Cung cấp thông tin trung thực để hệ thống đánh giá đúng mức độ lệ thuộc.</p></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số năm hút thuốc?</label><input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="5" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg text-[#1a2b49] focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số điếu/ngày?</label><input type="number" value={cigarettes} onChange={(e) => setCigarettes(e.target.value)} placeholder="10" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg text-[#1a2b49] focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" /></div>
              </div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ngày bắt đầu bỏ thuốc?</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-[#1a2b49] focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" /></div>
            </div>
            <button onClick={() => setStep(2)} disabled={!canProceed} className="w-full py-4 bg-[#1a2b49] text-white rounded-lg font-bold tracking-wide hover:bg-blue-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400">Tiếp tục →</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div><h2 className="font-lora text-2xl font-bold text-[#1a2b49] mb-2">Lộ trình 21 ngày</h2><p className="text-gray-500 text-sm">Hệ thống sẽ đồng hành cùng bạn qua từng giai đoạn phục hồi.</p></div>
            <div className="space-y-3">{MILESTONES.map((m) => (<div key={m.day} className="flex gap-4 items-start"><div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-mono font-bold text-[#1a2b49] text-xs">{m.day}</div><div><div className="font-bold text-gray-800 text-xs">{m.title}</div><div className="text-gray-500 text-[10px] leading-relaxed">{m.description}</div></div></div>))}</div>
            <div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">← Quay lại</button><button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#1a2b49] text-white rounded-lg font-bold hover:bg-blue-900 transition-colors">Tôi hiểu rồi →</button></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div><h2 className="font-lora text-2xl font-bold text-[#1a2b49] mb-2">Cam kết kỷ luật</h2><p className="text-gray-500 text-sm">Lộ trình sẽ kích hoạt vào ngày <span className="font-bold text-[#1a2b49]">{new Date(startDate).toLocaleDateString('vi-VN')}</span>.</p></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gõ: <span className="text-[#1a2b49]">{COMMIT_PHRASE}</span></label><input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={COMMIT_PHRASE} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-[#1a2b49] focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" /></div>
            <div className="flex gap-3"><button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">← Quay lại</button><button onClick={handleSubmit} disabled={confirmText !== COMMIT_PHRASE || isSubmitting} className="flex-1 py-3 bg-[#1a2b49] text-white rounded-lg font-bold hover:bg-blue-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400">{isSubmitting ? 'Đang kích hoạt...' : 'Kích hoạt hệ thống →'}</button></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function SmokeDashboard({ initialState }: { initialState: SmokeState }) {
  const [state, setState] = useState<SmokeState>(initialState)
  const { now, hour } = useAppTime()
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [totalMsElapsed, setTotalMsElapsed] = useState(0)
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [sosTimeLeft, setSosTimeLeft] = useState(300)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetInput, setResetInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInit = async (data: { cigarettesPerDay: number; yearsSmoked: number; startDate: string }) => {
    const res = await initSmokeSessionWithSurvey(data); 
    if (res?.error) alert(res.error);
    else if (res?.data) setState(res.data);
  }

  useEffect(() => {
    if (!state?.start_time) return
    const startTime = new Date(state.start_time).getTime()
    const diff = now.getTime() - startTime
    setTotalMsElapsed(diff)
    const absDiff = Math.abs(diff)
    setTimeElapsed({ days: Math.floor(absDiff / 86400000), hours: Math.floor((absDiff / 3600000) % 24), minutes: Math.floor((absDiff / 60000) % 60), seconds: Math.floor((absDiff / 1000) % 60) })
  }, [state?.start_time, now])

  useEffect(() => {
    if (!isSOSActive) return
    if (sosTimeLeft === 0) { 
      setIsSOSActive(false); 
      incrementCravingDefeated().then(res => {
        if (res?.error) alert(res.error);
        else if (res?.data) setState(res.data);
      }); 
      return 
    }
    const t = setTimeout(() => setSosTimeLeft((p) => p - 1), 1000); return () => clearTimeout(t)
  }, [isSOSActive, sosTimeLeft])

  const handleCheckIn = async () => { 
    const res = await dailyCheckIn(); 
    if (res?.error) alert(res.error);
    else if (res?.data) setState(res.data);
  }
  
  const handleReset = async () => { 
    if (resetInput !== 'TÔI CHẤP NHẬN BẮT ĐẦU LẠI') return; 
    setIsSubmitting(true); 
    const res = await resetSmokeSession(resetInput); 
    if (res?.error) {
      alert(res.error);
    } else if (res?.data) { 
      setState(res.data); 
      setIsResetModalOpen(false); 
      setResetInput(''); 
      setIsSOSActive(false);
    }
    setIsSubmitting(false);
  }

  const isFutureStart = totalMsElapsed < 0
  const daysElapsed = isFutureStart ? 0 : totalMsElapsed / 86400000
  const isExtinctionBurst = daysElapsed >= 10 && daysElapsed < 14
  const isCheckInAvailable = (() => {
    const gmt7Hour = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (7 * 60 * 60 * 1000)).getHours()
    return gmt7Hour >= 19
  })()

  const hasCheckedInToday = (() => {
    if (!state?.last_check_in_at) return false
    const last = new Date(state.last_check_in_at)
    return last.getDate() === now.getDate() && last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear()
  })()

  if (!state) return <InitiationRitual onComplete={handleInit} />

  if (isFutureStart) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center space-y-8">
        <div className="w-20 h-20 bg-blue-50 text-[#1a2b49] rounded-full flex items-center justify-center mx-auto"><Calendar className="w-10 h-10" /></div>
        <div className="space-y-2"><h2 className="font-lora text-3xl font-bold text-[#1a2b49]">Chuẩn bị tâm thế</h2><p className="text-gray-500 max-w-sm mx-auto">Lộ trình của bạn sẽ chính thức kích hoạt sau:</p></div>
        <div className="font-mono text-5xl font-bold text-[#1a2b49] tabular-nums">{timeElapsed.days}d {timeElapsed.hours}h {timeElapsed.minutes}m {timeElapsed.seconds}s</div>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl max-w-md mx-auto text-sm text-blue-800 leading-relaxed italic">"Hãy tận hưởng sự tự do cuối cùng và chuẩn bị tinh thần cho cuộc chiến."</div>
        <button onClick={() => setIsResetModalOpen(true)} className="text-xs text-gray-400 hover:text-gray-600 underline">Thay đổi thiết lập</button>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-left shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-lora">Đặt lại thiết lập</h3>
              <div className="mb-6"><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gõ: <span className="text-[#1a2b49]">TÔI CHẤP NHẬN BẮT ĐẦU LẠI</span></label><input type="text" value={resetInput} onChange={(e)=>setResetInput(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" placeholder="TÔI CHẤP NHẬN BẮT ĐẦU LẠI" /></div>
              <div className="flex gap-3"><button onClick={()=>{setIsResetModalOpen(false);setResetInput('')}} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Hủy</button><button onClick={handleReset} disabled={resetInput!=='TÔI CHẤP NHẬN BẮT ĐẦU LẠI'||isSubmitting} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Reset</button></div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold bg-blue-100 text-[#1a2b49] px-2 py-0.5 rounded-full uppercase tracking-tighter">Protocol Phase 4.0</span>
        <span className="text-[10px] text-gray-400 font-mono">ID: {state.user_id?.slice(0,8)}</span>
      </div>
      {!hasCheckedInToday && (
        <div className={`border rounded-xl p-5 flex items-center justify-between gap-4 transition-all ${isCheckInAvailable ? 'bg-[#1a2b49] border-blue-900' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex gap-4 items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCheckInAvailable ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-400'}`}><Clock className="w-5 h-5" /></div>
            <div>
              <p className={`font-bold text-sm ${isCheckInAvailable ? 'text-white' : 'text-gray-600'}`}>Kỷ luật cuối ngày</p>
              <p className={`text-xs mt-1 ${isCheckInAvailable ? 'text-blue-200' : 'text-gray-400'}`}>{isCheckInAvailable ? 'Thời gian xác nhận chiến thắng đã mở.' : 'Cổng xác nhận sẽ mở vào lúc 19:00. Hãy quay lại sau.'}</p>
            </div>
          </div>
          {isCheckInAvailable && <button onClick={handleCheckIn} className="shrink-0 px-6 py-2.5 bg-white text-[#1a2b49] rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg">Xác nhận ✓</button>}
        </div>
      )}
      {hasCheckedInToday && <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /><p className="text-green-800 text-sm font-medium">Chiến thắng ngày hôm nay đã được ghi nhận. Hẹn gặp lại bạn vào 19:00 ngày mai.</p></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center">
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Thời gian sống sót</div>
          <div className="font-mono text-4xl md:text-5xl font-bold text-[#1a2b49] tracking-tight tabular-nums flex gap-1 items-end">{[{v:timeElapsed.days,l:'Ngày'},{v:timeElapsed.hours,l:'Giờ'},{v:timeElapsed.minutes,l:'Phút'},{v:timeElapsed.seconds,l:'Giây'}].map((o,i)=>(<div key={o.l} className="flex items-end gap-1">{i>0&&<span className="text-gray-200 mb-5">:</span>}<div className="flex flex-col items-center gap-1"><span>{o.v.toString().padStart(2,'0')}</span><span className="text-[10px] font-sans text-gray-400 font-normal uppercase tracking-widest">{o.l}</span></div></div>))}</div>
        </div>
        <div className="bg-[#1a2b49] border border-blue-900 rounded-xl p-8 shadow-sm flex flex-col items-center text-white"><div className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-5 flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Cơn thèm đã thắng</div><div className="font-mono text-7xl font-bold text-white mb-2">{state.cravings_defeated}</div></div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2"><Brain className="w-3.5 h-3.5" /> Lộ trình 21 ngày</div>
        <div className="overflow-x-auto pb-4"><div className="relative min-w-[500px]"><div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 z-0" /><div className="absolute top-5 left-5 h-0.5 bg-[#1a2b49] z-0 transition-all duration-1000" style={{width:`calc(${Math.min(100,(daysElapsed/21)*100)}% - 0px)`}} /><div className="relative z-10 flex justify-between">{MILESTONES.map((m)=>{const r=daysElapsed>=m.day;return(<div key={m.day} className="flex flex-col items-center gap-2 w-16"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all duration-500 ${r?'bg-[#1a2b49] text-white border-[#1a2b49]':'bg-white text-gray-300 border-gray-200'}`}>{m.day}</div><div className={`text-[10px] font-bold text-center leading-tight ${r?'text-[#1a2b49]':'text-gray-300'}`}>{m.label}</div></div>)})}</div></div></div>
        {MILESTONES.filter(m=>daysElapsed>=m.day).slice(-1).map(m=>(<div key={m.day} className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg"><p className="text-xs text-blue-800 font-bold mb-1">✓ Đã đạt: {m.title}</p><p className="text-[11px] text-blue-700 leading-relaxed">{m.description}</p></div>))}
      </div>
      <button onClick={()=>{setIsSOSActive(true);setSosTimeLeft(300)}} className="w-full py-5 border-2 border-[#1a2b49] bg-white hover:bg-[#1a2b49] text-[#1a2b49] hover:text-white rounded-xl font-bold text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3"><AlertCircle className="w-5 h-5" /><span>SOS — Cơn thèm tấn công</span></button>
      <div className="text-center pt-2"><button onClick={() => setIsResetModalOpen(true)} className="text-xs text-gray-400 hover:text-gray-600 underline">Khai báo vấp ngã</button></div>
      {isSOSActive && (
        <div className="fixed inset-0 z-50 bg-[#08111f] text-white flex flex-col items-center justify-center p-6 text-center">
          <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-8">Chế độ phòng thủ</p>
          <div className="font-mono text-8xl font-bold tabular-nums text-white mb-10">{Math.floor(sosTimeLeft/60)}:{(sosTimeLeft%60).toString().padStart(2,'0')}</div>
          <p className="text-lg text-gray-300 font-lora max-w-lg mb-16 italic">"Xung thần kinh giả mạo đang tấn công. Hãy đứng vững."</p>
          <button onClick={()=>setIsResetModalOpen(true)} className="text-xs text-gray-600 underline">Tôi đã lỡ hút</button>
        </div>
      )}
    </div>
  )
}
