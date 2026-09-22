// 客户端路由切换时，仅内容区显示居中转圈图标（参考 X）；
// Sidebar / 顶部栏 / RightPanel 等兄弟节点保持常驻，实现类 X 的局部加载反馈。
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[60vh] items-center justify-center py-6"
    >
      <span className="block h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
    </div>
  )
}
