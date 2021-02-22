const request = require("../utils/request");
const url = "/v1/member/myCenter";

module.exports.myCenter = async (params) => {
  return request
    .get(`${url}`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

module.exports.getLoginUser = async (params) => {
  return request
    .get(`${url}/getLoginUser`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

module.exports.myBrowse = async (params) => {
  return request
    .get(`${url}/myBrowse`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

module.exports.myParticipate = async (params) => {
  return request
    .get(`${url}/myParticipate`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

module.exports.myPublish = async (params) => {
  return request
    .get(`${url}/myPublish`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};
