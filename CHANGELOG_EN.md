# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2025-01-29

### Fixed
- Version number now dynamically fetched from package.json
- Output Detail mode (compact/standard/detailed/forensic) now works correctly with settings persistence
- Marker colour properly syncs with settings across all components
- Clear after copy functionality now works as expected
- Block page interactions feature (renamed from Freeze Animations) now properly freezes/unfreezes page

## [1.0.1] - 2025-01-28

### Added
- GitHub Actions workflow for automatic npm publishing on release
- CHANGELOG with bilingual support (EN/CN)
- Mouse drag multi-select functionality (1:1 React port)

### Improved
- Multi-select drag selection with visual outline for pending/editing annotations
- Reduced drag threshold from 8px to 5px for more responsive selection
- Hide hover highlight and tooltip during drag selection
- Pending marker now displays plus icon at mouse position
- Multi-select uses green accent color (#34C759) for distinction

### Fixed
- Prevent click handler from firing after drag selection completes
- Fix development mode CSS import and alias configuration
- Improved text element detection for native text selection

## [1.0.0] - 2025-01-28

### Added
- Initial release of agentation-vue3
- Visual feedback components for AI coding agents
