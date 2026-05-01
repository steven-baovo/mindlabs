import { client } from '@/sanity/client'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { mockPosts } from '@/lib/mockPosts'

export const revalidate = 60;

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    body,
    "category": categories[0]->title
  }`, { slug });

  if (!post) {
    const mockPost = mockPosts.find(p => p.slug.current === slug);
    if (mockPost) {
      post = {
        title: mockPost.title,
        publishedAt: mockPost.publishedAt,
        category: mockPost.category,
        body: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', marks: [], text: mockPost.excerpt }]
          },
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', marks: [], text: 'Đây là dữ liệu mẫu. Bạn có thể thay thế bằng nội dung thực trong Sanity Studio.' }]
          }
        ]
      }
    }
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy bài viết</h1>
        <Link href="/blog" className="text-blue-600 mt-4 inline-block">Quay lại Blog</Link>
      </div>
    )
  }

  return (
    <article className="container mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        {post.category && (
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 block">
            {post.category}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight font-sans">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>{new Date(post.publishedAt || Date.now()).toLocaleDateString('vi-VN')}</span>
          <span>•</span>
          <span>Đọc mất 5 phút</span>
        </div>
      </div>

      <div className="prose prose-slate prose-lg max-w-none font-serif text-gray-800 leading-relaxed mx-auto">
        {post.body ? (
          <PortableText value={post.body} />
        ) : (
          <p>Nội dung đang được cập nhật...</p>
        )}
      </div>
      
      <div className="mt-16 pt-8 border-t border-gray-100 flex justify-center">
        <Link href="/blog" className="text-gray-500 text-sm font-medium hover:text-gray-900 transition-colors">
          &larr; Quay lại danh sách bài viết
        </Link>
      </div>
    </article>
  )
}
