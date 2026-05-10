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
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Phát Triển Bản Thân</h1>
        <p className="text-gray-600">Những bài viết mới nhất về sức khỏe, tâm lý và thói quen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPosts.length > 0 ? (
          allPosts.map((post: any) => (
            <Link key={post._id} href={`/blog/${post.slug.current}`} className="group block">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e5e5e5] hover:shadow-lg transition-all h-full flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  {post.category && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(post.publishedAt || Date.now()).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">Chưa có bài viết nào. Hãy vào Góc Tác Giả (CMS) để viết bài đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  )
}
