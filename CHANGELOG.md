# Changelog / 更新日志

All notable changes to this project will be documented in this file.
本文件记录项目的所有重要变更。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased] / 未发布

### Added / 新增
- GitHub Actions workflow for automatic npm publishing on release / 添加 GitHub Actions 工作流，在发布 Release 时自动发布到 npm
- CHANGELOG.md with bilingual support / 添加双语更新日志

### Improved / 优化
- Multi-select drag selection with visual outline for pending/editing annotations / 多选框选功能增加待处理/编辑标注的视觉边框
- Reduced drag threshold from 8px to 5px for more responsive selection / 降低拖拽阈值从 8px 到 5px，使选择更灵敏
- Hide hover highlight and tooltip during drag selection / 拖拽选择时隐藏悬停高亮和提示
- Pending marker now displays plus icon at mouse position / 待处理标记现在在鼠标位置显示加号图标
- Multi-select uses green accent color (#34C759) for distinction / 多选使用绿色强调色以区分

### Fixed / 修复
- Prevent click handler from firing after drag selection completes / 修复拖拽选择完成后触发点击事件的问题
- Fix development mode CSS import and alias configuration / 修复开发模式下 CSS 导入和别名配置
- Improved text element detection for native text selection / 改进文本元素检测以支持原生文本选择

## [1.0.0] - 2025-01-28

### Added / 新增
- Initial release of agentation-vue3 / agentation-vue3 首次发布
- Visual feedback components for AI coding agents / AI 编程代理的可视化反馈组件
