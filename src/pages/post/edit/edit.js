// eslint-disable-next-line no-undef
const chooseLocation = requirePlugin("chooseLocation");
const app = getApp();
const dialog = require("../../../utils/dialog");
const utils = require("../../../utils/utils");
const activitysApi = require("../../../api/activitysApi");

const { ResultCode } = require("../../../utils/resultCode");
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
    detail: {},
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    totalCount: "",
    checked: "",
    remindBeforeTime: "",
    // timeUnit: "",
    activityId: "",

    map: {
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    }, // 地图选点返回地址
    // items: [{ value: "1", name: "分钟", checked: true }, { value: "60", name: "小时" }],
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
  // bindStartTimeChange: function(e) {
  //   const value = e.detail.value;
  //   this.setData({
  //     startTime: value,
  //   });
  //   console.log(value);
  // },

  // bindEndTimeChange: function(e) {
  //   const value = e.detail.value;
  //   this.setData({
  //     endTime: value,
  //   });
  //   console.log(value);
  // },

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

  onSubmit: async function() {
    const id = this.data.activityId;
    const { title, date, startTime, endTime, totalCount, description } = this.data;
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
      isInformedEnabled: this.data.isInformedEnabled,
      title: this.data.title,
      description: this.data.description,
      totalCount: this.data.totalCount,
      isRemainEnabled: this.data.checked,
      remindBeforeTime: this.data.remindBeforeTime ? this.data.remindBeforeTime : "",
      startTime: Date.parse(`${date} ${startTime}`.replace(/-/g, "/")),
      finishTime: Date.parse(`${date} ${endTime}`.replace(/-/g, "/")),
      addressDistrictName: this.data.map && this.data.map.name ? this.data.map.name : this.data.name,
      addressDetail: this.data.map && this.data.map.address ? this.data.map.address : this.data.address,
      lat: this.data.map && this.data.map.latitude ? this.data.map.latitude : this.data.lat,
      lng: this.data.map && this.data.map.longitude ? this.data.map.longitude : this.data.lng,
    };
    dialog.showLoading("加载中");
    const data = await activitysApi.update(id, params);
    if (data.code === "OK") {
      dialog.showToast("编辑成功");
      const pages = getCurrentPages();
      const beforePage = pages[pages.length - 2];
      beforePage.onLoad(beforePage.options);
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        });
      }, 1200);
    }
  },

  getDetail: async function(id) {
    const res = await activitysApi.detail(id);
    if (res.code === ResultCode.success) {
      const detail = res.data;
      this.setData({
        detail,
        endTime: utils.formatDate(new Date(detail.activity.finishTime), "hh:ii"),
        startTime: utils.formatDate(new Date(detail.activity.startTime), "hh:ii"),
        date: utils.formatDate(new Date(detail.activity.startTime), "YYYY-MM-DD"),
        title: detail.activity.title,
        totalCount: detail.activity.totalCount,
        description: detail.activity.description,
        checked: detail.activity.isRemindEnabled,
        switchChecked: detail.activity.isRemindEnabled,
        remindBeforeTime: detail.activity.remindBeforeTime,
        name: detail.activity.addressDistrictName,
        address: detail.activity.addressDetail,
        lat: detail.activity.lat,
        lng: detail.activity.lng,
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    await app.verifyLogin();
    this.setData({
      activityId: options.id,
      isInformedEnabled: options.isInformedEnabled,
    });
    this.getDetail(options.id);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  // 从地图选点插件返回后，在页面的onShow生命周期函数中能够调用插件接口，取得选点结果对象
  onShow() {
    const mapList = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    this.setData({
      map: mapList,
    });
    console.log(mapList);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，getLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },
});
