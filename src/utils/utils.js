const R = require("./lib/ramda");

/**
 * 不等于null和undefined
 */
function assertNotNull(obj, msg) {
  if (R.isNil(msg)) {
    msg = "参数不能为null"; // `expected ${obj} to not equal null`
  }
  if (R.isNil(obj)) {
    throw new Error(msg);
  }
}

/**
 * 校验是否合法的手机号码
 */
function isMobilePhone(phone) {
  // 非0开头的11位数字
  return /^[1-9][0-9]{10}$/.test(phone);
}

/**
 * 日期格式化
 */
function formatDate(date, formatStr) {
  assertNotNull(date);
  assertNotNull(formatStr);

  function $addZero(v, size) {
    for (let i = 0, len = size - (v + "").length; i < len; i++) {
      v = "0" + v;
    }
    return v + "";
  }
  // 格式化时间
  const arrWeek = ["日", "一", "二", "三", "四", "五", "六"];
  return formatStr
    .replace(/yyyy|YYYY/, date.getFullYear())
    .replace(/yy|YY/, $addZero(date.getFullYear() % 100, 2))
    .replace(/mm|MM/, $addZero(date.getMonth() + 1, 2))
    .replace(/m|M/g, date.getMonth() + 1)
    .replace(/dd|DD/, $addZero(date.getDate(), 2))
    .replace(/d|D/g, date.getDate())
    .replace(/hh|HH/, $addZero(date.getHours(), 2))
    .replace(/h|H/g, date.getHours())
    .replace(/ii|II/, $addZero(date.getMinutes(), 2))
    .replace(/i|I/g, date.getMinutes())
    .replace(/ss|SS/, $addZero(date.getSeconds(), 2))
    .replace(/s|S/g, date.getSeconds())
    .replace(/w/g, date.getDay())
    .replace(/W/g, arrWeek[date.getDay()]);
}

/**
 *
 */
function secondToTime(s) {
  assertNotNull(s);

  let t = "";
  if (s > -1) {
    const min = Math.floor(s / 60) % 60;
    const sec = s % 60;
    // if (hour < 10) {
    //   t = '0' + hour + ":";
    // } else {
    //   t = hour + ":";
    // }

    if (min < 10) {
      t = "0" + min + ":";
    } else {
      t = min + ":";
    }
    if (sec < 10) {
      t += "0";
    }
    t += sec;
  }
  return t;
}

module.exports = {
  assertNotNull,
  isMobilePhone,
  formatDate,
  secondToTime,
};
