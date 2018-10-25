const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth"
    ],
    target: "http://localhost:8180",
    secure: false
  },
  {
    context: [
      "/stomp"
    ],
    target: "http://localhost:8180",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
