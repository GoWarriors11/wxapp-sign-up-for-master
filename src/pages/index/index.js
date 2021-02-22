// src/pages/index/index.js
const app = getApp();

// utils
const utils = require("../../utils/utils");
const dialog = require("../../utils/dialog");

// api
const activitysApi = require("../../api/activitysApi");
const applyApi = require("../../api/applyApi");
const memberApi = require("../../api/memberApi");
const loginApi = require("../../api/loginApi");
const session = require("../../utils/session");
const { ResultCode } = require("../../utils/resultCode");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showModals: false,
    /**
     * 列表参数
     * @list 列表数据
     * @isNull 列表数据是否为空
     * @lastPage 列表数据是否加载到最后一页
     * @listContentParam 列表分页参数
     */
    list: [],
    isNull: false,
    lastPage: false,
    listContentParam: {
      pageNum: 0,
      pageSize: 15,
    },
    userInfo: {},
    id: "",
    isReveal: false,
    isAuthorize: false,
    text: "",
    describeText: "",
    status: "",
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
    timeDay: "",
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
  showChoise: function(e) {
    const that = this;
    this.setData({
      id: e.currentTarget.dataset.id,
    });
    if (e.currentTarget.dataset.status !== "expired" && e.currentTarget.dataset.status !== "canceled") {
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
      if (e.currentTarget.dataset.status === "expired") {
        wx.showModal({
          title: "提示",
          content: "活动已结束,不允许参加活动",
        });
      } else if (e.currentTarget.dataset.status === "canceled") {
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
      withSubscriptions: true, // 是否同时获取用户订阅消息的订阅状态
      success(res) {
        // for (const key of tmplIds) {
        //   if (itemSettings[key] !== "accept") {
        //     that.message();
        //     return;
        //   }
        // }

        // 订阅消息,有空研究
        // const mainSwitch = res.subscriptionsSetting.mainSwitch; // 订阅消息总开关
        // const itemSettings = res.subscriptionsSetting.itemSettings; // 每一项开关（类型：对象）
        // const staring = JSON.stringify(res.subscriptionsSetting); // 转换成字符串
        // const n = staring.split("accept").length - 1; // 计算返回来accept的次数,
        // const s = staring.split("reject").length - 1; // 计算返回来reject的次数,
        // if (mainSwitch && itemSettings && n === 6) {
        //   // 总开关打开,且itemSettings不为空,而且accept等于总订阅消息的数量3条*2即表示都同意
        //   console.log("已默认同意推送订阅消息,不提示成功");
        // } else if ((mainSwitch && (!itemSettings || (itemSettings && !itemSettings[tmplIds]))) || s > 0) {
        //   // 总开关为开，且itemSettings为空或者对应模板id的值为空，则展示订阅消息引导卡片
        //   that.message();
        // } else if (!mainSwitch) {
        //   that.openConfirm("检测到您没打开推送权限，是否去设置打开？");
        // }

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
          //  else {
          //   wx.showToast({
          //     title: "订阅成功",
          //   });
          // }
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

  // 打开设置
  openConfirm(message) {
    wx.showModal({
      content: message,
      confirmText: "确认",
      cancelText: "取消",
      success: (res) => {
        // 点击“确认”时打开设置页面
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              console.log(res.authSetting);
            },
            fail: (error) => {
              console.log(error);
            },
          });
        } else {
          console.log("用户点击取消");
        }
      },
    });
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
      this.getNewestActivity();
      this.sendMsgSubscribe();
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
      this.getNewestActivity();
      this.sendMsgSubscribe();
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
      this.getNewestActivity();
      this.sendMsgSubscribe();
    }
  },
  /**
   * 跳转报名名单页面
   */
  showdetail: function(e) {
    this.setData({
      id: e.currentTarget.dataset.id,
    });
    wx.navigateTo({
      url: `/pages/index/detail/detail?id=${this.data.id}`,
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
   * 获取最新活动
   */
  getNewestActivity: async function(param = {}) {
    let pagination = this.data.listContentParam;
    pagination = Object.assign(pagination, param);
    const res = await activitysApi.getNewestActivity(pagination);
    if (res.code === ResultCode.success) {
      const data = res.data,
        rows = data.rows;
      let list = [];
      rows.map((el) => {
        el.activity.finishTime = utils.formatDate(new Date(el.activity.finishTime), "hh:ii");
        el.activity.gmtCreate = utils.formatDate(new Date(el.activity.gmtCreate), "YYYY年MM月DD日 hh:ii");
        el.activity.date = utils.formatDate(new Date(el.activity.startTime), "MM月DD日 周W hh:ii");
        const endTime = new Date(el.activity.startTime).getTime() / 1000 - parseInt(new Date().getTime() / 1000);
        el.activity.timeDay = parseInt(endTime / 60 / 60);
        if (el.activity.timeDay < 24) {
          el.activity.timeDay = parseInt(endTime / 60 / 60);
        } else {
          el.activity.timeDays = parseInt(endTime / 60 / 60 / 24);
        }
        el.activityApplicantList.map((els) => {
          els.gmtCreate = utils.formatDate(new Date(els.gmtCreate), "MM月DD日 hh:ii");
          return el;
        });
        if (el.activity.status === "expired") {
          this.data.isReveal = true;
          this.data.text = "活动结束";
        }
        if (el.activity.status === "canceled") {
          this.data.isReveal = true;
          this.data.text = "活动取消";
        }
        return el;
      });
      // 判断是否为第一页加载
      if (pagination.pageNum === 0) {
        list = rows;
        if (list.length === 0) {
          this.setData({
            isNull: true,
          });
        } else {
          this.setData({
            isNull: false,
          });
        }
      } else {
        list = this.data.list.concat(rows);
      }
      // 赋值
      this.setData({
        list,
        lastPage: data.pageInfo.isLast,
        listContentParam: pagination,
        text: this.data.text,
        isReveal: this.data.isReveal,
      });
    }
  },

  /**
   * 导航去目的地
   */
  openLocation: function(e) {
    wx.openLocation({
      name: e.currentTarget.dataset.addressdistrictname,
      address: e.currentTarget.dataset.addressdetail,
      latitude: e.currentTarget.dataset.lat,
      longitude: e.currentTarget.dataset.lng,
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
    const latitude = this.data.latitude;
    const longitude = this.data.longitude;
    const name = this.data.name;
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
   * 分享活动弹框
   */
  showDialogBtn: function(e) {
    const userInfo = this.data.userInfo;
    e.currentTarget.dataset.activityapplicantlist.map((el) => {
      if (userInfo.id === el.memberId && el.status !== "instead") {
        this.data.status = el.status;
      }
      return el;
    });
    const that = this;
    that.setData({
      showModals: true,
      id: e.currentTarget.dataset.id,
      status: this.data.status,
    });
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
   * 分享活动
   */
  onShareAppMessage: function(res) {
    const userInfo = this.data.userInfo;
    const status = this.data.status;
    if (res.from === "button") {
      // 来自页面内转发按钮
      if (status === "join") {
        this.data.isReveal = true;
        this.data.describeText = "参加该活动,点击查看活动详情";
      }
      if (status === "undetermined") {
        this.data.isReveal = true;
        this.data.describeText = "待定该活动,点击查看活动详情";
      }
      if (status === "absence") {
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
        console.log(res);
        // 不管成功失败都会执行
      },
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function() {
    await app.verifyLogin();
    this.getSetting();
    this.getUserInfo();
    this.getNewestActivity();
  },
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
    this.getUserInfo();
    this.getNewestActivity();
    this.hideReveal();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: async function() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const page = this;
    const lastPage = page.data.lastPage,
      listContentParam = page.data.listContentParam;
    if (!lastPage) {
      listContentParam.pageNum = listContentParam.pageNum + 1;
      page.getList(listContentParam);
    }
  },
});
