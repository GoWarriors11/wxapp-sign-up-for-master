// watermark.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isReveal: {
      type: Boolean,
      value: false,
    },
    text: {
      type: String,
      value: "hello world",
    },
  },
  /**
   * 组件的初始数据
   */
  data: {},
  attached() {
    // 在组件实例进入页面节点树时执行
    // this.drowsyUserinfo()
    // this.setData({
    //   watermarkText: (wx.getStorageSync("userInfo") || {}).name || "水印测试",
    // });
  },
  methods: {
    // 这里是一个自定义方法
    // drowsyUserinfo: function() {
    //   const userInfo = wx.getStorageSync("userInfo") || {};
    //   const nameText = userInfo.name || "水印测试";
    //   const ctx = wx.createCanvasContext("myCanvas");
    //   ctx.draw();
    // },
  },
});
