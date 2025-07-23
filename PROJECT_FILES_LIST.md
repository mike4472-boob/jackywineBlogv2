# JACKYWINE'S BLOG 项目文件清单

## 项目概述
这是一个基于 React + Vite + TypeScript + Tailwind CSS 的个人博客项目，具有 Matrix 代码雨背景效果和现代化的 UI 设计。

## 文件结构

### 根目录配置文件
- `package.json` - 项目依赖和脚本配置
- `package-lock.json` - 依赖版本锁定文件
- `vite.config.ts` - Vite 构建工具配置
- `tsconfig.json` - TypeScript 配置
- `tsconfig.app.json` - 应用程序 TypeScript 配置
- `tailwind.config.js` - Tailwind CSS 配置
- `postcss.config.js` - PostCSS 配置
- `eslint.config.js` - ESLint 代码规范配置
- `index.html` - 项目入口 HTML 文件
- `README.md` - 项目说明文档
- `vercel.json` - Vercel 部署配置
- `.gitignore` - Git 忽略文件配置
- `.vercelignore` - Vercel 忽略文件配置

### 源代码目录 (src/)

#### 主要文件
- `main.tsx` - 应用程序入口文件
- `App.tsx` - 主应用组件
- `index.css` - 全局样式文件
- `vite-env.d.ts` - Vite 环境类型定义

#### 页面组件 (pages/)
- `Home.tsx` - 主页组件，包含标题和背景效果

#### UI 组件 (components/)
- `ShaderBackground.tsx` - WebGL Shader 背景组件，实现 Matrix 代码雨效果
- `MatrixRain.tsx` - 原始 Matrix 雨效果组件（已被 Shader 版本替代）
- `TerminalHeader.tsx` - 终端风格的头部组件
- `NavigationPanel.tsx` - 导航面板组件
- `Empty.tsx` - 空状态组件

#### 自定义 Hooks (hooks/)
- `useTheme.ts` - 主题管理 Hook

#### 工具函数 (lib/)
- `utils.ts` - 通用工具函数

#### 静态资源 (assets/)
- `react.svg` - React 图标

#### 公共资源 (public/)
- 包含网站图标和其他静态资源

## 技术栈
- **前端框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **3D/图形**: WebGL (用于 Shader 背景)
- **状态管理**: Zustand
- **图标**: Lucide React
- **部署**: Vercel

## 主要特性
1. **Matrix 代码雨背景**: 使用 WebGL Shader 实现的高性能动画效果
2. **鼠标交互**: 背景会响应鼠标移动，产生发光效果
3. **响应式设计**: 适配各种屏幕尺寸
4. **现代化 UI**: 使用 Tailwind CSS 构建的简洁界面
5. **TypeScript**: 完整的类型安全
6. **性能优化**: 基于 Vite 的快速构建和热更新

## 运行项目
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目创建时间
2025年1月

## 作者
JACKYWINE