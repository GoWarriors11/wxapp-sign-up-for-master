const wxgql = require("./wxgql");
const dialog = require("../dialog");
const config = require("../../config");
const session = require("../session");
const R = require("../lib/ramda");
const type = require("../lib/type");

wxgql.setOptions({
  url: config.apiPrefix,
  header: function() {
    return R.mergeDeepRight(session.getSessionHeader(), { "content-type": "application/json" });
  },
  // 全局错误拦截
  errorHandler: function(res) {
    if (config.isDebugMode) {
      console.log(res);
    }

    // 显示错误信息
    if (type.isString(res)) {
      dialog.showToast("error: " + res);
      return;
    }
    const error = res.errors[0];
    dialog.showToast(error.message);

    // 处理错误码
    const errorCode = error.extensions.code;
    if (errorCode === "UNAUTHENTICATED") {
      // 未登录
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (!currentPage || currentPage.route !== "pages/authorize/authorize") {
        wx.navigateTo({
          url: "/pages/authorize/authorize",
        });
      }
    } else if (errorCode === "FORBIDDEN") {
      // 未授权
    } else if (errorCode === "ACCOUNT_DISABLED") {
      // 账号已被禁用
    }
  },
});

module.exports = {
  query: wxgql.query,
  mutation: wxgql.mutation,
};
