import { HttpsProxyAgent } from 'https-proxy-agent';

const proxy = process.env.HTTPS_PROXY;
export const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

// Setup global fetch to use proxy agent for all server-side requests
// This needs to be called once at the module level on the server
if (typeof window === 'undefined' && agent) {
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Use node-fetch with proxy agent
    const nodeFetch = (await import('node-fetch')).default;
    
    // Extract URL from Request object if needed
    let url: string;
    let requestInit = init;
    
    if (input instanceof Request) {
      url = input.url;
      // Merge Request properties with init
      requestInit = {
        ...init,
        method: init?.method || input.method,
        headers: init?.headers || input.headers,
        body: init?.body || (input.body as any),
      };
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input;
    }
    
    return nodeFetch(url, { ...requestInit, agent } as any) as any;
  };
  
  console.log('✅ Proxy agent configured:', proxy);
}
