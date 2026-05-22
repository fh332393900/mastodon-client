## 1. i18n 文案

- [x] 1.1 在 `messages/*.json` 所有 6 个语言文件中添加 `status.spoilerShow` 和 `status.spoilerHide` key
- [x] 1.2 `status.spoilerShow` 文案为 "点击查看" (各语言对应翻译)
- [x] 1.3 `status.spoilerHide` 文案为 "收起" (各语言对应翻译)
- [x] 1.4 在 `status.spoilerShow` 旁添加 `status.spoilerMediaReveal` key，用于模糊媒体上的 "点击查看" 提示

## 2. StatusMedia 模糊支持

- [x] 2.1 为 `StatusMedia` 组件添加 `spoilered?: boolean` prop
- [x] 2.2 当 `spoilered` 为 true 时，在媒体容器上叠加半透明遮罩层
- [x] 2.3 遮罩层内居中显示 "点击查看" 文字（使用 `status.spoilerMediaReveal`）
- [x] 2.4 对图片/视频应用 `filter: blur(20px)` CSS 样式
- [x] 2.5 使用 `scale-105` 等细节防止模糊边缘露白

## 3. StatusCard 折叠状态

- [x] 3.1 在 StatusCard 中添加 `showSpoiler` state，初始值为 `false`
- [x] 3.2 当 `spoilerText` 非空时，正文、PreviewCard、Poll 仅在 `showSpoiler` 为 true 时渲染
- [x] 3.3 向 StatusMedia 传递 `spoilered={!showSpoiler}` prop
- [x] 3.4 将现有 spoilerText 展示区改造为可点击的展开/收起按钮
- [x] 3.5 展开后显示 "收起" 按钮，点击恢复折叠状态

## 4. 验证与打磨

- [ ] 4.1 验证无 spoilerText 的贴文展示不受影响
- [ ] 4.2 验证桌面端与移动端布局下模糊效果正常
- [ ] 4.3 验证点击折叠区域不会触发贴文详情导航（阻止事件冒泡）
