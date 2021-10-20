const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth",
      "/extensions",
      "/static",
      "/resources"
    ],
    target: {
      host: 't1-discovery.metatron.bundang10f.io',
      protocol: 'http:',
      port: 80
    },
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: [
      "/stomp"
    ],
    target: {
      host: 't1-discovery.metatron.bundang10f.io',
      protocol: 'http:',
      port: 80
    },
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];

module.exports = PROXY_CONFIG;
