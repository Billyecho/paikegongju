export default function SetupScreen() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          还没有配置 CloudBase
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-900">先把 CloudBase 环境变量配好</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          代码已经准备切到 CloudBase。你只需要在本地 `.env` 和后续部署环境里填入环境 ID、地域和客户端
          Publishable Key，就能继续往下跑。
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-base font-bold text-slate-900">需要的环境变量</h2>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-slate-100">
              <code>{`VITE_CLOUDBASE_ENV_ID=
VITE_CLOUDBASE_REGION=
VITE_CLOUDBASE_PUBLISHABLE_KEY=
VITE_ALLOWED_EMAIL=`}</code>
            </pre>
          </section>

          <section className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-base font-bold text-slate-900">需要的控制台准备</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              确认已经创建好 `students`、`courses` 两个集合，并开启浏览器侧需要的认证和跨域配置。
            </p>
          </section>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">后续部署时别漏掉</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            不管后面是继续放在 Vercel 还是切回 CloudBase 托管，部署环境里都要同步加上同样的
            `VITE_CLOUDBASE_*` 变量。
          </p>
        </div>
      </div>
    </div>
  )
}
