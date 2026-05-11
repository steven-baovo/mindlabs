import { loadNotes, createNote } from './actions'
import Link from 'next/link'
import { Plus, Calendar, FileText, Search } from 'lucide-react'

export const metadata = {
  title: 'Mindnote | Ghi chú tối giản',
}

export default async function MindnotePage() {
  const { data: notes, error } = await loadNotes()

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Mindnote</h1>
          <p className="text-gray-500 mt-2 text-lg font-light">Nơi lưu trữ những suy nghĩ thuần túy</p>
        </div>
        
        <form action={createNote}>
          <button 
            type="submit"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-medium"
          >
            <Plus className="w-5 h-5" />
            Ghi chú mới
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Empty State */}
      {notes && notes.length === 0 && !error && (
        <div className="text-center py-24 border-2 border-dashed border-border-medium rounded-3xl bg-gray-50/30">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-6">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có ghi chú nào</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8">
            Bắt đầu hành trình ghi chép của bạn ngay hôm nay để không bỏ lỡ bất kỳ ý tưởng nào.
          </p>
          <form action={createNote}>
            <button 
              type="submit"
              className="text-primary font-medium hover:underline flex items-center gap-2 mx-auto"
            >
              Tạo ghi chú đầu tiên của bạn
            </button>
          </form>
        </div>
      )}

      {/* Notes Grid */}
      {notes && notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note: any) => (
            <Link
              key={note.id}
              href={`/mindnote/${note.id}`}
              className="group relative flex flex-col p-6 bg-white border border-border-medium rounded-2xl hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {note.title || 'Chưa có tiêu đề'}
              </h3>
              
              <p className="text-gray-400 text-sm line-clamp-3 mb-8 font-light flex-1">
                {/* Content preview logic could be added here */}
                {note.content?.content?.[0]?.content?.[0]?.text || 'Không có nội dung bản xem trước...'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <span className="flex items-center gap-1.5 text-xs text-gray-400 font-light">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(note.updated_at).toLocaleDateString('vi-VN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-300 font-bold">
                  Note
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
