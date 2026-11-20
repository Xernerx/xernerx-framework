<!-- @format -->

## 1.3.1

### Patch Changes

- Link GitHub Packages (`npm.pkg.github.com`) publish step to canonical `${GITHUB_REPOSITORY}` with `GITHUB_TOKEN`.

## 1.3.0

### Minor Changes

- <!-- @format -->
  
  Add centralized WebSocket error telemetry (`XernerxClient.reportError` and `registerXernerxErrorReporter` in `XernerxError`) and update `packageManager` to `pnpm@12.21.0`.

## 1.2.0

### Minor Changes

- <!-- @format -->
  
  ## `XernerxUser.shadowban` Property & Engagement State Enrichment
  
  Added `shadowban: boolean` to `XernerxUser` and `UserEngagementData` so bot commands and leaderboard handlers can check whether a user is shadowbanned from global leaderboards.
  
  ### Added
  
  - **`XernerxUser.shadowban` Boolean**: Added `public shadowban = false` to `XernerxUser` (`src/model/XernerxUser.ts`), populated automatically via `user.fetch()`, `@xernerx/hooks` engagement state, and `GET /v1/bots/:id/users/:userId`.
  - **`UserEngagementData.shadowban`**: Extended `UserEngagementData` in `XernerxClientOptions` and `XernerxClient` to propagate `shadowban`.

## 1.1.3

### Patch Changes

- Fix `XernerxUser.premium()` to accept an optional SKU ID filter and exclude ended/consumed entitlements, fix `XernerxUser.synchronize()` and `XernerxMonitisation.create()` test entitlement handling, and implement `XernerxGuild` monetization methods (`premium`, `entitlements`, `consumeEntitlement`).

## 1.1.2

### Patch Changes

- Delegate startup version checks in `XernerxInitial` to `@xernerx/terminal`'s unified `t.update()` checker instead of comparing `@xernerx/framework` against `xernerx`.

## 1.1.1

### Patch Changes

- Use `@xernerx/extension-builder` from npm and integrate `ExtensionBuilder` handling.

## 1.1.0

### Minor Changes

- Add user engagement (`voted`, `reviewed`, `tipped`) support on `XernerxClient`, `XernerxUser`, command builders, and validators, and update JSDoc comments and documentation.

## 1.0.3

### Patch Changes

- <!-- @format -->
  
  Setup changeset pipeline and migrate package manager to pnpm

# @xernerx/framework
