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
      host: 'localhost',
      protocol: 'http:',
      port: 8180
    },
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
    // target: "http://localhost:8180",
    // secure: false
  },
  {
    context: [
      "/stomp"
    ],
    target: {
      host: 'localhost',
      protocol: 'http:',
      port: 8180
    },
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
    // target: "http://localhost:8180",
    // secure: false
  }
];

module.exports = PROXY_CONFIG;
