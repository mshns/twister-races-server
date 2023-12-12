import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';

const proxyMiddleware = createProxyMiddleware(
  ['/api', '/assets', '/embed', '/favicon', '/static', '/styles', '/ws'],
  {
    target: process.env.API_SERVICE_URL,
    router: {
      '/api': process.env.API_BACKEND_URL,
      '/ws': process.env.API_BACKEND_WS,
    },
    changeOrigin: true,
    ws: true,
    selfHandleResponse: true,

    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer.toString('utf8');
        return response
          .replace(process.env.API_BACKEND_URL, process.env.PROXY_SERVER_URL)
          .replace(process.env.API_BACKEND_WS, process.env.PROXY_SERVER_WS)
          .replaceAll(process.env.API_SERVICE_URL, process.env.PROXY_SERVER_URL)
          .replaceAll(process.env.API_URL, process.env.PROXY_SERVER_URL)
          .replaceAll('rel="preload', 'rel="prefetch');
      }
    ),
  }
);

export default proxyMiddleware;
