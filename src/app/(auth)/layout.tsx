import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-900">
          MINDLABS
        </Link>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 sm:rounded-2xl sm:px-10 border border-[#e5e5e5]">
          {children}
        </div>
      </div>
    </div>
  )
}
