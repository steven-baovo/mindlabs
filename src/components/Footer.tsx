import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-900">
              MINDLABS
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-sm">
              Khám phá các nội dung giá trị được thiết kế để nâng cao sức khỏe tinh thần và thể chất của bạn. Trở thành phiên bản tốt hơn mỗi ngày.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Chuyên Mục</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/blog?category=fitness" className="text-sm text-gray-500 hover:text-blue-600">Thể chất</Link></li>
              <li><Link href="/blog?category=mental-health" className="text-sm text-gray-500 hover:text-blue-600">Sức khỏe tinh thần</Link></li>
              <li><Link href="/blog?category=lifestyle" className="text-sm text-gray-500 hover:text-blue-600">Phong cách sống</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Liên Kết</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/studio" className="text-sm text-gray-500 hover:text-blue-600">Góc Tác Giả (CMS)</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600">Chính sách bảo mật</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Mindlabs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
