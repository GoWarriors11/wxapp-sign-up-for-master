const config = require("../config");
const dialog = require("./dialog");
const session = require("./session");
const R = require("./lib/ramda");

const wxRequest = async (url, options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.apiPrefix + url}`,
      data: options.data ? options.data : {},
      method: options.method,
      header: R.mergeDeepRight(session.getSessionHeader(), { "content-type": "application/x-www-form-urlencoded" }),
      success: function success(res) {
        if (config.isDebugMode) {
          console.log(res);
        }

        const errorCode = res.data.code;

        dialog.hideLoading();

        // 显示错误信息
        if (errorCode !== "OK" && errorCode !== "UNAUTHENTICATED") {
          dialog.showToast(res.data.errorMsg);
        }
        // 处理错误码
        if (errorCode === "UNAUTHENTICATED") {
          //
        } else if (errorCode === "FORBIDDEN") {
          // 未授权
        } else if (errorCode === "ACCOUNT_DISABLED") {
          // 账号已被禁用
        }
        // 返回结果
        resolve(res.data);
      },
      fail: function fail(err) {
        if (config.isDebugMode) {
          console.log(err);
        }

        dialog.hideLoading();

        if (err.statusCode === 404) {
          dialog.showToast("请求地址错误");
        } else if (err.statusCode === 500) {
          dialog.showToast("系统繁忙，请稍后重试");
        } else {
          dialog.showToast("网络请求失败，请重试");
        }

        reject(err);
      },
    });
  });
};

// 接口请求封装
module.exports = {
  get: async (url, options = {}) => {
    return wxRequest(url, { method: "GET", data: options });
  },
  post: async (url, options) => {
    return wxRequest(url, { method: "POST", data: options });
  },
  put: async (url, options) => {
    return wxRequest(url, { method: "PUT", data: options });
  },
  delete: async (url, options) => {
    return wxRequest(url, { method: "DELETE", data: options });
  },
  uploadFile: async (filePath) => {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${config.apiPrefix}v1/base/upload/uploadImage`,
        filePath: filePath,
        name: "file",
        formData: {
          file: filePath,
        },
        success: function(res) {
          resolve(res);
        },
        fail: function(res) {
          dialog.hideLoading();
          dialog.showToast("上传失败,请重新上传");
          reject(res);
        },
      });
    });
  },
};
