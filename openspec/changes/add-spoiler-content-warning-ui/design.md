## Context

Mastodon 的 `status.spoilerText` 字段标识一条贴文是否包含内容警告。当前 StatusCard 仅将 spoilerText 作为一段提示文字展示，但正文内容 (`content`)、媒体附件 (`mediaAttachments`) 和投票 (`poll`) 仍然完全可见，没有实现 Mastodon 标准的 "折叠后点击查看" 交互模式。需要同时处理 StatusCard（折叠文本）和 StatusMedia（模糊媒体）。

## Goals / Non-Goals

**Goals:**
- 有 spoilerText 时，正文、附卡、投票默认隐藏，仅显示 spoilerText 和展开按钮
- 有 spoilerText 时，媒体默认应用高斯模糊 + 半透明遮罩，并显示 "点击查看" 提示
- 用户点击展开后，正文正常显示、媒体恢复清晰
- 支持再次折叠
- 不破坏无 spoilerText 贴文的现有展示

**Non-Goals:**
- 不修改后端 API 或数据模型
- 不改变其他组件中 spoilerText 的行为（如详情页 ReplyComposer / ReplyItem）

## Decisions

1. **状态管理：useState 在 StatusCard 内管理 spoiler 可见性**
   - 理由：折叠/展开是纯 UI 状态，不涉及缓存或数据变更，useState 足够。无需提升到父组件。
   - 备选：React Query 缓存 → 过度复杂，浪费

2. **媒体模糊方案：CSS filter + overlay 而非修改图片 src**
   - 理由：纯 CSS `filter: blur(20px)` 结合半透明遮罩，不涉及重新加载图片，性能最好。StatusMedia 接受 `spoilered?: boolean` prop
   - 备选：canvas 渲染模糊 → 性能差，代码量大

3. **正文折叠方案：条件渲染而非 CSS 裁剪**
   - 理由：折叠时直接不渲染内容区（`{showSpoiler ? <MastodonContent/> : null}`），语义清晰，DOM 更精简
   - 备选：`max-height` + `overflow: hidden` → 可能被 SEO/辅助工具越过

4. **交互入口：点击遮罩/折叠区即展开**
   - 理由：与 Mastodon 原生交互一致，用户点击 spoiler 区域来展开
   - 按钮文字沿用现有 `next-intl` 体系，新增 key 到 `messages/*.json`

## Risks / Trade-offs

- 模糊效果在低端移动设备上可能有轻微性能影响 → 使用 `will-change: filter` 优化
- spoilerText 本身可能包含 HTML/emoji → 复用 MastodonContent 渲染
- 切换状态时滚动位置可能跳动 → 在展开按钮附近使用 `scroll-margin`
