// components/authorize/authorize.js
const loginApi = require("../../api/loginApi");
const session = require("../../utils/session");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isAuthorize: {
      type: Boolean,
      value: false,
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
    bindGetUserInfo: function(e) {
      const userInfo = e.detail.userInfo;
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
    },
  },
});
