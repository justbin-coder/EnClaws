#!/bin/bash
git checkout --ours extensions/feishu/src/bot.ts
git checkout --ours apps/macos/Sources/QingClaws/GeneralSettings.swift
git checkout --ours apps/macos/Sources/QingClaws/OnboardingView+Pages.swift
git checkout --ours apps/macos/Sources/QingClaws/SystemRunSettingsView.swift
git checkout --ours apps/shared/QingClawsKit/Sources/QingClawsChatUI/ChatMessageViews.swift
git checkout --ours apps/macos/Sources/QingClaws/AnthropicAuthControls.swift
git rm scripts/bundle-a2ui.sh 2>/dev/null
git add apps/ extensions/ scripts/
