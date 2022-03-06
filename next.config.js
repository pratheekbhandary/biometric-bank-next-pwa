const withPWA = require("next-pwa");
// https://www.npmjs.com/package/next-pwa#:~:text=Usage%20Without%20Custom%20Server%20(next.js%209%2B)
// https://dev.to/byteslash/how-to-create-a-pwa-with-next-js-4dbm
module.exports = withPWA({
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  },
});
