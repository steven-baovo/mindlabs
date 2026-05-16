import Link from 'next/link'
import { client } from '@/sanity/client'
import { mockPosts } from '@/lib/mockPosts'

export const revalidate = 60; // revalidate every minute

export default async function BlogHub() {
  const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    "category": categories[0]->title
  }`);

  const allPosts = [...posts, ...mockPosts];

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 min-h-screen">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-4">Thư viện Nghiên cứu</h1>
        <p className="text-secondary font-medium opacity-80 text-lg">
          Khám phá những góc nhìn mới nhất về hiệu suất con người và lối sống có hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {allPosts.length > 0 ? (
          allPosts.map((post: any) => (
            <Link key={post._id} href={`/blog/${post.slug.current}`} className="group block h-full">
              <div className="bg-white rounded-main border border-border-main hover:border-primary/40 hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                <div className="p-8 flex-1 flex flex-col">
                  {post.category && (
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary mb-3 block">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-4 line-clamp-2 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-secondary font-medium text-sm leading-relaxed line-clamp-3 mb-6 flex-1 opacity-70">
                    {post.excerpt}
                  </p>
                  <div className="pt-4 border-t border-border-main flex items-center justify-between">
                    <span className="text-[11px] font-bold text-secondary/50 uppercase tracking-wider">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Đang cập nhật'}
                    </span>
                    <span className="text-[11px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                      Đọc tiếp
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-hover-bg rounded-main border border-dashed border-border-main">
            <p className="text-secondary font-medium">Chưa có bài viết nào trong kho dữ liệu.</p>
          </div>
        )}
      </div>
    </div>
  )
}
