// src/pages/me/D_signup/signup.js
const applyApi = require("../../../api/applyApi");
const memberApi = require("../../../api/memberApi");
const dialog = require("../../../utils/dialog");
const utils = require("../../../utils/utils");
const { ResultCode } = require("../../../utils/resultCode");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    count: "0",
    lists: [""],
    detail: {},
    userInfo: {},
    tmplIds: [
      "BTb3WJAhjwQTnJP0-Wby2yzDWG0BUU52OFQVTIUV-Lc",
      "wywu-tuIvFB19bAn_eaUWGI_peWBauKNYLtI6JYaI10",
      "FR783dBjl2IWV7TnvQOWa0avbZlvxepsNbiPdIcWltQ",
    ],
  },

  onSubmit: async function() {
    const params = {
      activityId: this.data.id,
      nicknames: this.data.lists,
    };
    dialog.showLoading("加载中");
    const data = await applyApi.replace(params);
    if (data.code === "OK") {
      dialog.showToast("代报名成功");
      const pages = getCurrentPages();
      const beforePage = pages[pages.length - 2];
      beforePage.onLoad(beforePage.options);
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        });
      }, 1400);
      this.sendMsgSubscribe();
    }
  },

  /**
   * 订阅消息
   */
  sendMsgSubscribe() {
    const that = this;
    const tmplIds = that.data.tmplIds;
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        console.log(res.subscriptionsSetting);
        const mainSwitch = res.subscriptionsSetting.mainSwitch;
        const itemSettings = res.subscriptionsSetting.itemSettings;
        if (mainSwitch && (!itemSettings || (itemSettings && !itemSettings[tmplIds]))) {
          // 显示或隐藏订阅按钮等逻辑操作
          that.message();
        } else if (!mainSwitch) {
          that.openConfirm("检测到您没打开推送权限，是否去设置打开？");
        }
      },
    });
  },
  message: function() {
    const that = this;
    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: that.data.tmplIds,
        success(res) {
          const resStr = JSON.stringify(res);
          if (resStr.indexOf("accept") === -1) {
            // 结果不含accept 即都不同意 提示失败
            wx.showToast({
              title: "订阅失败",
            });
          }
        },
        fail(err) {
          console.log(err);
        },
      });
    } else {
      // 兼容处理
      wx.showModal({
        title: "提示",
        content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。",
      });
    }
  },

  // 监听实时输入
  onChangeText: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const _this = this;
    if (field !== "lists") {
      _this.setData({
        [field]: value,
      });
    } else {
      const ind = e.currentTarget.dataset.ind;
      const el = e.currentTarget.dataset.el;
      field === "lists" ? (_this.data[field][ind] = value) : (_this.data[field][ind][el] = value);
      _this.setData({
        [field]: _this.data[field],
      });
    }
  },
  // 添加
  addList: function(e) {
    const el = e.currentTarget.dataset.el;
    const _this = this;
    if (el === "lists") {
      _this.data[el].push(this.data.userInfo.nickname + "的朋友");
    }
    this.data.count++;
    _this.setData({
      [el]: _this.data[el],
      count: this.data.count,
    });
    console.log(this.data.count);
  },

  // 删除
  delList: function(e) {
    const el = e.currentTarget.dataset.el;
    const ind = e.currentTarget.dataset.ind;
    const that = this;
    wx.showModal({
      confirmColor: "#FF0000",
      cancelText: "取消",
      confirmText: "确定",
      content: "确定要删除吗？",
      success: async function(res) {
        if (res.confirm) {
          // const count = that.data.count;
          // if (count > 0 || "") {
          that.data.count--;
          that.data[el].splice(ind, 1);
          that.setData({
            [el]: that.data[el],
            count: that.data.count,
          });
          console.log(that.data.count);
          // }
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },

  getDetail: async function() {
    const params = {
      activityId: this.data.id,
    };
    const res = await applyApi.replacedDetail(params);
    if (res.code === ResultCode.success) {
      const detail = res.data;
      this.setData({
        detail,
        lists: detail.insteadLists,
        count: detail.count,
      });
    }
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
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    this.setData({
      id: options.id,
    });
    this.getDetail();
    this.getUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
});
