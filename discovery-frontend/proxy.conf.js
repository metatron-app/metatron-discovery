const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth"
    ],
    target: "http://localhost:8180",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  },
  {
    context: [
      "/stomp"
    ],
    target: "http://localhost:8180",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
];

module.exports = PROXY_CONFIG;
