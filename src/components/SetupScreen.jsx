export default function SetupScreen() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          还没配置 Supabase
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-900">先把环境变量和数据库表建好</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          代码已经准备好接 Supabase。你只需要在 Vercel 和本地 `.env` 中填入项目地址和匿名 Key，再到 Supabase SQL Editor 执行建表脚本。
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-base font-bold text-slate-900">需要的环境变量</h2>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-slate-100"><code>VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=</code></pre>
          </section>

          <section className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-base font-bold text-slate-900">需要执行的 SQL</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              直接使用 [docs/supabase-setup.sql](D:/文档/claude%20code/sq7-kechengguanli/docs/supabase-setup.sql) 里的脚本即可。
            </p>
          </section>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">Vercel 部署时别漏掉</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            在 Vercel 项目设置里，把同样的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 也加进去，然后重新部署。这样手机访问线上网址时也能正常登录。
          </p>
        </div>
      </div>
    </div>
  )
}
