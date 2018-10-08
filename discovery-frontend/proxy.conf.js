const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth"
    ],
    target: "http://localhost:8180",
    secure: false

    //  exntu - ibk
    // target: "http://metatron.exntu.kr",
    // logLevel: "debug",
    // auth: "polaris_client:polaris",
    // changeOrigin: true,
    // secure: false

    //exntu
    // target: "http://exntu.kr:38182",
    // secure: false
  },
  {
    context: [
      "/stomp"
    ],
    target: "http:/localhost:8180",
    secure: false

    //  exntu - ibk
    // target: "http://metatron.exntu.kr",
    // logLevel: "debug",
    // auth: "polaris_client:polaris",
    // changeOrigin: true,
    // secure: false

    //exntu
    // target: "http://exntu.kr:38182",
    // secure: false
  },
  {
    context: [
      "/integrator"
    ],
    target: "http://metatron-web-05:8280",
    secure: false

    //  exntu - ibk
    // target: "http://metatron.exntu.kr",
    // logLevel: "debug",
    // auth: "polaris_client:polaris",
    // changeOrigin: true,
    // secure: false

    //exntu
    // target: "http://exntu.kr:38182",
    // secure: false
  }
];

module.exports = PROXY_CONFIG;
