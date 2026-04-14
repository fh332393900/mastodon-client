import { HttpsProxyAgent } from 'https-proxy-agent';

const proxy = process.env.HTTPS_PROXY;
export const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
