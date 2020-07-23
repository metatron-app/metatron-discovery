const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth",
      "/extensions",
      "/static"
    ],
    target: "http://metatron-hadoop-09:8185",
    //target: "http://metatron-web-01:8080",
    //target: "http://localhost:8180",
    //target: "http://metatron-hadoop-09:8180",
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
