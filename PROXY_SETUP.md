# Proxy Agent Setup for Mastodon Client

## Problem

当在服务端使用 `createRestAPIClient` 时,即使设置了 `requestInit: { agent }`,代理也不会生效。这是因为:

1. **masto.js 使用全局 `fetch`**: masto.js 默认使用 `globalThis.fetch`,而不是你传入的 fetch 实现
2. **Node.js 原生 fetch 不支持 `agent`**: Node.js v18+ 的原生 fetch API 不支持 `agent` 选项
3. **node-fetch v3 支持 agent**: 但必须直接调用 node-fetch,而不是通过全局 fetch

## Solution

### 方案:临时替换全局 fetch

在创建 masto 客户端时,临时将 `globalThis.fetch` 替换为带有 proxy agent 的 node-fetch:

```typescript
import fetch from 'node-fetch'
import { agent } from '@/lib/proxy-agent'

// 保存原始 fetch
const originalFetch = globalThis.fetch;

// 临时替换为带 agent 的 node-fetch
if (agent) {
  globalThis.fetch = ((url: any, init?: any) =>
    fetch(url, { ...init, agent } as any)) as any;
}

try {
  // 创建 masto 客户端 - 现在会使用带代理的 fetch
  const client = createRestAPIClient({
    url: serverUrl,
    accessToken: token,
  })
  
  // 使用客户端...
  const result = await client.v1.timelines.home.list()
} finally {
  // 恢复原始 fetch
  if (agent) {
    globalThis.fetch = originalFetch;
  }
}
```

## Files Modified

### Server-side API Routes
所有服务端 API 路由都已更新为使用这个模式:

- `app/api/_lib/mastodon.ts` - getMastodonClient 和 getScopedMastodonClient
- `app/api/posts/[id]/reblog/route.ts` - POST 和 DELETE 处理器
- `app/api/posts/[id]/favourite/route.ts` - POST 和 DELETE 处理器  
- `app/api/timeline/route.tsx` - GET 处理器
- `app/api/[server]/oauth/[origin]/route.ts` - OAuth 回调

### Other Files
- `lib/shared.ts` - fetchAppInfo 直接使用 node-fetch 和 agent
- `lib/proxy-agent.ts` - 导出 agent 实例

## Environment Variable

设置 `HTTPS_PROXY` 环境变量来启用代理:

```bash
# .env.local
HTTPS_PROXY=http://127.0.0.1:7890
```

或在运行时:

**Bash/Linux/macOS:**
```bash
HTTPS_PROXY=http://127.0.0.1:7890 pnpm dev
```

**PowerShell (Windows):**
```powershell
$env:HTTPS_PROXY="http://127.0.0.1:7890"; pnpm dev
```

**CMD (Windows):**
```cmd
set HTTPS_PROXY=http://127.0.0.1:7890 && pnpm dev
```

## How It Works

1. **HttpsProxyAgent 创建**: `lib/proxy-agent.ts` 根据 `HTTPS_PROXY` 环境变量创建代理 agent
2. **临时替换 fetch**: 在需要使用代理时,临时将 `globalThis.fetch` 替换为包装过的 node-fetch
3. **masto.js 使用代理**: masto.js 调用 `globalThis.fetch` 时,实际会使用带代理的 node-fetch
4. **恢复原始 fetch**: 使用 try-finally 确保即使出错也能恢复原始 fetch

## Why This Approach?

- ✅ **不修改 masto.js**: 无需 fork 或 patch masto.js 库
- ✅ **兼容性好**: 适用于所有使用 masto.js 的代码
- ✅ **线程安全**: 使用 try-finally 确保状态恢复
- ✅ **简单**: 不需要复杂的配置或额外的依赖

## Testing

测试代理是否工作:

**PowerShell (Windows):**
```powershell
$env:HTTPS_PROXY="http://127.0.0.1:7890"; pnpm dev
```

**Bash/Linux/macOS:**
```bash
HTTPS_PROXY=http://127.0.0.1:7890 pnpm dev
```

访问需要 Mastodon API 的页面,查看是否能正常加载。

如果代理正常工作,你应该能够:
- 登录 Mastodon 实例
- 查看时间线
- 点赞/转发帖子
