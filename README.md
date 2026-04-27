# 排课工具

辅导老师课程管理工具，支持日/周/月视图切换、拖拽改时、单账号登录和多设备同步。

## 技术栈

- React + Vite
- TailwindCSS
- @dnd-kit（拖拽功能）
- Supabase（单账号认证 + 云端数据）
- Vercel（线上部署）

## 本地运行

```bash
npm install
npm run dev
```

## 功能

### 视图切换
- **日视图** — 查看某一天的课程安排
- **周视图** — 默认视图，查看一周课程
- **月视图** — 预览整月课程分布

### 课程管理
- **新增课程** — 选择学生、科目、日期、时间
- **编辑课程** — 点击课程块修改
- **删除课程** — 在编辑弹窗中删除
- **拖拽改时** — 拖动课程块到其他日期

### 学生管理
- 新增/编辑/删除学生
- 学生信息包括：姓名、年级、电话

### 数据存储
- 使用 Supabase 存储学生与课程数据
- 固定账号登录后，手机和电脑访问同一份数据
- 首次登录后可以把旧 localStorage 数据导入云端

## Supabase 配置

1. 在 Supabase 创建项目
2. 打开 SQL Editor，执行 [docs/supabase-setup.sql](D:/文档/claude%20code/sq7-kechengguanli/docs/supabase-setup.sql)
3. 打开 Project Settings -> API，复制 `Project URL` 和 `anon public key`
4. 在本地 `.env` 中填写：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ALLOWED_EMAIL=gaoshuangquan@outlook.com
```

5. 在 Authentication -> URL Configuration 中，把站点 URL 设成你的 Vercel 域名

## Vercel 部署

1. 把项目上传到 GitHub
2. 在 Vercel 导入这个仓库
3. 在 Vercel 的 Environment Variables 中填写同样的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
4. 部署完成后，用手机和电脑访问同一个 Vercel 地址

## 项目结构

```
src/
├── App.jsx              # 主界面
├── lib/
│   └── supabase.js      # Supabase 客户端
├── context/
│   ├── AuthContext.jsx      # 登录状态管理
│   ├── StudentsContext.jsx  # 学生状态管理
│   └── CoursesContext.jsx   # 课程状态管理
├── components/
│   ├── AuthGate.jsx      # 单账号登录页
│   ├── Calendar.jsx     # 日历视图（日/周/月）
│   ├── CourseBlock.jsx   # 课程块组件
│   ├── CourseModal.jsx   # 课程弹窗
│   ├── SetupScreen.jsx   # 未配置 Supabase 时的提示页
│   ├── StudentList.jsx   # 学生列表
│   └── StudentModal.jsx  # 学生弹窗
└── hooks/
    ├── useAuthContext.js
    └── useStudents.js
```
