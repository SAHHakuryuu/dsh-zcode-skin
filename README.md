# ZCode 皮肤 · dsh-zcode-skin

给 DeepSeek Harness Web 界面用的 ZCode 风格皮肤插件：墨黑偏绿的画布、石墨层级面板、发丝级描边、终端翡翠绿点缀，以及棱角分明的 **Z** 字标。

皮肤以「token 层」实现，因此**跟随用户当前的浅色 / 深色偏好自动切换**，不会把深色强加给浅色用户。

> English summary at the bottom.

---

## 效果

- **配色**：21 个 `--dsw-alias-*` 语义 token 的明/暗成对覆盖，覆盖画布、层叠面板、浮层、边框、文字三级、品牌色、链接、四种状态色、hover、代码块、侧栏。
- **品牌字标**：棱角化 `Z` + 终端光标方块，替换侧栏品牌位，并出现在新建会话 Hero 位。
- **命名主题**：同时注册 id 为 `zcode` 的主题，主题名册接受第三方 id 的版本里可直接选用；不接受也不影响皮肤，token 层已经生效。

## 安装

本包声明了 `dsh.bundle.patch`，作为 bundle 安装：

1. 在 Harness 的插件管理中以**本地目录**方式安装本仓库根目录（bundle 安装，不要只复制 `client.js`）。
2. 安装完成后插件行 `include:zcode-skin` 变为 active 即生效；页面通过模块图热更新拿到新 bundle，**通常无需重启**。

安装后：

- 皮肤在插件启用期间始终生效（token 层叠在当前主题之上）。
- 关闭方式：在「设置 → 插件」禁用或移除本插件，token 层与字标一并撤销，内置字标恢复。

## 配色表

| Token | Light | Dark |
| --- | --- | --- |
| `--dsw-alias-bg-base` | `#f4f6f4` | `#0a0c0b` |
| `--dsw-alias-bg-layer-1` | `#fafbf9` | `#0f1311` |
| `--dsw-alias-bg-layer-2` | `#eff3ef` | `#151b18` |
| `--dsw-alias-bg-layer-3` | `#e7ece7` | `#1b2420` |
| `--dsw-alias-bg-overlay` | `#ffffff` | `#0d1110` |
| `--dsw-alias-border-l1` | `#dde4dd` | `#1e2823` |
| `--dsw-alias-border-l2` | `#c4cec6` | `#2e3b35` |
| `--dsw-alias-brand-primary` | `#0e7a56` | `#00a878` |
| `--dsw-alias-button-primary-fill` | `#0e7a56` | `#00714d` |
| `--dsw-alias-link` | `#0b6b4b` | `#35d9a0` |
| `--dsw-alias-label-primary` | `#14201a` | `#e7eee9` |
| `--dsw-alias-label-secondary` | `#55655c` | `#94a29a` |
| `--dsw-alias-label-tertiary` | `#7a8b81` | `#66746d` |
| `--dsw-alias-menu-icon` | `#4a5750` | `#7f8e86` |
| `--dsw-alias-state-error-primary` | `#c43c39` | `#f2706f` |
| `--dsw-alias-state-warn-primary` | `#a96a12` | `#e0a94a` |
| `--dsw-alias-state-success-primary` | `#0e7a56` | `#35c08b` |
| `--dsw-alias-state-idle-primary` | `#9aa8a0` | `#5e6b65` |
| `--dsw-alias-state-business-primary` | `#0e7a56` | `#35d9a0` |
| `--dsw-alias-interactive-bg-hover` | `#e8efe9` | `#16201b` |
| `--dsw-alias-markdown-code-block` | `#eff3ef` | `#070a08` |
| `--dsw-specific-sidebar-fill` | `#edf1ed` | `#0b0f0d` |

品牌色 `#00a878` 亮度较高、用作点缀；主按钮另取更深的 `#00714d`（浅色下 `#0e7a56`），保证白色按钮标签仍有可读对比度。

## 自定义

改 `client.js` 顶部的 `PALETTE`（每个 token 是 `{ light, dark }` 一对），然后在插件管理里重启该插件行即可热更新；`DARK_TOKENS` 由 `PALETTE` 自动派生，无需同步修改。

字标改 `ZCodeMark` 组件里的 SVG（`path` 是 Z 形，右下 `rect` 是终端光标块）。

## 结构

```
package.json        # 包声明：exports / files / dsh.bundle / dsh.client
cordis.patch.yml    # bundle 补丁：插入 id 为 zcode-skin 的插件行
index.js            # Host 侧：空实现，仅用于承载 Client 模块
client.js           # Client 侧：token 层 + 命名主题 + 两处品牌字标
locale/en.json      # 插件列表标题与描述（英文）
locale/zh.json      # 插件列表标题与描述（中文）
icon.svg            # 插件列表图标
```

## 实现说明（两个 Harness 细节）

1. **单槽位要按优先级遮蔽**：`sidebar.brand.mark` 是 `single` 槽位，内置实现已占用 priority `0`；同优先级注册会抛 `single slot "…" already has a registration at priority 0 … register at a different priority to shadow it`，并中断整个 `apply`。本插件用 `priority: -1` 注册（最低优先级才渲染），让内置字标转为 inactive。Hero 位是空槽，无需遮蔽。
2. **第三方主题 id 不进内置设置枚举**：因此不调用 `setTheme`，而是用 `ctx.theme.overrideTokens(source, tokens)` 铺一层 token；`ctx.theme.register()` 只用于把 `zcode` 加进主题名册。两步各自 try/catch，任一步在某个构建上失效都不会连带丢掉字标。

依赖面：只用 Client 侧的 `slots` 与 `theme` 服务，没有引入任何 Harness Client 私有包（`@deepseek-ai/dsh-client-ui-primitives` 之类），因此跨版本更稳。

## 已验证 / 未验证

在 DSH `0.2.2-rc.1`（Windows desktop profile）实测：

- 插件行 `include:zcode-skin` 为 `active`，bundle 安装 `application: applied`、无 warnings；
- 客户端 bundle 出现在页面模块图（application batch）中并被加载；
- `overrideTokens` 与 `theme.register` 均被运行时接受（浏览器内一次性诊断通道确认，随后已移除）；
- 实时槽位：`sidebar.brand.mark` 上出现 priority `-1` 的 active 占用者、内置 priority `0` 转为 inactive；`conversation.hero.brand.mark` 由本插件占用。

未验证：视觉呈现（配色对比、宽/窄侧栏下字标观感）没有附截图。

## License

[MIT](./LICENSE) © 2026 SAHHakuryuu

---

## English

A ZCode-style skin plugin for the DeepSeek Harness Web UI: an ink canvas with a faint green cast, graphite surfaces, hairline borders, terminal-emerald accents, and an angular **Z** brand mark.

- Implemented as a **token layer** over the active theme (21 `--dsw-alias-*` tokens, each with a light/dark pair), so it follows the user's color-scheme preference instead of forcing dark mode.
- Also registers a named theme `zcode`; the token layer paints either way.
- Replaces the sidebar brand mark (`priority: -1` to shadow the shipped `0`) and fills the blank-session hero mark.

Install it as a bundle from this directory through the Harness plugin manager. Disable or remove the plugin row to restore the built-in look. Edit `PALETTE` in `client.js` to recolor.

Licensed under the MIT License.
