请使用vscode进行开发

## get started
使用vscode进行开发, 简单配置后, 就可以享受scss/less, async/await, eslint/stylelint语法校验, 以及友好的代码提示等. 何乐不为.

1. 安装vscode插件
    1. 通用插件
        - eslint 保存时自动校验eslint, 并格式化代码  (必须)
        - Better Comments, 优化注释的显示颜色  (推荐)
        - npm, package.json相关
        - GitLens, 显示当前行的最新提交描述
        - Git History, 支持右键查看文件的提交历史
    2. 微信小程序插件
        - minapp 小程序语法高亮  (推荐)
        - wechat-snippet 小程序常用代码片段  (推荐)
2. 安装依赖包, 并启动构建任务, 监听scss/less文件, 即时转换为wxss
下载过程可能会报错, 需要多试几次. (Ctrl + ~ 打开shell窗口)

    ```shell
    npm ci
    npm start
    ```
3. 在vscode编写代码, 在微信小程序官方开发工具调试

## 包安全检查
```bash
$ npm audit # 依赖包安全检查
$ npm audit fix # 修复缺陷包
```
