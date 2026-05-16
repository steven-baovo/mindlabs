import Link from 'next/link'
import { client } from '@/sanity/client'
import { mockPosts } from '@/lib/mockPosts'
import PostCard from '@/components/blog/PostCard'
import { Mic, Zap, BookOpen, Share2, Play } from 'lucide-react'

export const revalidate = 60

export default async function JournalPage() {
  // Fetch real posts from Sanity (if any)
  let sanityPosts: any[] = []
  try {
    sanityPosts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      "category": categories[0]->title,
      "imageUrl": mainImage.asset->url,
      "type": "article"
    }`)
  } catch (error) {
    console.error("Sanity fetch failed:", error)
  }

  const allPosts = [...sanityPosts, ...mockPosts]
  
  // Categorize
  if (allPosts.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-secondary">Chưa có nội dung nào.</p>
      </div>
    )
  }

  const featuredPost = allPosts[0]
  const recentArticles = allPosts.filter(p => p.type !== 'audio' && p._id !== featuredPost._id).slice(0, 4)
  const podcastPosts = allPosts.filter(p => p.type === 'audio').slice(0, 3)
  
  const categories = ["Tập trung sâu", "Khoa học nhận thức", "Thiết kế hệ thống", "Lối sống", "Quản lý thời gian"]

  return (
    <div className="w-full bg-[#fcfdfe] min-h-screen pb-32">
      {/* Dynamic Hero Bento Section */}
      <section className="pt-10 pb-20 container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
              <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Mindlabs Journal</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Featured Post - Immersion */}
          <div className="lg:col-span-8 relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-transparent rounded-[40px] -z-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <PostCard post={featuredPost as any} featured={true} />
          </div>

          {/* Secondary Posts - Refined Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary/40">Đáng chú ý</h3>
              <div className="w-12 h-[1px] bg-border-main/50" />
            </div>
            
            <div className="flex flex-col gap-8">
              {recentArticles.slice(0, 3).map((post: any) => (
                <Link key={post._id} href={`/blog/${post.slug.current}`} className="group flex gap-5 items-center">
                  <div className="w-24 h-24 shrink-0 rounded-ncmaz-sm overflow-hidden bg-gray-100 group-hover: transition-all duration-500">
                    <img 
                      src={post.image || post.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{post.category}</span>
                    <h4 className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tight">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1 h-1 rounded-full bg-secondary/30" />
                      <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">5 min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Podcast Section - Ncmaz Inspired Dark Mode */}
      <section className="py-24 bg-[#0a0a0a] rounded-[48px] mx-4 lg:mx-8 my-12 overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-8 lg:px-16 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Mindlabs Audio</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
                Nghe & <br/> <span className="text-primary/60">Suy ngẫm</span>
              </h2>
            </div>
            <Link 
              href="/blog?type=audio" 
              className="px-8 py-4 glass text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all rounded-full"
            >
              Xem tất cả Podcast
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {podcastPosts.map((post: any) => (
              <div key={post._id} className="relative group">
                <PostCard post={{...post, featured: false}} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Explore - Minimalist Grid */}
      <section className="py-32 container mx-auto px-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-[2px] bg-primary" />
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Chủ đề phổ biến</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              href={`/blog?category=${cat.toLowerCase().replace(' ', '-')}`}
              className="group relative p-10 rounded-[32px] bg-white border border-border-main/50 hover: hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Zap className="w-6 h-6 text-secondary/40 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary group-hover:text-foreground transition-colors">
                  {cat}
                </span>
                <p className="text-[10px] text-secondary/40 mt-2 font-bold uppercase tracking-widest">12 bài viết</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Feed - Asymmetric Grid */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-20 gap-8">
          <h2 className="text-5xl font-black text-foreground tracking-tighter">Bài viết <span className="text-secondary/20">mới</span></h2>
          <div className="flex glass p-1.5 rounded-full">
             {["Mới nhất", "Phổ biến", "Nghiên cứu"].map((tab, i) => (
               <button 
                key={tab} 
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${i === 0 ? 'bg-primary text-white shadow-lg' : 'text-secondary/50 hover:text-primary'}`}
              >
                 {tab}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {allPosts.slice(4, 10).map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
        
        <div className="mt-24 text-center">
          <button className="group relative px-12 py-5 bg-foreground text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-16 active:scale-95 -primary/20">
            <span className="relative z-10">Xem tất cả bài viết</span>
            <div className="absolute right-0 top-0 h-full w-0 group-hover:w-12 bg-primary transition-all duration-500 flex items-center justify-center">
               <Zap className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}
