# 以后更新线上网站（零基础版）

1. 把新版本压缩包交给 Codex，并说明：“请安全更新现有 `math-visual-lab` 网站，保留部署设置和原有数学功能。”
2. Codex 会先备份和比较文件、检查 PWA，并把 `sw.js` 的缓存版本号改成新版本；测试通过后再提交并推送到同一个 GitHub 仓库。
3. Cloudflare Pages 会自动发布。等待部署完成后，请 Codex打开线上地址复查首页、实验页面和 PWA。

不要把 GitHub 或 Cloudflare 的密码、Token、密钥写进项目或发给任何人；需要登录时只使用官方网站的授权页面。
