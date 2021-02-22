/* eslint-disable no-undef */
// src/pages/index/index.js
const app = getApp();
const utils = require("../../../../utils/utils");
const dialog = require("../../../../utils/dialog");

const activitysApi = require("../../../../api/activitysApi");
const memberApi = require("../../../../api/memberApi");
const applyApi = require("../../../../api/applyApi");
const loginApi = require("../../../../api/loginApi");
const session = require("../../../../utils/session");
const { ResultCode } = require("../../../../utils/resultCode");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    userInfo: {},
    id: "",
    text: "",
    status: "",
    describeText: "",
    isReveal: false,
    showModals: false,
    checked: false,
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
    switchConf: {
      width: 76,
      height: 36,
      color: "#07C160",
      checked: false,
      disabled: false,
      noRadius: false,
    },
  },

  _doSwitch: function(e) {
    const checked = e.detail.checked;
    this.setData({
      checked: checked,
    });
    console.log(e.detail.checked);
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
    if (this.data.detail.activity.status !== "expired" && this.data.detail.activity.status !== "canceled") {
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
              url: `/pages/me/signup/signup?id=${that.data.id}`,
            });
          }
        },
      });
    } else {
      // 兼容处理
      if (this.data.detail.activity.status === "expired") {
        // wx.showModal({
        //   title: "提示",
        //   content: "活动已结束,不允许参加活动",
        // });
        dialog.showToast("当前活动已结束,不允许参加此活动");
      } else if (this.data.detail.activity.status === "canceled") {
        // wx.showModal({
        //   title: "提示",
        //   content: "活动已取消,不允许参加活动",
        // });
        dialog.showToast("当前活动已取消,不允许参加此活动");
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
  /**
   * 参加活动
   */
  applyJoin: async function() {
    const params = {
      statusEnum: "join",
      activityId: this.data.id,
    };
    dialog.showLoading("加载中");
    const data = await applyApi.apply(params);
    if (data.code === "OK") {
      dialog.showToast("报名成功");
      this.sendMsgSubscribe();
      this.getDetail(params.activityId);
    }
  },
  /**
   * 缺席活动
   */
  applyAbsence: async function() {
    const params = {
      statusEnum: "absence",
      activityId: this.data.id,
    };
    dialog.showLoading("加载中");
    const data = await applyApi.apply(params);
    if (data.code === "OK") {
      dialog.showToast("缺席成功");
      this.sendMsgSubscribe();
      this.getDetail(params.activityId);
    }
  },
  /**
   * 待定活动
   */
  applyUndetermined: async function() {
    const params = {
      statusEnum: "undetermined",
      activityId: this.data.id,
    };
    dialog.showLoading("加载中");
    const data = await applyApi.apply(params);
    if (data.code === "OK") {
      dialog.showToast("待定成功");
      this.sendMsgSubscribe();
      this.getDetail(params.activityId);
    }
  },
  /**
   * 取消活动
   */
  showCancel: async function() {
    const that = this;
    const id = this.data.id;
    const params = {
      isInformedEnabled: that.data.checked,
    };
    wx.showModal({
      cancelText: "我再想想",
      confirmText: "取消活动",
      content: "取消后用户将不能报名参加活动是否确定取消？",
      success: async function(res) {
        if (res.confirm) {
          const data = await activitysApi.cancel(id, params);
          if (data.code === ResultCode.success) {
            dialog.showToast("活动已取消");
            that.getDetail(id);
          }
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },
  /**
   * 继续活动
   */
  showRestart: async function() {
    const that = this;
    const id = this.data.id;
    const params = {
      isInformedEnabled: that.data.checked,
    };
    wx.showModal({
      cancelText: "我再想想",
      confirmText: "继续活动",
      content: "确定继续活动后,用户可以继续报名参加活动",
      success: async function(res) {
        if (res.confirm) {
          const data = await activitysApi.restart(id, params);
          if (data.code === ResultCode.success) {
            dialog.showToast("活动已继续");
            that.getDetail(id);
          }
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },
  /**
   * 删除活动
   */
  showDelete: async function() {
    const that = this;
    const id = this.data.id;
    const params = {
      isInformedEnabled: that.data.checked,
    };
    wx.showModal({
      confirmColor: "#FF0000",
      cancelText: "我再想想",
      confirmText: "删除活动",
      content: "删除后活动数据将不能恢复是否确定删除？",
      success: async function(res) {
        if (res.confirm) {
          const data = await activitysApi.delete(id, params);
          if (data.code === ResultCode.success) {
            dialog.showToast("活动已删除");
            const pages = getCurrentPages();
            const beforePage = pages[pages.length - 2];
            beforePage.onLoad(beforePage.options);
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              });
            }, 1200);
          }
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },
  // showcancel: function() {
  //   wx.showModal({
  //     content: "取消后用户将不能报名参加活动是否确定取消？",
  //     cancelText: "我再想想",
  //     confirmText: "取消活动",
  //   });
  // },
  // showdelete: function() {
  //   wx.showModal({
  //     content: "删除后活动数据将不能恢复是否确定删除？",
  //     cancelText: "我再想想",
  //     confirmText: "删除活动",
  //     confirmColor: "#FF0000",
  //   });
  // },

  /**
   * 获取活动详情
   */
  getDetail: async function(id) {
    const res = await activitysApi.detail(id);
    if (res.code === ResultCode.success) {
      const detail = res.data;
      if (detail.activity.status === "expired") {
        this.data.isReveal = true;
        this.data.text = "活动结束";
      }
      if (detail.activity.status === "canceled") {
        this.data.isReveal = true;
        this.data.text = "活动取消";
      }
      if (detail.activity.status === "notstarted") {
        this.data.isReveal = false;
        this.data.text = "";
      }
      detail.memberList.map((el) => {
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "MM月DD日 hh:ii");
        return el;
      });
      this.setData({
        detail,
        finishTime: utils.formatDate(new Date(detail.activity.finishTime), "hh:ii"),
        gmtCreate: utils.formatDate(new Date(detail.activity.gmtCreate), "YYYY年MM月DD日 hh:ii"),
        date: utils.formatDate(new Date(detail.activity.startTime), "MM月DD日 周W hh:ii"),
        text: this.data.text,
        isReveal: this.data.isReveal,
        describeText: this.data.describeText,
      });
    }
  },

  /**
   * 跳转报名名单页面
   */
  showDetail: function() {
    wx.navigateTo({
      url: `/pages/index/detail/detail?id=${this.data.id}`,
    });
  },

  /**
   * 编辑活动
   */
  showEdit: function() {
    if (this.data.detail.activity.status === "inprogress") {
      wx.showModal({
        title: "提示",
        content: "此活动正在进行中,暂不允许编辑",
      });
    } else {
      wx.navigateTo({
        url: `/pages/post/edit/edit?id=${this.data.id}&isInformedEnabled=${this.data.checked}`,
      });
    }
  },

  /**
   * 更多操作
   */
  switchChange: function(e) {
    const value = e.detail.value;
    this.setData({
      checked: value,
    });
    console.log(value);
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
   * 导航去目的地
   */
  openLocation: function() {
    wx.openLocation({
      name: this.data.detail.activity.addressDistrictName,
      address: this.data.detail.activity.addressDetail,
      latitude: this.data.detail.activity.lat,
      longitude: this.data.detail.activity.lng,
      scale: 14,
    });
  },

  /**
   * 腾讯位置服务路线规划(备选)
   */
  routePlan(e) {
    const that = this;
    this.setData({
      latitude: e.currentTarget.dataset.lat,
      longitude: e.currentTarget.dataset.lng,
      name: e.currentTarget.dataset.addressdetail,
    });
    // 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限
    wx.getSetting({
      success(res) {
        // console.log(res)
        // scope.userLocation 就是地理授权的标志：
        // res.authSetting['scope.userLocation'] == undefined 表示初始进入该页面
        // res.authSetting['scope.userLocation'] == false 表示非初始化进入该页面 且未授权
        // res.authSetting['scope.userLocation'] == true 表示地理位置授权
        if (res.authSetting["scope.userLocation"] !== undefined && res.authSetting["scope.userLocation"] !== true) {
          // 表示非初始化进入该页面 且未授权：
          wx.showModal({
            title: "请求授权当前位置",
            content: "需要获取您的地理位置，请确认授权",
            showCancel: true,
            cancelText: "取消",
            cancelColor: "#000000",
            confirmText: "确定",
            confirmColor: "#3CC51F",
            success: (result) => {
              if (res.cancel) {
                wx.showToast({
                  title: "拒绝授权",
                  icon: "none",
                  duration: 1000,
                });
              } else if (result.confirm) {
                // 调起客户端小程序设置界面，返回用户设置的操作结果。
                // 设置界面只会出现小程序已经向用户请求过的权限
                wx.openSetting({
                  success: (dataAu) => {
                    if (dataAu.authSetting["scope.userLocation"] === true) {
                      wx.showToast({
                        title: "授权成功",
                        icon: "success",
                        duration: 1000,
                      });
                      // 再次授权之后，调用腾讯位置服务的路线规划插件API
                      that.callRoutePlanPlugin();
                    } else {
                      wx.showToast({
                        title: "授权失败",
                        icon: "none",
                        duration: 1000,
                      });
                    }
                  },
                });
              }
            },
          });
        } else if (res.authSetting["scope.userLocation"] === undefined) {
          // 调用腾讯位置服务的路线规划插件API
          that.callRoutePlanPlugin();
        } else {
          // 调用腾讯位置服务的路线规划插件API
          that.callRoutePlanPlugin();
        }
      },
    });
  },
  //
  callRoutePlanPlugin() {
    // eslint-disable-next-line no-undef
    const plugin = requirePlugin("routePlan"); // 路线规划插件
    const key = "7HUBZ-4YNCF-OA4JE-J2UI4-X3PYK-PZFQ4"; // 使用在腾讯位置服务申请的key
    const referer = "报名了么-小程序端"; // 调用插件的app的名称
    const latitude = this.data.detail.activity.lat;
    const longitude = this.data.detail.activity.lng;
    const name = this.data.detail.activity.addressDetail;
    if (latitude !== "" && longitude !== "") {
      const endPoint = JSON.stringify({
        // 终点
        name: name,
        latitude: latitude,
        longitude: longitude,
      });
      wx.navigateTo({
        url: "plugin://routePlan/index?key=" + key + "&referer=" + referer + "&endPoint= " + endPoint,
      });
    } else {
      console.log("请先选择地点");
    }
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
   * 跳转发起活动页面
   */
  toPost: function() {
    wx.switchTab({
      url: "/pages/post/post",
    });
  },

  /**
   * 分享活动弹窗
   */
  showDialogBtn: function(e) {
    const userInfo = this.data.userInfo;
    this.data.detail.memberList.map((el) => {
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
    const status = this.data.detail.activity.status;
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
      path: `/pages/me/myactivity/detail/detail?id=${this.data.id}`,
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
    await app.verifyLogin();
    this.getSetting();
    this.setData({
      id: options.id,
    });
    this.getDetail(options.id);
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
    if (this.data.detail.activity && this.data.detail.activity.status === "notstarted") {
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
