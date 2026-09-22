import { LoadingSkeleton } from "@/components/mastodon/infinite-scroller"

// 客户端路由切换时，仅内容区显示局部骨架屏；
// Sidebar / 顶部栏 / RightPanel 等兄弟节点保持常驻，实现类 X 的局部加载反馈。
export default function Loading() {
  return (
    <div className="space-y-6 px-4 py-6">
      <LoadingSkeleton />
    </div>
  )
}