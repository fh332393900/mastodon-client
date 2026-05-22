## Why

当前 StatusCard 虽然展示 spoilerText（内容警告），但正文内容和媒体始终完全可见，没有实现折叠/模糊效果。Mastodon 的 content warning 机制要求用户在未确认前不应看到敏感内容，当前实现不符合这一交互预期。

## What Changes

- 当贴文包含 spoilerText 时，正文内容默认折叠隐藏
- 当贴文包含 spoilerText 时，媒体附件默认添加模糊背景，提示用户点击查看
- 提供 "点击查看" 交互入口，用户点击后展开内容并清晰显示媒体
- 支持切换回折叠/模糊状态

## Capabilities

### New Capabilities

- `spoiler-content-warning`: StatusCard 中对 spoiler 内容的折叠展开与媒体模糊控制能力

### Modified Capabilities

<!-- None: 这是全新的交互行为，不修改现有 spec -->

## Impact

- `components/mastodon/Status/StatusCard.tsx` — 添加折叠状态管理与点击交互
- `components/mastodon/Status/StatusMedia.tsx` — 支持模糊模式的媒体展示
