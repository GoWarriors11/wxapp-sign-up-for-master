const memberApi = require("../../../api/memberApi");
const loginApi = require("../../../api/loginApi");
const session = require("../../../utils/session");
const { ResultCode } = require("../../../utils/resultCode");
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    // hasUserInfo: false,
    // canIUse: wx.canIUse("button.open-type.getUserInfo"),
    // dataList: [{ item: "我发起的", Num: 3 }, { item: "我参与的", Num: 6 }, { item: "浏览过的", Num: 15 }],
    myCenter: [],
    isAuthorize: false,
  },

  /**
   * 点击请授权,让用户自动授权
   * 当用户还没有授权的时候,名称会显示授权登录
   */
  bindGetUserInfo: function(e) {
    const userInfo = e.detail.userInfo;
    if (userInfo) {
      userInfo.headImg = userInfo.avatarUrl;
      userInfo.nickname = userInfo.nickName;
      this.setData({ userInfo, isAuthorize: true });
      if (userInfo) {
        this.triggerEvent("getUserInfo", userInfo);
        // 微信登录
        wx.login({
          success: function(res) {
            const code = res.code;
            wx.getUserInfo({
              success: async function(res) {
                const params = {
                  code: code,
                  encryptedData: res.encryptedData,
                  iv: res.iv,
                };
                const data = await loginApi.login(params);
                session.setSessionId(data.data.JSESSIONID);
                console.log("登录成功");
              },
            });
          },
        });
      }
    }
  },

  /**
   * 查看用户是否授权
   */
  getSetting: function() {
    const _this = this;
    // 查看是否授权
    wx.getSetting({
      success(res) {
        console.log(res);
        if (res.authSetting["scope.userInfo"]) {
          _this.setData({
            isAuthorize: true,
          });
          _this.getUserInfo();
        } else {
          _this.setData({
            isAuthorize: false,
          });
        }
      },
    });
  },

  /**
   * 获取用户信息
   */
  getUserInfo: async function() {
    const res = await memberApi.getLoginUser();
    if (res.code === ResultCode.success) {
      this.setData({
        userInfo: res.data,
      });
    }
  },

  /**
   * 获取我的活动各项数据统计
   */
  getMyCenter: async function() {
    const res = await memberApi.myCenter();
    if (res.code === ResultCode.success) {
      console.log(res);
      this.setData({
        myCenter: res.data,
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function() {
    await app.verifyLogin();
    this.getSetting();
    this.getMyCenter();
    // const that = this;
    // if (app.globalData.userInfo) {
    //   that.setUserInfo(app.globalData.userInfo);
    // } else if (that.data.canIUse) {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = (res) => {
    //     that.setUserInfo(res.userInfo);
    //   };
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: (res) => {
    //       that.setUserInfo(res.userInfo);
    //     },
    //   });
    // }
  },

  // getUserInfo: function(e) {
  //   this.setUserInfo(e.detail.userInfo);
  // },

  // setUserInfo: function(userInfo) {
  //   if (userInfo !== null) {
  //     app.globalData.userInfo = userInfo;
  //     this.setData({
  //       userInfo: userInfo,
  //       hasUserInfo: true,
  //     });
  //   }
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function() {
    await app.verifyLogin();
    this.getSetting();
    this.getMyCenter();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
});
