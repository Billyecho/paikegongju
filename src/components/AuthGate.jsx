import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

export default function AuthGate() {
  const { signInWithEmail } = useAuthContext()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await signInWithEmail(email)
      setMessage('登录链接已发送，请去邮箱打开邮件完成登录。')
    } catch (submitError) {
      setError(submitError.message || '发送登录邮件失败')
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
              这套页面已经准备好走邮箱登录和云端同步。用同一个邮箱登录后，课程和学生信息会跟着账号走，不再绑在某一台设备上。
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/8 p-5">
                <div className="text-sm font-semibold text-white">登录方式</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">邮箱魔法链接，无需单独记密码。</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-5">
                <div className="text-sm font-semibold text-white">数据同步</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">同一账号登录后，电脑和手机访问的是同一份数据。</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-xl shadow-slate-200/60 sm:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">邮箱登录</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                输入你自己的邮箱，系统会发一封登录邮件给你。手机和电脑都用同一个邮箱登录即可。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

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
                {submitting ? '发送中...' : '发送登录链接'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
