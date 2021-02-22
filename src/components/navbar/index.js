// components/navbar/index.js
const app = getApp();
Component({
  properties: {
    navbarData: {
      // navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {},
    },
    navBgColor: {
      type: String,
      value: "#ffffff",
    },
    navTitleColor: {
      type: String,
      value: "#000",
    },
    isWhiteIcon: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    height: "",
    // 默认值  默认显示左上角
    navbarData: {
      showCapsule: 1,
    },
  },
  attached: function() {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share,
    });
    // 定义导航栏的高度   方便对齐
    this.setData({
      height: app.globalData.height,
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight,
    });
  },
  methods: {
    // 返回上一页面
    _navback() {
      const pages = getCurrentPages();
      // 获取上一个页面的所有的方法和data中的数据
      if (pages.length === 1) {
        wx.reLaunch({
          url: "/pages/index/index",
        });
      } else {
        wx.navigateBack();
      }
    },
    // 返回到首页
    _backhome() {
      wx.reLaunch({
        url: "/pages/index/index",
      });
    },
  },
});
