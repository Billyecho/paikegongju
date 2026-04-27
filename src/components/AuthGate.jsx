import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

export default function AuthGate() {
  const { isRecovery, signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword } = useAuthContext()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (isRecovery) {
        if (password !== confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }
        await updatePassword(password)
        setMessage('密码已经更新，现在可以直接用邮箱和密码登录。')
        setPassword('')
        setConfirmPassword('')
      } else if (mode === 'login') {
        await signInWithPassword(email, password)
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }
        const result = await signUpWithPassword(email, password)
        if (result.session) {
          setMessage('注册成功，已经自动登录。')
        } else {
          setMessage('注册成功，请去邮箱完成确认后再登录。')
        }
      } else {
        await sendPasswordReset(email)
        setMessage('密码重置邮件已发送，请去邮箱打开链接设置新密码。')
      }
    } catch (submitError) {
      setError(submitError.message || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const title = isRecovery
    ? '设置新密码'
    : mode === 'login'
      ? '邮箱密码登录'
      : mode === 'register'
        ? '注册账号'
        : '重置密码'

  const intro = isRecovery
    ? '你已经通过邮件进入密码设置页面，保存后就可以直接用邮箱和密码登录。'
    : mode === 'login'
      ? '以后你只需要输入邮箱和密码，不必再每次去邮箱点登录链接。'
      : mode === 'register'
        ? '如果你想新建一个邮箱密码账号，可以在这里注册。'
        : '如果你之前只用过邮箱链接登录，或者忘了密码，可以在这里发一封重置邮件。'

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
              这套页面已经准备好走邮箱密码登录和云端同步。用同一个账号登录后，课程和学生信息会跟着账号走，不再绑在某一台设备上。
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/8 p-5">
                <div className="text-sm font-semibold text-white">登录方式</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">邮箱 + 密码为主，也支持通过邮件重置密码。</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-5">
                <div className="text-sm font-semibold text-white">数据同步</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">同一账号登录后，电脑和手机访问的是同一份数据。</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-xl shadow-slate-200/60 sm:px-8">
            <div className="mb-8">
              {!isRecovery && (
                <div className="mb-5 flex rounded-2xl bg-slate-100 p-1">
                  {[
                    { key: 'login', label: '登录' },
                    { key: 'register', label: '注册' },
                    { key: 'reset', label: '重置密码' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setMode(item.key)
                        setMessage('')
                        setError('')
                      }}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        mode === item.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{intro}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isRecovery && (
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
              )}

              {(mode !== 'reset' || isRecovery) && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isRecovery ? '设置新密码' : '输入密码'}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              )}

              {(mode === 'register' || isRecovery) && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">确认密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="再输入一次密码"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              )}

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
                {submitting
                  ? '处理中...'
                  : isRecovery
                    ? '保存新密码'
                    : mode === 'login'
                      ? '登录'
                      : mode === 'register'
                        ? '注册并继续'
                        : '发送重置邮件'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
