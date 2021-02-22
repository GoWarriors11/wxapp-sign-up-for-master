const R = require("./lib/ramda");

const sessionIdKey = "bm_sessionId";
const userInfoKey = "bm_userInfo";

const getSessionHeader = () => {
  const sessionId = getSessionId();
  if (!R.isNil(sessionId) && sessionId !== "") {
    return {
      "content-type": "application/x-www-form-urlencoded",
      Client: "wx_miniapp",
      Cookie: "JSESSIONID=" + sessionId,
    };
  } else {
    return { "content-type": "application/x-www-form-urlencoded", Client: "wx_miniapp" };
  }
};

const getSessionId = () => {
  return wx.getStorageSync(sessionIdKey);
};

const setSessionId = (sessionId) => {
  wx.setStorageSync(sessionIdKey, sessionId);
};

const getUserInfo = () => {
  return wx.getStorageSync(userInfoKey);
};

const setUserInfo = (userInfo) => {
  wx.setStorageSync(userInfoKey, userInfo);
};

module.exports = {
  getSessionHeader,
  getSessionId,
  setSessionId,
  getUserInfo,
  setUserInfo,
};
