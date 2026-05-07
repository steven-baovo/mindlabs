'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/app/auth/actions'
import { ArrowRight, Mail, Lock, Loader2, Eye, EyeOff, Info } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await login(formData, redirectTo)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Chào mừng trở lại
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Đăng nhập để tiếp tục hành trình phát triển bản thân
        </p>
      </div>
      
      {searchParams.get('signup') === 'success' && (
        <div className="mb-6 bg-blue-50/80 border border-blue-100 rounded-lg p-3 flex items-start text-sm text-blue-800">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-2 shrink-0" />
          <p>Lưu ý: Nếu bạn vừa đăng ký tài khoản mới, vui lòng kiểm tra <strong>hộp thư đến</strong> và <strong>hộp thư rác (spam)</strong> để xác thực tài khoản trước khi đăng nhập nhé!</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Địa chỉ Email
          </label>
          <div className="mt-1 relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </a>
            </div>
          </div>
          <div className="mt-1 relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 backdrop-blur-sm transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Tạo tài khoản mới
          </Link>
        </p>
      </div>
    </>
  )
}
