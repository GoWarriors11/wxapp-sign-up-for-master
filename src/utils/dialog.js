const utils = require("./utils");

/**
 * 提示消息, 会自动消失
 * @param title 必填
 * @param icon
 * @param image
 */
function showToast(title, icon, image) {
  utils.assertNotNull(title);

  wx.showToast({
    title: title,
    icon: icon || "none",
    image: image,
    duration: 2000,
    mask: true,
    success: function(res) {},
    fail: function(res) {},
    complete: function(res) {},
  });
}

/**
 * 对话框, 支持取消/确认
 * @param title 必填
 * @param content 必填
 * @param successCallback
 * @param failCallback
 */
function showModal(title, content, successCallback, failCallback) {
  utils.assertNotNull(title);
  utils.assertNotNull(content);

  wx.showModal({
    title: title,
    content: content,
    showCancel: true,
    success: function(res) {
      if (successCallback) {
        successCallback(res);
      }
    },
    fail: function(res) {
      if (failCallback) {
        failCallback(res);
      }
    },
    complete: function(res) {},
  });
}

/**
 * 提示框
 * @param title 必填
 * @param content 必填
 * @param confirmText 默认"关 闭"
 */
function showInfo(title, content, confirmText) {
  utils.assertNotNull(title);
  utils.assertNotNull(content);

  wx.showModal({
    title: title,
    content: content,
    showCancel: false,
    confirmText: confirmText || "关 闭",
    confirmColor: "#1cb5ff",
    success: function(res) {},
    fail: function(res) {},
    complete: function(res) {},
  });
}

/**
 * 加载中浮窗
 * @param title 默认"加载中"
 */
function showLoading(title) {
  wx.showLoading({
    title: title || "加载中",
    mask: true,
    success: function(res) {},
    fail: function(res) {},
    complete: function(res) {},
  });
}

/**
 * 关闭加载框
 */
function hideLoading() {
  wx.hideLoading();
}

module.exports = {
  showToast,
  showModal,
  showInfo,
  showLoading,
  hideLoading,
};
