'use client'

import { useState, useEffect } from 'react'
import { useAppTime } from '@/hooks/useAppTime'
import { adminSetProgressDays, adminResetCheckIn, adminForceStartInFuture, adminHardReset } from '@/app/(frontend)/smoke/admin-actions'
import { Terminal, Clock, Zap, RotateCcw, ChevronRight, X } from 'lucide-react'

export default function DevPanel({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const { hour, setAppHour, isMocked } = useAppTime()
  const [activeTab, setActiveTab] = useState<'smoke' | 'system'>('smoke')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Support Alt+D, Cmd+Alt+D, or Backtick (`)
      if ((e.altKey && e.key === 'd') || e.key === '`') {
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Mini Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-2 rounded-full shadow-lg hover:bg-black transition-all group"
          title="Open Dev Panel (Alt+D or `)"
        >
          <Terminal className="w-5 h-5" />
        </button>
      )}

      {/* Main Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans">
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Mindlabs Dev Console</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('smoke')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'smoke' ? 'text-[#1a2b49] border-b-2 border-[#1a2b49]' : 'text-gray-400'}`}
            >
              Smoke Module
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'system' ? 'text-[#1a2b49] border-b-2 border-[#1a2b49]' : 'text-gray-400'}`}
            >
              System
            </button>
          </div>

          <div className="p-4 space-y-6 max-h-[400px] overflow-y-auto">
            {!isAdmin ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-900">Quyền truy cập bị từ chối</p>
                <p className="text-[10px] text-gray-500 leading-relaxed px-4">
                  Bạn cần đăng nhập bằng tài khoản Quản trị viên để sử dụng các công cụ này.
                </p>
              </div>
            ) : (
              <>
                {/* VIRTUAL TIME SECTION (GLOBAL) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Virtual Time
                    </span>
                    {isMocked && (
                      <button onClick={() => setAppHour(null)} className="text-[10px] text-red-500 hover:underline">Reset</button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" min="0" max="23" value={hour}
                      onChange={(e) => setAppHour(parseInt(e.target.value))}
                      className="flex-1 accent-[#1a2b49]"
                    />
                    <span className="font-mono text-sm font-bold w-12 text-center bg-gray-100 rounded px-1">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 italic">"Giao diện sẽ coi như hiện tại là {hour}h để test cổng 19:00."</p>
                  <p className="text-[9px] text-blue-500 font-bold uppercase mt-1">
                    Giờ hệ thống (GMT+7): {new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (7 * 60 * 60 * 1000)).getHours()}h
                  </p>
                </div>

                {activeTab === 'smoke' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" /> Fast Forward
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[3, 7, 14, 21].map(d => (
                          <button 
                            key={d}
                            onClick={async () => {
                              const res = await adminSetProgressDays(d);
                              if (res?.error) alert(res.error);
                            }}
                            className="py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded text-[10px] font-medium transition-colors"
                          >
                            Nhảy Day {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-blue-500" /> Reset Actions
                      </span>
                      <button 
                        onClick={async () => {
                          const res = await adminResetCheckIn()
                          if (res?.error) alert(res.error)
                          else window.location.reload()
                        }}
                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded text-[10px] font-medium text-left px-3 flex items-center justify-between group"
                      >
                        <span>Xóa Điểm danh hôm nay</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button 
                        onClick={async () => {
                          if(confirm('Xóa sạch dữ liệu và bắt đầu lại từ đầu?')) {
                            const res = await adminHardReset();
                            if (res?.error) alert(res.error)
                            else window.location.reload();
                          }
                        }}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded text-[10px] font-medium text-left px-3 flex items-center justify-between group"
                      >
                        <span>Reset về Trạng thái Mới (New User)</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400">NODE_ENV: <span className="text-gray-900 font-mono">{process.env.NODE_ENV}</span></p>
                      <p className="text-[10px] text-gray-400">API URL: <span className="text-gray-900 font-mono truncate block">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span></p>
                    </div>
                    <button 
                      onClick={() => { localStorage.clear(); window.location.reload() }}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[10px] font-bold transition-colors"
                    >
                      Xóa sạch LocalStorage & Reload
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-gray-50 p-3 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 text-center">Tổ hợp phím ẩn/hiện: <kbd className="bg-white border border-gray-200 px-1 rounded font-mono">Alt + D</kbd> hoặc <kbd className="bg-white border border-gray-200 px-1 rounded font-mono">`</kbd></p>
          </div>
        </div>
      )}
    </>
  )
}
