const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth"
    ],
    "target":  {
      "host": "dev-discovery.metatron.app",
      "protocol": "https:",
      "port": 443
    },
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  },
  {
    context: [
      "/stomp"
    ],
    "target":  {
      "host": "dev-discovery.metatron.app",
      "protocol": "https:",
      "port": 443
    },
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
];

module.exports = PROXY_CONFIG;
