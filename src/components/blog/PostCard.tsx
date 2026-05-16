'use client'

import Link from 'next/link'
import { Play, Clock, MessageCircle, Heart, Share2, Eye } from 'lucide-react'

interface PostCardProps {
  post: {
    _id: string
    title: string
    slug: { current: string }
    publishedAt: string
    excerpt: string
    category: string
    imageUrl?: string
    image?: string
    readTime?: string
    type?: 'article' | 'audio'
    audioUrl?: string
    views?: number
    likes?: number
  }
  featured?: boolean
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const isAudio = post.type === 'audio'
  const displayImage = post.imageUrl || post.image

  return (
    <div className={`group relative bg-white transition-all duration-500 hover:shadow-premium rounded-ncmaz p-2 ${featured ? 'flex flex-col lg:flex-row gap-8 p-4 bg-[#fdfdfe]' : 'flex flex-col'}`}>
      {/* Thumbnail Area */}
      <div className={`relative overflow-hidden rounded-[28px] bg-gray-100 ${featured ? 'w-full lg:w-3/5 aspect-video' : 'w-full aspect-[4/3]'}`}>
        <Link href={`/blog/${post.slug.current}`} className="absolute inset-0 z-10" />
        
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={post.title} 
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary/30 font-bold uppercase tracking-widest bg-gradient-to-br from-gray-50 to-gray-100">
            Mindlabs
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-5 left-5 z-20">
          <span className="px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-[0.1em] text-primary">
            {post.category}
          </span>
        </div>

        {/* Audio Play Overlay */}
        {isAudio && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/20 transition-colors z-15">
            <div className="w-16 h-16 glass border-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Play className="w-7 h-7 text-primary fill-primary ml-1" />
            </div>
            {/* Pulsing effect */}
            <div className="absolute w-16 h-16 rounded-full bg-white/20 animate-ping group-hover:animate-none opacity-40" />
          </div>
        )}

        {/* Interaction Bar (Ncmaz Style - Floating on hover) */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
              <Heart className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
          <button className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex flex-col px-4 pb-4 pt-6 ${featured ? 'lg:w-2/5 justify-center lg:px-6' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <span className="text-[12px] font-bold text-secondary tracking-tight">Mindlabs Lab</span>
          <span className="text-secondary/20">•</span>
          <span className="text-[12px] font-medium text-secondary/60">
            {new Date(post.publishedAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <Link href={`/blog/${post.slug.current}`}>
          <h3 className={`${featured ? 'text-3xl lg:text-4xl' : 'text-xl'} font-black text-foreground group-hover:text-primary transition-colors leading-[1.1] mb-4 line-clamp-2 tracking-tight`}>
            {post.title}
          </h3>
        </Link>

        <p className={`text-secondary ${featured ? 'text-lg line-clamp-3 mb-8' : 'text-sm line-clamp-2 mb-6'} font-medium opacity-60 leading-relaxed`}>
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-secondary/60">
              <Clock className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{post.readTime || '5 phút'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary/60">
              <Eye className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{post.views || '1.2k'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-primary/40 group-hover:text-primary transition-colors">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span className="text-[11px] font-black uppercase tracking-widest">{post.likes || '48'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
