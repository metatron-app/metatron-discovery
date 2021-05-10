const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth",
      "/extensions",
      "/static",
      "/resources"
    ],
    target: "http://52.231.167.55:8187",
    secure: false
  },
  {
    context: [
      "/stomp"
    ],
    target: "http://52.231.167.55:8187",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
