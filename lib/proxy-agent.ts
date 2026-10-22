// 仅开发环境生效:为服务端 fetch 增加代理支持。
// 注意:必须使用 undici 的 ProxyAgent(返回 Web ReadableStream 响应体),
// 不能用 node-fetch——其 Node stream 响应体与 Next.js fetch 缓存(body.tee)不兼容。

// Only use proxy in development environment
const isDevelopment = process.env.NODE_ENV === 'development';
const proxy = isDevelopment ? process.env.HTTPS_PROXY : undefined;

/**
 * 直连白名单:这些域名直连更快更稳。
 */
const DIRECT_HOSTS = new Set([
  'api.football-data.org',
]);

function resolveUrl(input: RequestInfo | URL): string {
  if (input instanceof Request) return input.url;
  if (input instanceof URL) return input.toString();
  return input;
}

// Setup global fetch to use proxy agent for server-side requests
// This needs to be called once at the module level on the server
if (typeof window === 'undefined' && proxy && isDevelopment) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Readable } = require('node:stream') as typeof import('node:stream');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { HttpsProxyAgent } = require('https-proxy-agent') as typeof import('https-proxy-agent');
  const proxyAgent = new HttpsProxyAgent(proxy);

  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = resolveUrl(input);
    // 白名单域名直连,保留 Next fetch 的缓存能力
    try {
      if (DIRECT_HOSTS.has(new URL(url).hostname)) {
        return await originalFetch(input, init);
      }
    } catch {
      // URL 解析失败时按代理流程处理
    }

    // node-fetch 走代理;响应体转为 Web ReadableStream 后包装成标准 Response,
    // 否则其 Node stream 响应体与 Next.js fetch 缓存(body.tee)不兼容
    const nodeFetch = (await import('node-fetch')).default;

    let requestInit = init;
    if (input instanceof Request) {
      requestInit = {
        ...init,
        method: init?.method || input.method,
        headers: init?.headers || input.headers,
        body: init?.body || (input.body as any),
      };
    }

    const nodeRes = await nodeFetch(url, { ...requestInit, agent: proxyAgent } as any);
    const webBody = nodeRes.body
      ? (Readable.toWeb(nodeRes.body as unknown as import('node:stream').Readable) as ReadableStream)
      : null;
    const headers: Record<string, string> = {};
    nodeRes.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return new Response(webBody, {
      status: nodeRes.status,
      statusText: nodeRes.statusText,
      headers,
    });
  };

  console.log('✅ [DEV] Proxy agent configured:', proxy);
} else if (typeof window === 'undefined') {
  console.log('ℹ️ [PROD] Proxy agent disabled in production');
}

// 兼容旧的命名导出
export const agent = undefined;

