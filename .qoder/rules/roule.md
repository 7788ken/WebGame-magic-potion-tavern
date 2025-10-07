---
trigger: manual
---
# Repository Guidelines

欢迎贡献 本项目。请遵循以下约定以保持一致性与可维护性。

## 通用规则
- **沟通**: 所有讨论与提交说明统一使用简体中文。
- **文档**: Markdown 文件存放于 `docs/`，讨论草案归档到 `discuss/`（如缺失请先创建）。
- **架构**: 动态语言单文件不超过 300 行，静态语言不超过 400 行；每层目录尽量控制在 8 个文件内，警惕僵化、冗余、循环依赖等代码坏味道并及时提出优化建议。
- **运行与调试**: 所有启动、部署、调试操作优先使用 `scripts/` 下的 Shell 脚本；若脚本失败，先修复脚本再继续；运行服务前确保日志输出指向 `logs/` 目录。

## Project Structure & Module Organization
- `QuickCount/`: Flutter 客户端；核心代码位于 `lib/`，测试集中在 `test/`，辅助脚本在 `scripts/`。
- `supabase/`: Supabase 配置与 Edge Functions；`functions/` 按功能拆分 TypeScript 源码，`config.toml` 记录本地 CLI 设置。
- `AppService/public/`: Netlify 托管的静态问卷入口与公共资源。
- `docs/`: 设计方案、迁移记录和决策日志，每次功能变更请同步更新。
- `scripts/`: 自动化脚本，包含数据库 SQL 序列以及 `supabase/deploy-edge-functions.sh`。

## Build, Test, and Development Commands
- `cd QuickCount && flutter pub get`: 安装 Flutter 依赖。
- `cd QuickCount && flutter analyze`: 静态分析与 lint 校验。
- `cd QuickCount && flutter test`: 运行单元与小部件测试。
- `cd QuickCount && flutter run -d chrome`: 启动 Web 端快速预览；移动端请指定真实设备。
- `SUPABASE_ACCESS_TOKEN=... ./scripts/supabase/deploy-edge-functions.sh`: 通过 Supabase CLI 部署 Edge Functions。
- `cd scripts/supabase && node test-edge-functions.js`: 手动回归验证私钥生成与校验函数。

## Coding Style & Naming Conventions
- Flutter 遵循 `analysis_options.yaml`（基于 `flutter_lints`），保持 2 空格缩进；文件采用 `snake_case.dart`，类与 Widget 使用 PascalCase。
- 提交前运行 `dart format .` 或 `flutter format .`，确保 `flutter analyze` 无告警。
- Supabase Edge Functions 基于 Deno TypeScript，保持 camelCase 变量与 2 空格缩进；建议执行 `deno fmt supabase/functions`。
- Shell 与 SQL 脚本放在 `scripts/`，文件头注明用途和依赖。

## Testing Guidelines
- 新增 Flutter 功能需补充 `QuickCount/test/` 下的 `*_test.dart`，命名与被测模块一致，如 `survey_repository_test.dart`。
- 需要样例数据时复用 `QuickCount/files/` 中的模板，以保证测试可复现。
- 部署 Edge Functions 前运行 `node scripts/supabase/test-edge-functions.js` 并在 `.env` 中填充 Supabase URL、密钥。
- 数据库改动按数字顺序运行 `scripts/supabase/0*.sql`，在测试环境验证 RLS 与 RPC。

## Commit & Pull Request Guidelines
- 使用 Conventional Commits，例如 `feat(report): 新增分析图表` 或 `fix(auth): 修正私钥验证`。
- 每个 PR 关注单一主题，说明涉及模块、测试结果以及 UI 变化的截图或录屏。
- 链接相关需求或文档（如 `README.MD`、`待解决任务.md`、`docs/` 条目），确保评审人员快速获取上下文。
- 在请求评审前确认脚本、分析与测试均已通过，标注任何需要重点关注的安全配置。

## Security & Configuration Tips
- 私钥与 Supabase 凭证保存在本地安全位置（如 `Serviceinfo`、`.env`），禁止提交至版本库。
- 泄露时立即旋转 `SUPABASE_ACCESS_TOKEN`，并记录到变更说明。
- 对积分或计费相关函数，提交前评估速率限制与日志需求，并在 PR 中明确说明。
