// components/list-null/list-null.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isNull: {
      type: Boolean,
      value: false,
    },
    backgroundColor: {
      type: String,
      value: "transparent",
    },
    text: {
      type: String,
      value: "暂无相关订单~",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    toPost: function() {
      wx.switchTab({
        url: "/pages/post/post",
      });
    },
  },
});
