# Repository Guidelines

## Project Structure & Module Organization
- `game.html` 是主要入口，`game.js` 与 `main.js` 管理全局状态，核心模块集中在 `js/`；`entities/` 负责角色与交互对象，`scenes/` 定义场景状态机，`ui/` 管控界面元素，`data/` 汇总卡牌、配方与事件配置。
- `assets/` 存放原始图片与音频，`resources/` 提供处理后的资源；脚本目录下的工具文件（如 `convert_images.js`）负责资产清洗与批处理，处理结果需要同步更新资源映射表。
- `js/utils/` 下的 `GameConfig.js`、`SaveManager.js` 等提供公共服务，修改前确认是否能通过现有抽象实现，避免重复造轮子。
- `demo.html`、`gameplay.html` 等页面用于演示或 A/B 试验，`test-*.html` 页面用于功能验证；同时参照 `design.md`、`GAME_REDESIGN_PLAN.md` 获取设计约束，保持页面与脚本路径同步。

## Build, Test, and Development Commands
- `python3 -m http.server 8080`：在项目根目录启动本地静态服务器，便于加载纹理与音频做联调；默认端口被占用时改用 `--bind 127.0.0.1 9000`。
- `node convert_images.js`：批量转码与压缩图像资源，更新前请备份原始素材，再同步检查 `assets/manifest` 及对应场景引用路径。
- `node createAudioFiles.js` 与 `node fixAudioCalls.js`：分别批量生成音频片段、修正脚本中的音频调用路径，运行后务必手动预览游戏内音效，并刷新 `resources/` 中的版本注释。
- `node fixPointLights.js`：校准灯光参数，调整前后建议对比 `scenes/` 与 `ui/` 中的材质配置差异，必要时回滚。
- `node createPlaceholderImages.js`：为缺失的素材生成占位图，生成后需要在 `assets/` 标记待替换状态，防止占位图进入发布包。

## Coding Style & Naming Conventions
- JavaScript 统一使用 4 空格缩进，结尾保留分号；布尔、数值常量集中到 `js/utils/` 或 `main.js` 的配置块，命名需保持语义化。
- 函数与变量采用 `camelCase`，构造函数与类使用 `PascalCase`；文件名沿用横杠小写（如 `game-fixed.js`），场景、实体文件与类名保持一一对应。
- 注释建议中英混写，说明意图与边界条件；涉及 DOM 选择器时补充对应 HTML 元素的类名，并标明交互触发顺序。
- 引入外部库时更新 `PROJECT_SUMMARY.md` 的依赖列表，保持与构建脚本一致；运行脚本前执行 `node --check <file>` 或 `npm run lint`（如后续接入 ESLint）来保证语法整洁。
- 所有资源命名采用前缀分类（例如 `ui_potion_slot.png`），并在 `resources/` 中保留源文件与导出文件的映射注释。

## Testing Guidelines
- 目前无自动化测试，采用页面驱动的手动验证：`test-clear-function.html` 覆盖清理逻辑，`test-error-system.html` 检查异常提示；若发现交互卡顿，请同步记录复现步骤。
- 引入新场景或 UI 时，更新 `demo.html` 中的交互脚本并录制预览动图；`gameplay.html` 用于完整流程走查，提交时附带帧率与资源加载时间。
- 提交前在桌面与移动端浏览器各完成一次完整战斗流程，记录关键帧帧率与错误日志；必要时将日志拷贝进 `erro-log/` 目录便于追溯。
- 建议使用浏览器 Performance 面板采样关键节点（加载、战斗、结算），并将指标更新到 `README.md` 的性能记录区段。

## Commit & Pull Request Guidelines
- Git 历史沿用 `feat(scope): summary`、`fix(scope): summary` 等约定，描述需精准到模块，示例：`feat(ui): optimize potion card hover states`；紧急修复请使用 `hotfix:` 前缀并在描述中标注影响版本。
- PR 描述应包含改动摘要、验证步骤、影响页面与待办项链接；涉及 UI 变更时附上截图或短视频，并列出受影响的资产文件。
- 遇到资产或大文件更新，在 PR 中注明生成方式与脚本版本，避免二次压缩或路径漂移；若调整配置文件，附上对比片段或表格说明差异。
- 提交前确认 `AGENTS.md` 与 `README.md` 中的流程要求仍然适用，如有不一致需在 PR 中说明并同步修订。
