import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/sanity/client'
import { mockPosts } from '@/lib/mockPosts'

export const revalidate = 60

export default async function Home() {
  // Fetch real posts from Sanity
  const sanityPosts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    "category": categories[0]->title,
    "imageUrl": mainImage.asset->url
  }`)

  // Combine with mock posts
  const allPosts = [...sanityPosts, ...mockPosts]

  // Group posts by category
  const categories = ["Yoga", "Gut Health", "Meditation", "Sleep", "Productivity"]
  
  // Extract latest 4 posts overall
  const latestPosts = allPosts.slice(0, 4)

  const getPostsByCategory = (catName: string) => {
    return allPosts.filter(post => post.category === catName).slice(0, 3)
  }

  // Component for rendering a Post Card
  const PostCard = ({ post }: { post: any }) => {
    return (
      <Link href={post.slug?.current ? `/blog/${post.slug.current}` : '#'} className="group block cursor-pointer">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
            {post.imageUrl || post.image ? (
              <img 
                src={post.imageUrl || post.image} 
                alt={post.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight mb-2 line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center text-xs font-medium text-gray-500 gap-2">
              <span>{post.readTime || '5 Min read'}</span>
              <span>•</span>
              <span>
                {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      {/* Header Welcome */}
      <section className="pt-16 pb-12 text-center container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a2b49] mb-4">
          Welcome to your Health Habitat!
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Explore a healthier lifestyle with our blog, covering diet, sleep, and more. Let us be your wellness guide!
        </p>
      </section>

      {/* Explore Popular Topics (Pill Buttons) */}
      <section className="py-8 container mx-auto px-4 text-center">
        <h2 className="text-sm font-bold tracking-widest text-[#1a2b49] uppercase mb-4">Explore</h2>
        <h3 className="text-3xl font-bold text-[#1a2b49] mb-8">Popular Topics</h3>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              href={`/blog?category=${cat.toLowerCase().replace(' ', '-')}`}
              className="px-6 py-2 rounded-full border border-gray-800 bg-white text-gray-800 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-12 container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-bold text-[#1a2b49]">Latest Articles</h2>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestPosts.map((post: any, idx: number) => (
            <PostCard key={idx} post={post} />
          ))}
        </div>
      </section>

      {/* Dynamic Category Sections */}
      {categories.map((category) => {
        const catPosts = getPostsByCategory(category)
        if (catPosts.length === 0) return null

        return (
          <section key={category} className="py-12 container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
              <h2 className="text-3xl font-bold text-[#1a2b49]">{category}</h2>
              <Link href={`/blog?category=${category.toLowerCase().replace(' ', '-')}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                View All {category} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {catPosts.map((post: any, idx: number) => (
                <PostCard key={idx} post={post} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
