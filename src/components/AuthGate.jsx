import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL || 'gaoshuangquan@outlook.com'

export default function AuthGate() {
  const { signInWithPassword } = useAuthContext()
  const [email, setEmail] = useState(allowedEmail)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (email.trim().toLowerCase() !== allowedEmail.toLowerCase()) {
        throw new Error('这个系统只允许指定账号登录，请使用固定邮箱。')
      }
      await signInWithPassword(email.trim(), password)
    } catch (submitError) {
      setError(submitError.message || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_40%,_#f8fafc)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] bg-slate-900 px-8 py-10 text-white shadow-2xl shadow-slate-300/50">
            <div className="mb-10 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              随时随地查看同一份排课表
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
              你的排课工具现在可以在手机、平板和电脑上共用
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              这套页面现在只保留一个固定账号登录。你用同一组邮箱和密码登录后，课程和学生信息会跟着账号走，不再绑在某一台设备上。
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/8 p-5">
                <div className="text-sm font-semibold text-white">登录方式</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">固定邮箱 + 密码登录，不再开放注册和邮件重置。</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-5">
                <div className="text-sm font-semibold text-white">数据同步</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">同一账号登录后，电脑和手机访问的是同一份数据。</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-xl shadow-slate-200/60 sm:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">单账号登录</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                这个系统现在只保留一个固定邮箱登录入口。密码如需修改，请在 Supabase 后台的用户管理里手动更新。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">固定邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="输入密码"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? '登录中...' : '登录'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
