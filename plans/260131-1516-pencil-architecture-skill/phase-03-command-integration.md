# Phase 3: Command Integration

## Context
-   **Plan:** [Overview](./plan.md)
-   **Project System:** Mekong CLI / Claude Code
-   **Skill:** Vibe Pencil

## Overview
**Priority:** P2 (Medium)
**Status:** Completed

Integrate the `vibe-pencil` skill into the developer's workflow via specific commands. This makes the skill "executable" and discoverable. We will map the skill to `/pencil` and integrate it with the existing `/design` workflow.

## Key Insights
1.  **Command Pattern:** Users prefer simple slash commands (`/pencil`) over verbose prompts.
2.  **Integration:** The project already has a `/design` command (noted in `CLAUDE.md`). We should enhance or reference it.
3.  **Account:** The user is `billwill.mentor@gmail.com`. Ensure any specific configurations (if needed for Pencil auth) are noted, though MCP handles auth usually.

## Requirements
-   **CLI Command:** Create an executable script or alias for `/pencil`.
-   **Documentation:** Update `CLAUDE.md` to list the new command.
-   **Discovery:** Update `AGENTS.md` (if exists) or project docs to explain Binh Phap usage.

## Architecture
-   **Command Path:** `$HOME/.claude/commands/pencil`
-   **Config Path:** `$HOME/.claude/CLAUDE.md` (Global) & `./CLAUDE.md` (Project)

## Related Files
-   `$HOME/.claude/commands/pencil` (New)
-   `$HOME/.claude/CLAUDE.md` (Update)
-   `./CLAUDE.md` (Update)

## Implementation Steps

1.  **Create /pencil Command**
    -   File: `$HOME/.claude/commands/pencil`
    -   Content: A script that invokes the `vibe-pencil` skill.
    -   *Logic:* It should set the context to "Design Mode", remind the agent of Binh Phap principles, and activate the MCP tools.

2.  **Update Global CLAUDE.md**
    -   Add `/pencil` to the "Allow List" or "Commands" section if applicable.
    -   Add rule: "When `/pencil` is used, ALWAYS check `mcp-cli info` for `pencil/batch_design` first."

3.  **Update Project CLAUDE.md**
    -   Add entry under "Workflows có sẵn":
        -   `/pencil` - Strategic Design Generator (Binh Phap integrated).
    -   Update `/design` description to mention it can delegate to `/pencil` for high-fidelity work.

4.  **Skill Activation Logic**
    -   Ensure `mcp-cli` is accessible.
    -   Instruction: "When user types /pencil, look for skills in `.claude/skills/vibe-pencil`."

## Todo List
-   [ ] Create `$HOME/.claude/commands/pencil`.
-   [ ] Make command executable (`chmod +x`).
-   [ ] Update global `CLAUDE.md`.
-   [ ] Update project `CLAUDE.md`.

## Success Criteria
-   Typing `/pencil` in the CLI triggers the skill.
-   The agent acknowledges the Binh Phap context immediately upon invocation.

## Risk Assessment
-   **Risk:** Command conflict with existing `/design`.
    -   **Mitigation:** `/pencil` is the specialized *tool*, `/design` is the high-level *intent*. `/design` can call `/pencil`.

## Next Steps
-   Proceed to [Phase 4: Testing & Verification](./phase-04-testing.md).
