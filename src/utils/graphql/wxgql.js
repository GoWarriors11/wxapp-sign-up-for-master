const R = require("../lib/ramda");

const responseHandler = function(resolve, reject, res, errorHandler) {
  if (res.statusCode === 200 && !res.data.errors) {
    resolve(res.data.data);
  } else {
    reject(res.data);
    if (errorHandler) {
      errorHandler(res.data);
    }
  }
};

const defaultOptions = { url: undefined, header: {}, errorHandler: (res) => {} };
let _options = null;

/**
 * @param {object} options
 * @param {string} options.url
 * @param {function} options.header
 * @param {function} options.errorHandler, (res) => {}
 */
const setOptions = function(options) {
  if (!options.url) {
    throw new Error("options.url 不能为空");
  }
  if (options.header && typeof options.header !== "function") {
    throw new Error("options.header 必须为 function");
  }

  _options = R.mergeDeepRight(defaultOptions, options);
};

/**
 * @param {object} params
 * @param {string} params.query
 * @param {object} params.variables
 * @param {object|function} params.header
 */
const query = async function(params) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: _options.url,
      method: "POST",
      data: JSON.stringify({
        query: params.query,
        variables: params.variables,
      }),
      header: params.header ? R.mergeDeepRight(params.header, _options.header()) : _options.header(),
      complete: function(res) {
        responseHandler(resolve, reject, res, _options.errorHandler);
      },
    });
  });
};

/**
 * @param {object} params
 * @param {string} params.mutation
 * @param {object} params.variables
 * @param {object|function} params.header
 */
const mutation = async function(params) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: _options.url,
      method: "POST",
      data: JSON.stringify({
        query: params.mutation,
        variables: params.variables,
      }),
      header: params.header ? R.mergeDeepRight(params.header, _options.header()) : _options.header(),
      complete: function(res) {
        responseHandler(resolve, reject, res, _options.errorHandler);
      },
    });
  });
};

module.exports = {
  setOptions,
  query,
  mutation,
};
