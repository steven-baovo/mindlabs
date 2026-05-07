'use client'

import { useState } from 'react'
import { updateProfile, updatePassword, uploadAvatar } from './actions'
import { User } from '@supabase/supabase-js'

export default function AccountForm({ user, profile }: { user: User, profile: any }) {
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    setAvatarUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await uploadAvatar(formData)
      if (res.error) showMessage('error', res.error)
      else showMessage('success', res.success || 'Avatar uploaded')
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileSaving(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updateProfile(formData)
      if (res.error) showMessage('error', res.error)
      else showMessage('success', res.success || 'Profile updated')
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordSaving(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updatePassword(formData)
      if (res.error) showMessage('error', res.error)
      else {
        showMessage('success', res.success || 'Password updated')
        e.currentTarget.reset()
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="space-y-12">
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <section>
        <h2 className="text-xl font-bold text-[#1a2b49] mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-400 uppercase">{user.email?.[0]}</span>
            )}
          </div>
          <div>
            <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors inline-block">
              {avatarUploading ? 'Uploading...' : 'Change Avatar'}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 5MB max.</p>
          </div>
        </div>
      </section>

      <hr className="border-[#f2f2f2]" />

      {/* Profile Details */}
      <section>
        <h2 className="text-xl font-bold text-[#1a2b49] mb-4">Personal Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={user.email} 
              disabled 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Your email address cannot be changed here.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input 
              type="text" 
              name="displayName"
              defaultValue={profile?.display_name || ''} 
              placeholder="How should we call you?"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={profileSaving}
            className="bg-[#242424] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-black transition-all disabled:opacity-50"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      <hr className="border-[#f2f2f2]" />

      {/* Security */}
      <section>
        <h2 className="text-xl font-bold text-[#1a2b49] mb-4">Security</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              name="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              required
              minLength={6}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={passwordSaving}
            className="bg-white text-[#242424] border border-[#242424] px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  )
}
