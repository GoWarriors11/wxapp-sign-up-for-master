module.exports = {
    root: true,
    env: {
        node: true
    },
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
    // 全局变量声明
    globals: {
        wx: true,
        App: true,
        getCurrentPages: true,
        getApp: true,
        Component: true,
        Page: true,
        Promise: true,
    },
    // extending config
    extends: [
        "eslint:recommended",
        "plugin:promise/recommended",
        "prettier",
    ],
    plugins: [
        "promise",
        "prettier",
    ],
    rules: {
        "promise/always-return": 0, // then允许不用return
        "promise/catch-or-return": 0, // 调用方不校验return
        "promise/no-nesting": 1, // then嵌套promise

        "prettier/prettier": ["error", {
            // https://prettier.io/docs/en/options.html
            // 注意: prettier已存在的规则, 不要在eslint.rules.xx中重复声明, 避免不必要的冲突
            printWidth: 120, // 行宽, 默认为80
            tabWidth: 2, // tab空格数
            useTabs: false, // 是否使用tab进行缩进
            singleQuote: false, // 是否使用单引号
            semi: true, // 语句以分号结尾
            trailingComma: "all", // 是否使用尾逗号，有三个可选值"<none|es5|all>"
            bracketSpacing: true, // 对象大括号之间是否保留空格，默认为true，效果：{ foo: bar }
            arrowParens: "always", // 要求箭头函数的参数使用圆括号
        }],
        
        "strict": 2,// 严格模式
        "no-console": 0, // 禁止console
        "no-debugger": 0, // 禁止debugger
        "camelcase": 0, // 驼峰命名
        "require-await": 0, // 允许async函数, 不带await表达式
        "no-return-await": 0, // 允许return await
        "semi-spacing": 2, // 分号前后不能有空格
        "brace-style": [2, "1tbs"], // 大括号缩进格式
        "eqeqeq": 1, // 全等
        "comma-style": 2, // 方数组元素、变量声明等需要逗号隔开
        "eol-last": 2, // 文件末尾以空行结束
        "new-parens": 2, // 没有参数时，构造函数也需要添加括号
        "init-declarations": 2, // 同时声明并初始化变量
        "prefer-arrow-callback": 2, // 首选箭头函数作为回调
        "prefer-const": 2, // 首选const
        "no-empty": 1, // 空语句块{}
        "no-unused-vars": [1, { "vars": "local", "args": "none" }], // 声明但未使用
        "no-undef": 2, // 禁止声明/引用全局变量, 除非带有/*global*/注释
        "no-var": 2, // 禁止var，用let/const代替
        "no-mixed-requires": 2, // 禁止混合requires和赋值变量/常量声明,
        "no-new-require": 2, // 禁止new require
        "no-new-func": 2, // 禁止new Function
        "no-caller": 2, // 禁止arguments.caller, arguments.callee
        "no-multi-spaces": 2, // 禁止多空格
        "no-dupe-args": 2, // 禁止function定义中出现重名参数
        "no-redeclare": 2, // 禁止重复声明
        "no-return-assign": 2, // 禁止在return语句中任务
        "key-spacing": 2, // 键和值前保留一个空格
        "keyword-spacing": 2, // js关键字前后保留一个空格
        "space-in-parens": 2, // 禁止括号里面存在空格
        "space-infix-ops": 2, // 操作符前后添加一个空格
        "spaced-comment": 2, // 注释字符前需添加一个空格
    }
};
