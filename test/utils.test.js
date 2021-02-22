const R = require("../src/utils/lib/ramda");

console.log("isEmpty", R.isEmpty([]));
console.log(
  "mergeDeepRight",
  R.mergeDeepRight(
    { name: "name1", address: { province: "广东", city: "广州", detail: "海珠叁悦广场" } },
    { phone: "10086", address: { province: "广东", city: "深圳" } },
  ),
);
