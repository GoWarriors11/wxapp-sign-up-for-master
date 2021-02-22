const request = require("../utils/request");
const url = "v1/member/activitys";

// 发起活动
module.exports.create = async (params) => {
  return request
    .post(`${url}`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

// 取消活动
module.exports.cancel = async (id, params) => {
  return request
    .put(`${url}/cancel/${id}`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

// 继续活动
module.exports.restart = async (id, params) => {
  return request
    .put(`${url}/restart/${id}`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

// 最新活动
module.exports.getNewestActivity = async (params) => {
  return request
    .get(`${url}/getNewestActivity`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

// 删除活动
module.exports.delete = async (id) => {
  return request
    .delete(`${url}/${id}`)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

// 活动详情
module.exports.detail = async (id) => {
  return request
    .get(`${url}/${id}`)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};

// 编辑活动
module.exports.update = async (id, params) => {
  return request
    .put(`${url}/${id}`, params)
    .then((res) => {
      return res;
    })
    .catch((res) => {});
};
