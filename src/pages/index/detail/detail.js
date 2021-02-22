// pages/index/detail/detail.js
const utils = require("../../../utils/utils");
const dialog = require("../../../utils/dialog");
const applyApi = require("../../../api/applyApi");
const memberApi = require("../../../api/memberApi");
const activitysApi = require("../../../api/activitysApi");
const loginApi = require("../../../api/loginApi");
const session = require("../../../utils/session");

const { ResultCode } = require("../../../utils/resultCode");
Page({
  data: {
    // dataList: [
    //   { title: "参加", backgroundcolor: "hsla(119, 74%, 39%, 1)" },
    //   { title: "待定", backgroundcolor: "hsla(212, 72%, 59%, 1)" },
    //   { title: "缺席", backgroundcolor: "hsla(359, 77%, 43%, 1)" },
    // ],

    userInfo: {},
    applyDetail: {},
    activitysDetail: {},
    id: "",
    text: "",
    status: "",
    describeText: "",
    isReveal: false,
    showModals: false,
    isAuthorize: false,
    showList: [
      { title: "报名接龙啦" },
      { title: "有人报名吗" },
      { title: "本人待定", line: "不影响报名状态" },
      { title: "本人缺席", line: "不影响报名状态" },
    ],
    tmplIds: [
      "BTb3WJAhjwQTnJP0-Wby2yzDWG0BUU52OFQVTIUV-Lc",
      "wywu-tuIvFB19bAn_eaUWGI_peWBauKNYLtI6JYaI10",
      "FR783dBjl2IWV7TnvQOWa0avbZlvxepsNbiPdIcWltQ",
    ],
  },
  // 是否报名
  // showChoise: function(e) {
  //   const that = this;
  //   wx.showActionSheet({
  //     itemList: ["参加", "待定", "缺席", "代朋友报名"],
  //     itemColor: "#000000",
  //     success: function(res) {
  //       console.log(res.tapIndex);
  //       if (res.tapIndex === 0) {
  //         that.applyJoin();
  //       } else if (res.tapIndex === 1) {
  //         that.applyUndetermined();
  //       } else if (res.tapIndex === 2) {
  //         that.applyAbsence();
  //       } else if (res.tapIndex === 3) {
  //         wx.navigateTo({
  //           url: `/pages/me/signup/signup?id=${that.data.activityId}`,
  //         });
  //       }
  //     },
  //   });
  // },

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
   * 是否报名
   */
  showChoise: function() {
    const that = this;
    if (
      this.data.activitysDetail.activity.status !== "expired" &&
      this.data.activitysDetail.activity.status !== "canceled"
    ) {
      wx.showActionSheet({
        itemList: ["参加", "待定", "缺席", "代朋友报名"],
        itemColor: "#000000",
        success: function(res) {
          console.log(res.tapIndex);
          if (res.tapIndex === 0) {
            that.applyJoin();
          } else if (res.tapIndex === 1) {
            that.applyUndetermined();
          } else if (res.tapIndex === 2) {
            that.applyAbsence();
          } else if (res.tapIndex === 3) {
            wx.navigateTo({
              url: `/pages/me/signup/signup?id=${that.data.activityId}`,
            });
          }
        },
      });
    } else {
      // 兼容处理
      if (this.data.activitysDetail.activity.status === "expired") {
        wx.showModal({
          title: "提示",
          content: "活动已结束,不允许参加活动",
        });
      } else if (this.data.activitysDetail.activity.status === "canceled") {
        wx.showModal({
          title: "提示",
          content: "活动已取消,不允许参加活动",
        });
      }
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

  // 参加活动
  applyJoin: async function() {
    const params = {
      statusEnum: "join",
      activityId: this.data.activityId,
    };
    dialog.showLoading("加载中");
    const data = await applyApi.apply(params);
    if (data.code === "OK") {
      dialog.showToast("报名成功");
      this.getApplyDetail(params.activityId);
      this.sendMsgSubscribe();
    }
  },
  // 缺席活动
  applyAbsence: async function() {
    const params = {
      statusEnum: "absence",
      activityId: this.data.activityId,
    };
    dialog.showLoading("加载中");
    const data = await applyApi.apply(params);
    if (data.code === "OK") {
      dialog.showToast("缺席成功");
      this.getApplyDetail(params.activityId);
      this.sendMsgSubscribe();
    }
  },
  // 待定活动
  applyUndetermined: async function() {
    const params = {
      statusEnum: "undetermined",
      activityId: this.data.activityId,
    };
    dialog.showLoading("加载中");
    const data = await applyApi.apply(params);
    if (data.code === "OK") {
      dialog.showToast("待定成功");
      this.getApplyDetail(params.activityId);
      this.sendMsgSubscribe();
    }
  },
  /**
   * 获取活动报名名单列表
   */
  getApplyDetail: async function() {
    const params = {
      activityId: this.data.activityId,
    };
    const res = await applyApi.detail(params);
    if (res.code === ResultCode.success) {
      const applyDetail = res.data;
      applyDetail.joinList.map((el) => {
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "MM月DD日 hh:ii");
        return el;
      });
      applyDetail.undeterminedList.map((el) => {
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "MM月DD日 hh:ii");
        return el;
      });
      applyDetail.absentList.map((el) => {
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "MM月DD日 hh:ii");
        return el;
      });
      applyDetail.insteadList.map((el) => {
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "MM月DD日 hh:ii");
        return el;
      });
      this.setData({
        applyDetail,
      });
    }
  },
  /**
   * 获取活动详情
   */
  getActivitysDetail: async function(id) {
    const res = await activitysApi.detail(id);
    if (res.code === ResultCode.success) {
      const activitysDetail = res.data;
      if (activitysDetail.activity.status === "expired") {
        this.data.isReveal = true;
        this.data.text = "活动结束";
      }
      if (activitysDetail.activity.status === "canceled") {
        this.data.isReveal = true;
        this.data.text = "活动取消";
      }
      if (activitysDetail.activity.status === "notstarted") {
        this.data.isReveal = false;
        this.data.text = "";
      }
      this.setData({
        activitysDetail,
        gmtModified: utils.formatDate(new Date(activitysDetail.activity.gmtCreate), "YYYY年MM月DD日 hh:ii"),
        text: this.data.text,
        isReveal: this.data.isReveal,
        describeText: this.data.describeText,
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
   * 显示水印
   */
  reveal: function() {
    const that = this;
    that.setData({
      isReveal: true,
    });
  },
  /**
   * 隐藏水印
   */
  hideReveal: function() {
    const that = this;
    that.setData({
      isReveal: false,
    });
  },

  /**
   * 分享活动弹窗
   */
  showDialogBtn: function(e) {
    const userInfo = this.data.userInfo;
    this.data.activitysDetail.memberList.map((el) => {
      if (userInfo.id === el.memberId && el.status !== "instead") {
        this.data.status = el.status;
      }
      return el;
    });
    const that = this;
    that.setData({
      showModals: true,
      id: this.data.id,
      memberStatus: this.data.status,
    });
  },
  /**
   * 分享活动
   */
  onShareAppMessage: function(res) {
    const userInfo = this.data.userInfo;
    const status = this.data.activitysDetail.activity.status;
    const memberStatus = this.data.status;
    if (res.from === "button") {
      // 来自页面内转发按钮
      console.log(res.target.dataset.title, this.data.showModals);
      if (status !== "notstarted") {
        this.data.describeText = "邀请您参加活动,点击查看活动详情";
      }
      if (memberStatus === "join") {
        this.data.describeText = "参加该活动,点击查看活动详情";
        this.data.isReveal = true;
      }
      if (memberStatus === "undetermined") {
        this.data.describeText = "待定该活动,点击查看活动详情";
        this.data.isReveal = true;
      }
      if (memberStatus === "absence") {
        this.data.isReveal = true;
        this.data.describeText = "缺席该活动,点击查看活动详情";
      }
      this.hideModal();
      this.setData({
        text: res.target.dataset.title,
        isReveal: this.data.isReveal,
        describeText: this.data.describeText,
      });
    }

    return {
      title: "@所有人  " + '"' + userInfo.nickname + '"' + this.data.describeText,
      path: `/pages/me/myactivity/detail/detail?id=${this.data.activityId}`,
      imageUrl: "",
      success: function(shareTickets) {
        console.info(shareTickets + "成功");
        // 转发成功
      },
      fail: function(res) {
        console.log(res + "失败");
        // 转发失败
      },
      complete: function(res) {
        // 不管成功失败都会执行
      },
    };
  },

  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function() {},

  /**
   * 隐藏模态对话框
   */
  hideModal: function() {
    const that = this;
    that.setData({
      showModals: false,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    this.getSetting();
    this.setData({
      activityId: options.id,
    });
    this.getApplyDetail(options.id);
    this.getActivitysDetail(options.id);
    this.getUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function() {
    if (this.data.activitysDetail.activity && this.data.activitysDetail.activity.status === "notstarted") {
      this.hideReveal();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: async function() {},
});
