import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MILESTONE_MESSAGES: Record<number, string> = {
  1: 'Nồng độ CO trong máu của bạn đã trở về mức bình thường.',
  2: 'Nicotine đã rời khỏi cơ thể bạn hoàn toàn. Vị giác đang dần phục hồi.',
  3: 'Bạn vừa vượt qua rào cản thể chất lớn nhất. Phổi đang thở dễ hơn.',
  7: 'Một tuần hoàn thành! Vị giác và khứu giác đang nhạy bén hơn rõ rệt.',
  14: 'Hai tuần! Đỉnh điểm Extinction Burst đã qua.',
  21: 'Ba tuần! Chúc mừng bạn đã hình thành thói quen mới. Đây là một khởi đầu tuyệt vời, hãy giữ vững nó.',
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current hour in GMT+7
  const now = new Date()
  const gmt7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000))
  const hour = gmt7Time.getUTCHours() // This is the hour in GMT+7

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
    
    // ─── TASK 1: 8 AM CONGRATS ──────────────────────────────────────────────
    if (hour === 8) {
      if (daysElapsed < 0) continue // Haven't started yet
      
      const specialMessage = MILESTONE_MESSAGES[daysElapsed]
      const subject = `Ngày thứ ${daysElapsed}: Bạn đang làm rất tốt`
      const html = `
        <div style="font-family: serif; max-width: 500px; margin: 0 auto; color: #1a2b49; border: 1px solid #e5e7eb; padding: 32px; border-radius: 12px;">
          <h2 style="margin: 0 0 16px;">Ngày thứ ${daysElapsed} không khói thuốc</h2>
          ${specialMessage ? `<p style="background: #eff6ff; padding: 12px; border-radius: 8px; font-style: italic;">"${specialMessage}"</p>` : ''}
          <p>Hãy giữ vững kỷ luật. Mỗi ngày trôi qua là một chiến thắng.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/smoke" style="display: inline-block; background: #1a2b49; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">VÀO DASHBOARD</a>
        </div>
      `
      await resend.emails.send({ from: 'Mindlabs <onboarding@resend.dev>', to: user.email, subject, html })
      results.push({ userId: user.id, type: 'morning_congrats' })
    }

    // ─── TASK 2: 8 PM (20:00) REMINDER ────────────────────────────────────────
    if (hour === 20) {
      const lastCheckIn = session.last_check_in_at ? new Date(session.last_check_in_at) : null
      const isCheckedInToday = lastCheckIn && 
        lastCheckIn.getDate() === gmt7Time.getUTCDate() && 
        lastCheckIn.getMonth() === gmt7Time.getUTCMonth() && 
        lastCheckIn.getFullYear() === gmt7Time.getUTCFullYear()

      if (!isCheckedInToday && daysElapsed >= 0) {
        const subject = `Nhắc nhở: Xác nhận kỷ luật hôm nay`
        const html = `
          <div style="font-family: serif; max-width: 500px; margin: 0 auto; color: #1a2b49; border: 1px solid #e5e7eb; padding: 32px; border-radius: 12px;">
            <h2 style="margin: 0 0 16px;">Kỷ luật cuối ngày</h2>
            <p>Hệ thống ghi nhận bạn chưa xác nhận kỷ luật cho ngày hôm nay. Đừng để một ngày nỗ lực trôi qua trong im lặng.</p>
            <p>Cổng điểm danh đã mở từ 19:00. Hãy vào xác nhận ngay.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/smoke" style="display: inline-block; background: #1a2b49; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">ĐIỂM DANH NGAY</a>
          </div>
        `
        await resend.emails.send({ from: 'Mindlabs <onboarding@resend.dev>', to: user.email, subject, html })
        results.push({ userId: user.id, type: 'evening_reminder' })
      }
    }

    // ─── TASK 3: DORMANCY CHECK (Run at 10 PM) ────────────────────────────────
    if (hour === 22) {
      const lastCheckIn = session.last_check_in_at ? new Date(session.last_check_in_at).getTime() : startTime
      const hoursSinceLastActive = (now.getTime() - lastCheckIn) / 3600000
      
      if (hoursSinceLastActive > 48 && hoursSinceLastActive < 52) { // Just hit 2 days
        const subject = `Cảnh báo: Lộ trình của bạn sắp bị Reset`
        const html = `
          <div style="font-family: serif; max-width: 500px; margin: 0 auto; color: #b91c1c; border: 1px solid #fee2e2; padding: 32px; border-radius: 12px;">
            <h2 style="margin: 0 0 16px;">Cảnh báo Kỷ luật</h2>
            <p>Đã 48 giờ bạn không tương tác với hệ thống. Nếu không có phản hồi trong 24h tới, lộ trình của bạn sẽ tự động reset về 0.</p>
            <p>Đừng để công sức bấy lâu nay tan biến.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/smoke" style="display: inline-block; background: #b91c1c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">QUAY LẠI HÀNH TRÌNH</a>
          </div>
        `
        await resend.emails.send({ from: 'Mindlabs <onboarding@resend.dev>', to: user.email, subject, html })
        results.push({ userId: user.id, type: 'dormancy_warning' })
      }
    }
  }

  return NextResponse.json({ success: true, processed: results.length, details: results })
}
