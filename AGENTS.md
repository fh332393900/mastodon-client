# AGENTS.md

## 项目概览

- 项目名称：`v0-mastodon-client`
- 技术栈：Next.js App Router、React、TypeScript、Tailwind CSS、shadcn/ui、`masto`、`@tanstack/react-query`
- 产品定位：Mastodon Web 客户端，包含时间线、收藏、发帖、探索、设置等核心能力
- 核心数据链路：页面/组件 -> `hooks/mastodon/**` -> `masto` client -> React Query cache

## 目录约定

- `app/**`：App Router 页面与布局；接口路由位于 `app/api/**`
- `components/mastodon/**`：Mastodon 业务 UI 组件
- `components/layout/**`：整体布局、侧边栏、右侧面板等
- `hooks/mastodon/**`：Mastodon 数据获取、缓存、状态管理
- `lib/mastodon/**`：Mastodon 相关工具函数与内容处理逻辑
- `messages/*.json`：多语言文案
- `tests/**`：Vitest 测试

## 开发原则

- 优先使用 TypeScript，避免引入 `any`
- 页面层保持轻量，数据获取与缓存逻辑优先下沉到 `hooks/mastodon/**`
- 优先复用现有组件和工具，不重复造轮子
- 用户可见文本统一走 `next-intl`
- 修改行为时优先更新 React Query 缓存，尽量避免不必要的全量 refetch
- 仅在组件确实需要交互、浏览器 API 或 client hook 时添加 `"use client"`

## Mastodon 相关约定

- Mastodon 请求优先在客户端组件或 hooks 中通过 `useMasto()` / `useAuth()` 发起
- 列表页或 Feed 页优先复用 `components/mastodon/infinite-scroller.tsx`
- 使用 `InfiniteScroller` 时必须提供稳定的 `scrollCacheKey`
- 时间线、收藏、探索等列表数据以 React Query 为主要事实来源
- Mastodon 实例与登录态需兼容现有 cookie 流程：`mastodon_server`、`mastodon_token`

## UI 与组件约定

- 组件文件与导出符号使用 PascalCase
- 样式优先延续现有 Tailwind 组合方式，避免引入新的样式体系
- 新 UI 优先复用 `components/ui/**` 和已有 Mastodon 组件
- 响应式改动需要同时考虑移动端宽度、滚动和触控交互
- 对列表、表单、弹层等交互区域，优先保证移动端可用性与可点击性

## 编辑器与内容渲染

- 发帖编辑器相关修改必须兼容现有 markdown 序列化逻辑
- 自定义 emoji、代码块、富文本渲染应复用既有实现
- 阅读态内容优先使用 `lib/mastodon/contentToReactNode.tsx` 及相关辅助函数

## 国际化约定

- 所有用户可见文案都要接入 `next-intl`
- 新增 key 时同步更新 `messages/*.json`
- 保持 `app/i18n.ts` 中声明的语言与翻译文件一致

## 常用命令

```bash
pnpm install
pnpm run dev
pnpm lint
pnpm run build
pnpm test
```

## 测试与验证

- 修改完成后，至少执行与改动范围相匹配的验证
- 有明确风险点时补充或更新测试
- UI 改动重点检查：
  - 桌面端与移动端布局
  - 滚动、拖拽、上传、弹窗等交互
  - 多语言文案是否正常显示

## 提交与协作

- Git commit message 使用英文
- commit subject 尽量简洁、祈使句、长度控制在 72 字符以内
- 不要在未确认的情况下改动与当前任务无关的文件

## 给 Agent 的建议

- 开始改动前，先阅读相关页面、组件、hook 和工具文件，确认数据流
- 优先在现有模式中扩展，而不是新增平行实现
- 如果任务涉及列表页、缓存、滚动恢复、Mastodon API 调用，先对照现有 hook 与 `InfiniteScroller` 模式
- 如果任务涉及设置页或表单，重点检查移动端宽度、按钮可点击区域、上传预览与保存反馈
