---
title: "Vibe Pencil Architecture Skill Implementation"
description: "Comprehensive plan to implement the Vibe Pencil skill integrating Pencil MCP patterns and Binh Phap design principles."
status: completed
priority: P2
effort: 3d
branch: main
tags: [skill, mcp, design, pencil, binh-phap]
created: 2026-01-31
---

# Vibe Pencil Architecture Skill Plan

## Overview
This plan outlines the implementation of the **Vibe Pencil Architecture Skill**, a hybrid agentic capability that leverages the Pencil MCP server for design automation. It uniquely integrates **Binh Phap (Sun Tzu) principles** to guide design strategy, ensuring outputs are not just visually correct but strategically sound (User Research, Visual Hierarchy, Contrast, Adaptability).

## Research Context
- **MCP Patterns:** `plans/reports/researcher-260131-1513-pencil-mcp-research.md`
- **Design Strategy:** `plans/reports/researcher-260131-1513-sun-tzu-design-mapping.md`

## Phased Implementation

### [Phase 1: Skill Foundation](./phase-01-skill-foundation.md)
**Status:** Pending
- Establish `.claude/skills/vibe-pencil/` structure.
- Create `SKILL.md` with "Search-Plan-Execute-Verify" loop.
- Implement Binh Phap prompt instructions.

### [Phase 2: Templates & Assets](./phase-02-templates.md)
**Status:** Pending
- Define Material Design 3 UI templates.
- Define High-Conversion Marketing templates.
- Structure prompt libraries for `batch_design`.

### [Phase 3: Command Integration](./phase-03-command-integration.md)
**Status:** Pending
- Create `/pencil` command executable.
- Integrate with existing `/design` workflow.
- Update global `CLAUDE.md` and project documentation.

### [Phase 4: Testing & Verification](./phase-04-testing.md)
**Status:** Pending
- Validate MCP tool chain (`batch_design`, `get_screenshot`).
- Verify Binh Phap logic in generated designs.
- User Acceptance Testing (Bill Will account).

## Key Principles (The Holy Trinity)
- **YAGNI:** No over-engineered prompt chains; focus on the 4 core Binh Phap chapters.
- **KISS:** Simple, robust `batch_design` instructions; avoid deep nesting.
- **DRY:** Reusable templates for common UI patterns (Cards, Heroes).

## Unresolved Questions
- How to quantify "Momentum" (Ch.5) in static design generation? (To be addressed in Phase 2).
