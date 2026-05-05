import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // This runs at 13:00 UTC = 20:00 Vietnam
  const now = new Date()
  // Build today's date in GMT+7
  const gmt7Now = new Date(now.getTime() + 7 * 60 * 60 * 1000)

  const { data: sessions } = await supabase.from('smoke_state').select('*')
  if (!sessions?.length) return NextResponse.json({ message: 'No active sessions' })

  const { data: usersData } = await supabase.auth.admin.listUsers()
  const users = usersData?.users || []
  const results = []

  for (const session of sessions) {
    const user = users.find(u => u.id === session.user_id)
    if (!user?.email) continue

    const startTime = new Date(session.start_time).getTime()
    const daysElapsed = Math.floor((now.getTime() - startTime) / 86400000)
    if (daysElapsed < 0) continue

    // Check if user has NOT checked in today (GMT+7)
    const lastCheckIn = session.last_check_in_at ? new Date(session.last_check_in_at) : null
    const lastCheckInGmt7 = lastCheckIn ? new Date(lastCheckIn.getTime() + 7 * 60 * 60 * 1000) : null
    const isCheckedInToday = lastCheckInGmt7 &&
      lastCheckInGmt7.getUTCFullYear() === gmt7Now.getUTCFullYear() &&
      lastCheckInGmt7.getUTCMonth() === gmt7Now.getUTCMonth() &&
      lastCheckInGmt7.getUTCDate() === gmt7Now.getUTCDate()

    // Check dormancy (48+ hours without check-in)
    const hoursSinceCheckIn = lastCheckIn
      ? (now.getTime() - lastCheckIn.getTime()) / 3600000
      : (now.getTime() - startTime) / 3600000

    if (!isCheckedInToday) {
      if (hoursSinceCheckIn > 48) {
        // Dormancy warning
        const subject = `⚠️ Cảnh báo: Lộ trình của bạn sắp bị Reset`
        const html = `
          <div style="font-family: serif; max-width: 500px; margin: 0 auto; color: #b91c1c; border: 1px solid #fee2e2; padding: 32px; border-radius: 12px;">
            <h2 style="margin: 0 0 16px;">Cảnh báo Kỷ luật</h2>
            <p>Đã ${Math.floor(hoursSinceCheckIn)}h bạn không tương tác với hệ thống. Đừng để công sức bấy lâu nay tan biến.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/smoke" style="display: inline-block; background: #b91c1c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">QUAY LẠI HÀNH TRÌNH</a>
          </div>
        `
        await resend.emails.send({ from: 'Mindlabs <onboarding@resend.dev>', to: user.email, subject, html })
        results.push({ userId: user.id, type: 'dormancy_warning' })
      } else {
        // Regular evening reminder
        const subject = `Nhắc nhở: Xác nhận kỷ luật hôm nay`
        const html = `
          <div style="font-family: serif; max-width: 500px; margin: 0 auto; color: #1a2b49; border: 1px solid #e5e7eb; padding: 32px; border-radius: 12px;">
            <h2 style="margin: 0 0 16px;">Kỷ luật cuối ngày</h2>
            <p>Hệ thống ghi nhận bạn chưa xác nhận kỷ luật hôm nay. Cổng điểm danh đã mở từ 19:00. Hãy vào xác nhận ngay.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/smoke" style="display: inline-block; background: #1a2b49; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">ĐIỂM DANH NGAY</a>
          </div>
        `
        await resend.emails.send({ from: 'Mindlabs <onboarding@resend.dev>', to: user.email, subject, html })
        results.push({ userId: user.id, type: 'evening_reminder' })
      }
    }
  }

  return NextResponse.json({ success: true, processed: results.length, details: results })
}
