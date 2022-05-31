/** @type {import('next').NextConfig} */
const withAntdLess = require("next-plugin-antd-less");

module.exports = withAntdLess({
  modifyVars: { "@primary-color": "#04f" }, // optional
  lessVarsFilePath: "./styles/antd.less", // optional
  lessVarsFilePathAppendToEndOfContent: false, // optional
  nextjs: {
    localIdentNameFollowDev: true, // default false, for easy to debug on PROD mode
  },
  webpack(config) {
    return config;
  },
});
