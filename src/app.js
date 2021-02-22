const session = require("./utils/session");
const loginApi = require("./api/loginApi");
const request = require("./utils/request");
const { ResultCode } = require("./utils/resultCode");
// const visitorApi = require("./api/visitorApi");
// const userApi = require("./api/userApi");
App({
  onError(msg) {
    console.log(msg);
  },
  onLaunch: async function(options) {
    // 获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.height = res.statusBarHeight;
        let totalTopHeight = 68;
        if (res.model.indexOf("iPhone X") !== -1) {
          totalTopHeight = 88;
          this.globalData.isIpx = true;
        } else if (res.model.indexOf("iPhone") !== -1) {
          totalTopHeight = 64;
        }
        this.globalData.statusBarHeight = res.statusBarHeight;
        this.globalData.titleBarHeight = totalTopHeight - res.statusBarHeight;
        this.globalData.marginTopHeight = totalTopHeight;
      },
    });
  },
  /**
   * 判断是否登录
   */
  verifyLogin: async function() {
    const data = await loginApi.verifyLogin();
    if (data.code === ResultCode.unauthenticated) {
      // 未登录的情况下
      await this.onWxLogin();
    } else if (data.code === ResultCode.success) {
      // 已登录的情况下
    }
  },
  /**
   * 如果用户未授权, 则使用静默登录
   *
   * 已授权, 则获取用户信息后登录
   */
  onWxLogin: async function(type) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: function(res) {
          const code = res.code;
          // 查看是否授权
          wx.getSetting({
            async success(res) {
              if (res.authSetting["scope.userInfo"]) {
                // 授权后才能调用 getUserInfo 获取用户信息
                wx.getUserInfo({
                  success: async function(res) {
                    const params = {
                      code: code,
                      encryptedData: res.encryptedData,
                      iv: res.iv,
                    };
                    const data = await loginApi.login(params);
                    if (data.code === "OK") {
                      session.setSessionId(data.data.JSESSIONID);
                      console.log("登录成功");
                      resolve("OK");
                    }
                  },
                  fail: function(res) {
                    reject(res);
                  },
                });
              } else {
                // 未授权, 静默登录
                const data = await loginApi.login({ code: code });
                if (data.code === "OK") {
                  session.setSessionId(data.data.JSESSIONID);
                  console.log("登录成功");
                  resolve("OK");
                }
              }
            },
          });
        },
      });
    });
  },
  onHide: function() {
    clearInterval(this.globalData.isUserToNotify);
    clearInterval(this.globalData.isVisitsToNotify);
  },
  globalData: {
    share: false, // 分享默认为false
    height: 0,
    statusBarHeight: 0,
    titleBarHeight: 0,
    marginTopHeight: 0,
    isIpx: false,
    navTitleText: "",
    sysWidth: wx.getSystemInfoSync().windowWidth,
    sysHeight: wx.getSystemInfoSync().windowHeight,
    isUserToNotify: false,
    isVisitsToNotify: false,
  },
  chooseImg: function(cb) {
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: function(res) {
        request.uploadFile(res.tempFilePaths[0]).then((res) => {
          const data = JSON.parse(res.data).data;
          cb(data);
          return data;
        });
      },
      fail: function(res) {},
      complete: function(res) {},
    });
  },
  previewImg: function(current, urls) {
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: urls, // 需要预览的图片http链接列表
    });
  },
});
