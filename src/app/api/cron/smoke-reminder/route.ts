import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

// Service role client to bypass RLS for cron job
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  // Protect against unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all active smoke sessions
  const { data: sessions, error } = await supabase
    .from('smoke_state')
    .select('user_id, start_time, cravings_defeated')

  if (error || !sessions?.length) {
    return NextResponse.json({ message: 'No active sessions', error })
  }

  // Get user emails from auth.users
  const userIds = sessions.map((s) => s.user_id)
  const { data: users } = await supabase.auth.admin.listUsers()
  const filteredUsers = users?.users.filter((u) => userIds.includes(u.id)) || []

  const results = []

  for (const session of sessions) {
    const user = filteredUsers.find((u) => u.id === session.user_id)
    if (!user?.email) continue

    const daysElapsed = Math.floor(
      (Date.now() - new Date(session.start_time).getTime()) / 86400000
    )

    // Find current milestone description
    const milestoneMessages: Record<number, string> = {
      1: 'Nồng độ CO trong máu của bạn đã trở về mức bình thường.',
      2: 'Nicotine đã rời khỏi cơ thể bạn hoàn toàn. Vị giác đang dần phục hồi.',
      3: 'Bạn vừa vượt qua rào cản thể chất lớn nhất. Phổi đang thở dễ hơn.',
      7: 'Một tuần hoàn thành! Vị giác và khứu giác của bạn đang trở nên nhạy bén hơn rõ rệt.',
      14: 'Hai tuần! Đỉnh điểm Extinction Burst đã qua. Não bộ đang học cách tự sản sinh Dopamine.',
      21: 'Ba tuần! Đường mòn thần kinh cũ đã suy yếu đáng kể. Bạn đã thực sự thay đổi.',
    }

    const specialMessage = milestoneMessages[daysElapsed]

    const subject = `Ngày thứ ${daysElapsed}: Bạn đang làm rất tốt`
    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; color: #1a2b49;">
        <div style="background: #fdfaf6; padding: 40px 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin: 0 0 24px;">
            MINDLABS — NHẬT KÝ CỦA BẠN
          </p>
          <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px; color: #1a2b49;">
            Ngày thứ ${daysElapsed} không khói thuốc
          </h1>
          <p style="color: #6b7280; font-size: 15px; margin: 0 0 32px;">
            ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          ${specialMessage ? `
          <div style="background: #eff6ff; border-left: 4px solid #1a2b49; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #1e40af; margin: 0; line-height: 1.6;">
              🎯 <strong>Cột mốc hôm nay:</strong> ${specialMessage}
            </p>
          </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center;">
              <p style="font-size: 36px; font-weight: bold; font-family: monospace; color: #1a2b49; margin: 0;">${daysElapsed}</p>
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin: 4px 0 0;">Ngày sống sót</p>
            </div>
            <div style="background: #1a2b49; border-radius: 8px; padding: 20px; text-align: center;">
              <p style="font-size: 36px; font-weight: bold; font-family: monospace; color: white; margin: 0;">${session.cravings_defeated}</p>
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #93c5fd; margin: 4px 0 0;">Cơn thèm đã thắng</p>
            </div>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
            Đừng quên vào Mindlabs để <strong>điểm danh kỷ luật hôm nay</strong>. Mỗi ngày xác nhận là một dấu mốc nhỏ tích lũy thành sức mạnh lớn.
          </p>

          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mindlabs.vercel.app'}/smoke"
            style="display: inline-block; background: #1a2b49; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 0.05em;">
            ĐIỂM DANH HÔM NAY →
          </a>

          <p style="font-size: 11px; color: #d1d5db; margin: 32px 0 0;">
            Mindlabs Smoke · Bạn nhận email này vì đang trong liệu trình bỏ thuốc lá.
          </p>
        </div>
      </div>
    `

    const { error: emailError } = await resend.emails.send({
      from: 'Mindlabs <onboarding@resend.dev>',
      to: user.email,
      subject,
      html,
    })

    results.push({ userId: user.id, email: user.email, sent: !emailError, error: emailError?.message })
  }

  return NextResponse.json({ success: true, sent: results.length, results })
}
