'use client'

import { useState, useEffect } from 'react'
import { initSmokeSessionWithSurvey, incrementCravingDefeated, resetSmokeSession, dailyCheckIn } from '@/app/(frontend)/smoke/actions'
import { Shield, Brain, Activity, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

type SmokeState = {
  user_id?: string
  start_time: string
  cravings_defeated: number
  cigarettes_per_day?: number
  years_smoked?: number
  last_check_in_at?: string | null
} | null

// ─── ALL MILESTONES (Day 1,2,3 + weekly) ────────────────────────────────────
const MILESTONES = [
  {
    day: 1,
    label: 'Ngày 1',
    title: 'Bước chân đầu tiên',
    description: 'Nồng độ CO trong máu trở về mức bình thường. Phổi bắt đầu quá trình thanh lọc đầu tiên.',
  },
  {
    day: 2,
    label: 'Ngày 2',
    title: 'Đối mặt sự bứt rứt',
    description: 'Nicotine rời khỏi cơ thể hoàn toàn. Vị giác bắt đầu nhạy bén hơn. Đây là lúc ý chí thực sự làm việc.',
  },
  {
    day: 3,
    label: 'Ngày 3',
    title: 'Giải phóng thể chất',
    description: 'Thanh lọc vật lý hoàn tất. Bạn đã vượt qua rào cản lớn nhất của cơ thể.',
  },
  {
    day: 7,
    label: 'Ngày 7',
    title: 'Các giác quan tỉnh thức',
    description: 'Vị giác và khứu giác đang phục hồi rõ rệt. Nhịp tim ổn định, lưu lượng máu được cải thiện.',
  },
  {
    day: 14,
    label: 'Ngày 14',
    title: 'Vượt qua Extinction Burst',
    description: 'Đỉnh điểm của sự bứt rứt tâm lý đã qua. Não bộ đang học lại cách tự sản sinh Dopamine.',
  },
  {
    day: 21,
    label: 'Ngày 21',
    title: 'Tái thiết lập thần kinh',
    description: 'Đường mòn thần kinh cũ đã suy yếu đáng kể. Bạn đã xây dựng được một thói quen mới.',
  },
]

// ─── INITIATION RITUAL ───────────────────────────────────────────────────────
function InitiationRitual({ onComplete }: { onComplete: (d: { cigarettesPerDay: number; yearsSmoked: number }) => Promise<void> }) {
  const [step, setStep] = useState(1)
  const [cigarettes, setCigarettes] = useState('')
  const [years, setYears] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const COMMIT_PHRASE = 'TÔI ĐÃ SẴN SÀNG ĐỐI MẶT'
  const canProceed = cigarettes !== '' && years !== '' && parseInt(cigarettes) > 0 && parseInt(years) > 0

  const handleSubmit = async () => {
    if (confirmText !== COMMIT_PHRASE) return
    setIsSubmitting(true)
    await onComplete({ cigarettesPerDay: parseInt(cigarettes), yearsSmoked: parseInt(years) })
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest transition-colors ${step === s ? 'bg-[#1a2b49] text-white' : step > s ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-300'}`}>
            Bước {s}
          </div>
        ))}
      </div>
      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-lora text-2xl font-bold text-[#1a2b49] mb-2">Đánh giá mức độ lệ thuộc</h2>
              <p className="text-gray-500 text-sm">Hai con số này giúp hệ thống hiệu chỉnh lộ trình phù hợp với bạn, không phải cho đại đa số.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bạn đã hút thuốc được bao nhiêu năm?</label>
                <input type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} placeholder="VD: 5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg text-[#1a2b49] focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" />
                <p className="text-xs text-gray-400 mt-1">Để đánh giá mức độ bám rễ của thói quen trong não bộ.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trung bình bạn hút bao nhiêu điếu mỗi ngày?</label>
                <input type="number" min="1" value={cigarettes} onChange={(e) => setCigarettes(e.target.value)} placeholder="VD: 10"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg text-[#1a2b49] focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" />
                <p className="text-xs text-gray-400 mt-1">Để ước tính cường độ của các cơn thèm khát sắp tới.</p>
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!canProceed}
              className="w-full py-4 bg-[#1a2b49] text-white rounded-lg font-bold tracking-wide hover:bg-blue-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400">
              Tiếp tục →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-lora text-2xl font-bold text-[#1a2b49] mb-2">Lộ trình 21 ngày phía trước</h2>
              <p className="text-gray-500 text-sm">Chỉ 21 ngày. Dưới đây là những gì sẽ xảy ra với não bộ và cơ thể bạn.</p>
            </div>
            <div className="space-y-3">
              {MILESTONES.map((m) => (
                <div key={m.day} className="flex gap-4 items-start">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-mono font-bold text-[#1a2b49] text-sm">{m.day}</div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{m.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{m.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">← Quay lại</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#1a2b49] text-white rounded-lg font-bold hover:bg-blue-900 transition-colors">Tôi hiểu rồi →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-lora text-2xl font-bold text-[#1a2b49] mb-2">Cam kết kỷ luật</h2>
              <p className="text-gray-500 text-sm">
                Bạn đã hút <span className="font-mono font-bold text-[#1a2b49]">{cigarettes} điếu/ngày</span> trong <span className="font-mono font-bold text-[#1a2b49]">{years} năm</span>. 21 ngày tiếp theo sẽ không dễ dàng. Nếu bạn thực sự sẵn sàng, hãy gõ câu cam kết bên dưới.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Gõ chính xác: <span className="text-[#1a2b49]">{COMMIT_PHRASE}</span>
              </label>
              <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={COMMIT_PHRASE}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-[#1a2b49] focus:outline-none focus:ring-2 focus:ring-[#1a2b49]" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">← Quay lại</button>
              <button onClick={handleSubmit} disabled={confirmText !== COMMIT_PHRASE || isSubmitting}
                className="flex-1 py-3 bg-[#1a2b49] text-white rounded-lg font-bold hover:bg-blue-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400">
                {isSubmitting ? 'Đang khởi động...' : 'Kích hoạt hệ thống →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function SmokeDashboard({ initialState }: { initialState: SmokeState }) {
  const [state, setState] = useState<SmokeState>(initialState)
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [totalMsElapsed, setTotalMsElapsed] = useState(0)
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [sosTimeLeft, setSosTimeLeft] = useState(300)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetInput, setResetInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInit = async (data: { cigarettesPerDay: number; yearsSmoked: number }) => {
    const res = await initSmokeSessionWithSurvey(data)
    if (res.data) setState(res.data)
  }

  // Live clock
  useEffect(() => {
    if (!state?.start_time) return
    const interval = setInterval(() => {
      const diff = Date.now() - new Date(state.start_time).getTime()
      setTotalMsElapsed(diff)
      setTimeElapsed({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state?.start_time])

  // SOS countdown
  useEffect(() => {
    if (!isSOSActive) return
    if (sosTimeLeft === 0) { handleSOSSuccess(); return }
    const t = setTimeout(() => setSosTimeLeft((p) => p - 1), 1000)
    return () => clearTimeout(t)
  }, [isSOSActive, sosTimeLeft])

  const handleSOSSuccess = async () => {
    setIsSOSActive(false)
    const res = await incrementCravingDefeated()
    if (res.data) setState(res.data)
  }

  const handleCheckIn = async () => {
    const res = await dailyCheckIn()
    if (res.data) setState(res.data)
  }

  const handleReset = async () => {
    if (resetInput !== 'TÔI CHẤP NHẬN BẮT ĐẦU LẠI') return
    setIsSubmitting(true)
    const res = await resetSmokeSession(resetInput)
    if (res.data) { setState(res.data); setIsResetModalOpen(false); setResetInput(''); setIsSOSActive(false) }
    setIsSubmitting(false)
  }

  const daysElapsed = totalMsElapsed / 86400000
  const isExtinctionBurst = daysElapsed >= 10 && daysElapsed < 14

  // Check-in logic: has user checked in today?
  const hasCheckedInToday = (() => {
    if (!state?.last_check_in_at) return false
    const last = new Date(state.last_check_in_at)
    const now = new Date()
    return last.getDate() === now.getDate() && last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear()
  })()

  if (!state) return <InitiationRitual onComplete={handleInit} />

  return (
    <div className="space-y-6">
      {/* Extinction Burst Alert */}
      {isExtinctionBurst && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex gap-4 items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm">Cảnh báo: Bùng phát dập tắt (Extinction Burst)</p>
            <p className="text-red-700 text-xs mt-1 leading-relaxed">Trong 72 giờ tới, não bộ của bạn sẽ kích hoạt những cơn thèm mạnh nhất để đòi lại Nicotine trước khi buông bỏ hoàn toàn. Bạn đã được báo trước. Hãy đứng vững.</p>
          </div>
        </div>
      )}

      {/* Daily Check-in Card */}
      {!hasCheckedInToday && (
        <div className="bg-[#1a2b49] border border-blue-900 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-sm">Kỷ luật ngày hôm nay</p>
            <p className="text-blue-200 text-xs mt-1">Xác nhận rằng bạn vẫn chưa chạm vào điếu thuốc nào trong ngày hôm nay.</p>
          </div>
          <button onClick={handleCheckIn}
            className="shrink-0 px-5 py-2.5 bg-white text-[#1a2b49] rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
            Xác nhận ✓
          </button>
        </div>
      )}

      {hasCheckedInToday && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">Kỷ luật hôm nay đã được ghi nhận. Hẹn gặp lại bạn vào ngày mai.</p>
        </div>
      )}

      {/* Row 1: Clock + Cravings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center">
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Thời gian sống sót
          </div>
          <div className="font-mono text-4xl md:text-5xl font-bold text-[#1a2b49] tracking-tight tabular-nums flex gap-2 items-end">
            {[
              { val: timeElapsed.days, label: 'Ngày' },
              { val: timeElapsed.hours, label: 'Giờ' },
              { val: timeElapsed.minutes, label: 'Phút' },
              { val: timeElapsed.seconds, label: 'Giây' },
            ].map(({ val, label }, i) => (
              <div key={label} className="flex items-end gap-2">
                {i > 0 && <span className="text-gray-200 mb-5">:</span>}
                <div className="flex flex-col items-center gap-1">
                  <span>{val.toString().padStart(2, '0')}</span>
                  <span className="text-xs font-sans text-gray-400 font-normal uppercase tracking-widest">{label}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-5 text-center max-w-xs leading-relaxed">
            Đây là khoản đầu tư không thể hoàn trả. Mỗi giây trôi qua là một chiến thắng nhỏ tích lũy lại.
          </p>
        </div>

        <div className="bg-[#1a2b49] border border-blue-900 rounded-xl p-8 shadow-sm flex flex-col items-center text-white">
          <div className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-5 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Cơn thèm đã đánh bại
          </div>
          <div className="font-mono text-7xl font-bold text-white mb-2">{state.cravings_defeated}</div>
          <p className="text-xs text-blue-200 mt-4 text-center max-w-xs leading-relaxed">
            Chỉ số này không tự tăng. Khi cơn thèm ập đến, nhấn nút SOS và đứng vững qua 5 phút. Mỗi lần bạn thắng, con số này tăng thêm 1.
          </p>
        </div>
      </div>

      {/* Timeline 21 ngày với 6 mốc */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" /> Lộ trình 21 ngày
        </div>
        <div className="overflow-x-auto">
          <div className="relative min-w-[520px]">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 z-0" />
            <div className="absolute top-5 left-5 h-0.5 bg-[#1a2b49] z-0 transition-all duration-1000"
              style={{ width: `calc(${Math.min(100, (daysElapsed / 21) * 100)}% - 0px)` }} />
            <div className="relative z-10 flex justify-between">
              {MILESTONES.map((m) => {
                const reached = daysElapsed >= m.day
                return (
                  <div key={m.day} className="flex flex-col items-center gap-2 w-16">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all duration-500 ${reached ? 'bg-[#1a2b49] text-white border-[#1a2b49]' : 'bg-white text-gray-300 border-gray-200'}`}>
                      {m.day}
                    </div>
                    <div className={`text-xs font-bold text-center transition-colors ${reached ? 'text-[#1a2b49]' : 'text-gray-300'}`}>{m.label}</div>
                    <div className={`text-xs text-center leading-snug transition-colors ${reached ? 'text-gray-500' : 'text-gray-200'}`}>{m.title}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* Latest milestone unlocked */}
        {MILESTONES.filter(m => daysElapsed >= m.day).slice(-1).map(m => (
          <div key={m.day} className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-800 font-bold mb-1">✓ Đã đạt: {m.title}</p>
            <p className="text-xs text-blue-700 leading-relaxed">{m.description}</p>
          </div>
        ))}
      </div>

      {/* SOS Button */}
      <div className="pt-2">
        <button onClick={() => { setIsSOSActive(true); setSosTimeLeft(300) }}
          className="w-full py-5 border-2 border-[#1a2b49] bg-white hover:bg-[#1a2b49] text-[#1a2b49] hover:text-white rounded-xl font-bold text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>SOS — Cơn thèm đang tấn công</span>
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">Chỉ nhấn khi cơn thèm ập đến và bạn cảm thấy sắp mất kiểm soát.</p>
      </div>

      <div className="text-center pt-2">
        <button onClick={() => setIsResetModalOpen(true)} className="text-xs text-gray-400 hover:text-gray-600 underline decoration-gray-300 transition-colors">
          Tôi đã lỡ hút — Khai báo vấp ngã
        </button>
      </div>

      {/* SOS Overlay */}
      {isSOSActive && (
        <div className="fixed inset-0 z-50 bg-[#08111f] text-white flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-8">Chế độ phòng thủ đang hoạt động</p>
          <div className="font-mono text-8xl font-bold tabular-nums text-white mb-10">
            {Math.floor(sosTimeLeft / 60)}:{(sosTimeLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-xl text-gray-300 font-lora leading-relaxed max-w-lg mb-16">
            "Xung thần kinh giả mạo đang tấn công. Não bộ của bạn đang gào thét đòi Nicotine. Đừng nhượng bộ. Nó sẽ suy yếu sau 5 phút nữa. Hãy đứng vững."
          </p>
          <button onClick={() => setIsResetModalOpen(true)} className="text-xs text-gray-600 hover:text-gray-400 underline transition-colors">
            Tôi đã lỡ hút
          </button>
        </div>
      )}

      {/* Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-lora">Khai báo vấp ngã</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Bạn đã để bản năng chiến thắng. Lượng Nicotine vừa nạp vào đã đánh thức lại các thụ thể đang ngủ đông. Toàn bộ quá trình thanh lọc của <span className="font-bold text-red-600">{timeElapsed.days} ngày {timeElapsed.hours} giờ</span> vừa qua đã bị phá vỡ. Hãy chấp nhận thực tế và bắt đầu lại từ vạch xuất phát.
            </p>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Gõ: <span className="text-[#1a2b49]">TÔI CHẤP NHẬN BẮT ĐẦU LẠI</span>
              </label>
              <input type="text" value={resetInput} onChange={(e) => setResetInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a2b49]"
                placeholder="TÔI CHẤP NHẬN BẮT ĐẦU LẠI" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setIsResetModalOpen(false); setResetInput('') }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Hủy bỏ</button>
              <button onClick={handleReset} disabled={resetInput !== 'TÔI CHẤP NHẬN BẮT ĐẦU LẠI' || isSubmitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors">
                {isSubmitting ? 'Đang reset...' : 'Bắt đầu lại'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
