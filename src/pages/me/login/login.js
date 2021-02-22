// const userApi = require("../../../api/userApi");
// const dialog = require("../../../utils/dialog");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginName: "",
    password: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function() {
    // await app.verifyLogin();
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
  onChange: function(e) {
    this.setData({
      [e.currentTarget.dataset.type]: e.detail.value,
    });
    // console.log(e.currentTarget.dataset.type, this.data[e.currentTarget.dataset.type]);
  },
  /**
   * 登录
   */
  // login: async function() {
  //   if (this.data.loginName === "") {
  //     dialog.showToast("请输入账号");
  //     return;
  //   } else if (this.data.password === "") {
  //     dialog.showToast("请输入密码");
  //     return;
  //   }
  //   const params = {
  //     loginName: this.data.loginName,
  //     password: this.data.password,
  //   };
  //   dialog.showLoading("登录中");
  //   const data = await userApi.bind(params);
  //   if (data.code === "OK") {
  //     wx.reLaunch({
  //       url: "/pages/me/index/index",
  //     });
  //   }
  // },
});
