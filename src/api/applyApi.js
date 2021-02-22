const request = require("../utils/request");
const url = "v1/member/activityApplicants";

// 报名名单
module.exports.detail = async (param) => {
  return request
    .get(`${url}`, param)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

module.exports.apply = async (param) => {
  return request
    .post(`${url}`, param)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

module.exports.replace = async (param) => {
  return request
    .post(`${url}/replace`, param)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

module.exports.replacedDetail = async (param) => {
  return request
    .get(`${url}/replacedDetail`, param)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};
