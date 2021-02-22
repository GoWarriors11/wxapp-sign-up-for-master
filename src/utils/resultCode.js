const code = {
  success: "OK", // 操作成功
  fail: "BUSINESS_ERROR", // 操作失败
  inputError: "BAD_USER_INPUT", // 参数错误
  error: "INTERNAL_SERVER_ERROR", // 系统繁忙，请稍后再试
  unauthenticated: "UNAUTHENTICATED", // 未登录
  forbidden: "FORBIDDEN", // 未授权
  accountDisabled: "ACCOUNT_DISABLED", // 账号已被禁用
  businessFail: "BUSINESS_FAIL",
};

module.exports = {
  ResultCode: code,
};
