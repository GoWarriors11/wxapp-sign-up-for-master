// eslint-disable-next-line no-undef
const chooseLocation = requirePlugin("chooseLocation");
const app = getApp();
const dialog = require("../../utils/dialog");
const utils = require("../../utils/utils");
const activitysApi = require("../../api/activitysApi");
const loginApi = require("../../api/loginApi");
const session = require("../../utils/session");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    maxNumber: 200, // 可输入最大字数
    number: 0, // 已输入字数
    // date: "2020-11-11",
    // time: "9:00",
    // region: ["广东省", "广州市", "海珠区"],

    // date: utils.formatDate(new Date(new Date().getTime()), "YYYY-MM-DD"),
    // startTime: utils.formatDate(new Date(new Date().getTime()), "HH:II"),
    // endTime: utils.formatDate(new Date(new Date().getTime()), "HH:II"),
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    totalCount: "",
    checked: false,
    remindBeforeTime: "",
    // timeUnit: "",
    isAuthorize: false,

    map: {
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    }, // 地图选点返回地址
    // items: [{ value: "1", name: "分钟", checked: "true" }, { value: "60", name: "小时" }],
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

  inputText: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value; // 获取textarea的内容，
    const len = value.length; // 获取textarea的内容长度
    this.setData({
      number: len,
      [field]: value,
    });
  },

  onChangeText: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [field]: value,
    });
  },

  showtip: function() {
    wx.showModal({
      title: "",
      content: "开启后，参与人可以在报名页面订阅提醒通知",
      showCancel: false,
      confirmText: "确定",
      confirmColor: "#3CC51F",
    });
  },
  bindDateChange: function(e) {
    const value = e.detail.value;
    this.setData({
      date: value,
    });
    console.log(value);
  },
  bindStartTimeChange: function(e) {
    const value = e.detail.value;
    // 判断用户有无选择日期,没有则获取当前日期
    if (!this.data.date) {
      const aa = new Date();
      const bb = aa.toLocaleDateString(); // 获取当前日期
      const cc = Date.parse(`${bb} ${value}`.replace(/-/g, "/")) + 60 * 60 * 1000; // 默认结束时间比开始时间晚一小时
      const time = utils.formatDate(new Date(cc), "HH:II");
      // 判断用户有无选择结束时间, 或者结束时间小于开始时间,则为用户填充结束时间
      if (!this.data.endTime || this.data.endTime <= value) {
        this.setData({
          startTime: value,
          endTime: time,
        });
      } else {
        // 否则只填充开始时间
        this.setData({
          startTime: value,
        });
      }
    } else {
      // 用户有选择日期,则直接获取用户选择日期与时间,结束时间比开始时间晚一小时
      const aa = Date.parse(`${this.data.date} ${value}`.replace(/-/g, "/")) + 60 * 60 * 1000;
      const time = utils.formatDate(new Date(aa), "HH:II");
      // 判断用户有无选择结束时间, 或者结束时间小于开始时间,则为用户填充结束时间
      if (!this.data.endTime || this.data.endTime <= value) {
        this.setData({
          startTime: value,
          endTime: time,
        });
      } else {
        // 否则只填充开始时间
        this.setData({
          startTime: value,
        });
      }
    }
    console.log(value);
  },

  bindEndTimeChange: function(e) {
    const value = e.detail.value;
    if (value <= this.data.startTime) {
      dialog.showToast("结束时间不能小于或者等于开始时间");
    } else {
      this.setData({
        endTime: value,
      });
    }
    console.log(value);
  },

  bindRegionChange: function(e) {
    const value = e.detail.value;
    this.setData({
      region: value,
    });
    console.log(value);
  },
  switchChange: function(e) {
    const value = e.detail.value;
    this.setData({
      checked: value,
    });
    console.log(value);
  },

  // radioChange: async function(e) {
  //   console.log("radio发生change事件，携带value值为：", e.detail.value);
  //   this.setData({
  //     timeUnit: e.detail.value,
  //   });
  // },

  // 地图选点
  bindClickAdress() {
    const key = "7HUBZ-4YNCF-OA4JE-J2UI4-X3PYK-PZFQ4"; // 使用在腾讯位置服务申请的key
    const referer = "报名了么-小程序端"; // 调用插件的app的名称
    const category = "生活服务,娱乐休闲";
    wx.getLocation({
      type: "wgs84",
      success(res) {
        // console.log("地址---", res);
        const location = JSON.stringify({
          latitude: res.latitude,
          longitude: res.longitude,
        });
        wx.navigateTo({
          url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&location=${location}&category=${category}`,
        });
      },
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function() {},

  // 从地图选点插件返回后，在页面的onShow生命周期函数中能够调用插件接口，取得选点结果对象
  onShow: async function() {
    await app.verifyLogin();
    this.getSetting();
    const mapList = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    this.setData({
      map: mapList,
    });
    console.log(mapList);
  },
  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，getLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },

  onSubmit: async function() {
    const { title, date, startTime, endTime, map, totalCount, description } = this.data;
    if (title === "") {
      dialog.showToast("请输入主题");
      return;
    } else if (date === "") {
      dialog.showToast("请选择日期");
      return;
    } else if (startTime === "") {
      dialog.showToast("请选择开始时间");
      return;
    } else if (endTime === "") {
      dialog.showToast("请选择结束时间");
      return;
    } else if (endTime <= startTime) {
      dialog.showToast("结束时间不能小于或者等于开始时间");
      return;
    } else if (new Date().getTime() > Date.parse(`${date} ${startTime}`.replace(/-/g, "/"))) {
      dialog.showToast("活动开始时间不能晚于当前时间");
      return;
    } else if (description === "") {
      dialog.showToast("请输入活动说明");
      return;
    } else if (map === null) {
      dialog.showToast("请选择地址");
      return;
    } else if (totalCount === "") {
      dialog.showToast("请输入报名人数");
      return;
    } else if (totalCount > 50 || totalCount < 3) {
      dialog.showToast("报名人数不能超出限制");
      return;
    } else if (
      (this.data.checked && this.data.remindBeforeTime === null) ||
      (this.data.checked && this.data.remindBeforeTime === "")
    ) {
      dialog.showToast("请输入提醒时间,或者关闭活动提醒按钮");
      return;
    }
    const params = {
      title: this.data.title,
      startTime: Date.parse(`${date} ${startTime}`.replace(/-/g, "/")),
      finishTime: Date.parse(`${date} ${endTime}`.replace(/-/g, "/")),
      description: this.data.description,
      addressDistrictName: this.data.map.name,
      addressDetail: this.data.map.address,
      totalCount: this.data.totalCount,
      isRemainEnabled: this.data.checked,
      remindBeforeTime: this.data.remindBeforeTime ? this.data.remindBeforeTime : "",
      // remindBeforeTime: this.data.remindBeforeTime * this.data.timeUnit,
      lat: this.data.map.latitude,
      lng: this.data.map.longitude,
    };
    dialog.showLoading("加载中");
    const data = await activitysApi.create(params);
    if (data.code === "OK") {
      dialog.showToast("发起成功");
      // wx.switchTab({
      //   url: `/pages/index/index`,
      // });
      const id = data.data.id;
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/me/myactivity/detail/detail?id=${id}`,
        });
      }, 1000);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},
});
