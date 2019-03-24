const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth"
    ],
    target: "http://52.231.184.135:8180",
    secure: false
  },
  {
    context: [
      "/stomp"
    ],
    target: "http://52.231.184.135:8180",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
