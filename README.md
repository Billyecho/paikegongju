# 排课工具

一个面向个人使用的排课管理工具，支持学生管理、课程安排、日/周/月视图、课程状态标记，以及多设备同步。

## 当前技术栈

- React + Vite
- Tailwind CSS
- `@dnd-kit` 拖拽交互
- CloudBase 身份认证 + 文档数据库
- CloudBase / GitHub 部署

## 本地运行

```bash
npm install
npm run dev
```

默认本地地址：

- [http://127.0.0.1:5174](http://127.0.0.1:5174)

## 环境变量

项目使用以下前端环境变量：

```env
VITE_CLOUDBASE_ENV_ID=
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_PUBLISHABLE_KEY=
VITE_ALLOWED_EMAIL=gaoshuangquan@outlook.com
```

示例见：[D:\文档\claude code\sq7-kechengguanli\.env.example](D:\文档\claude code\sq7-kechengguanli\.env.example)

## CloudBase 控制台准备

在同一个 CloudBase 环境里完成这些配置：

1. 创建集合：
   - `students`
   - `courses`
2. 开启认证方式：
   - 匿名登录
   - 用户名密码
3. 在 `HTTP 访问服务 -> 跨域设置` 中加入本地调试域名：
   - `127.0.0.1:5174`
   - `localhost:5174`
4. 在 `用户管理` 中创建固定登录账号

## 主要功能

- 学生新增 / 编辑 / 删除
- 课程新增 / 编辑 / 删除
- 日 / 周 / 月视图切换
- 拖动课程调整日期和时间
- 课程完成状态标记
- 本地历史数据一键导入云端
- 单账号登录，多设备同步

## 目录结构

```text
src/
├─ App.jsx
├─ lib/
│  └─ cloudbase.js
├─ context/
│  ├─ AuthContext.jsx
│  ├─ StudentsContext.jsx
│  └─ CoursesContext.jsx
├─ components/
│  ├─ AuthGate.jsx
│  ├─ Calendar.jsx
│  ├─ CourseModal.jsx
│  ├─ SetupScreen.jsx
│  ├─ StudentList.jsx
│  └─ StudentModal.jsx
└─ hooks/
   ├─ useAuthContext.js
   ├─ useStudentsContext.js
   └─ useCoursesContext.js
```

## Git 部署建议

如果要改成 CloudBase 的 Git 仓库部署，建议流程是：

1. 本地改代码
2. `npm run lint`
3. `npm run build`
4. 推送到 GitHub
5. 在 CloudBase 静态网站托管里重新部署 Git 应用

这样后面更新会比手动上传压缩包省心很多。
