# Phase 1: Skill Foundation

## Context
- **Plan:** [Overview](./plan.md)
- **Research:** `plans/reports/researcher-260131-1513-pencil-mcp-research.md` (MCP Patterns)
- **Strategy:** `plans/reports/researcher-260131-1513-sun-tzu-design-mapping.md` (Binh Phap)

## Overview
**Priority:** P1 (High)
**Status:** Completed

Establish the core directory structure and prompt logic for the `vibe-pencil` skill. This phase defines *how* the agent thinks about design, integrating the "Search-Plan-Execute-Verify" loop and Sun Tzu's principles into the system prompt.

## Key Insights
1.  **Workflow Loop:** The MCP research dictates a strict `Search -> Plan -> Execute -> Verify` loop to avoid context overflow and layout errors.
2.  **Strategic Design:** Designs must not be random. They must follow Ch.1 (Research), Ch.5 (Flow), Ch.6 (Contrast), and Ch.11 (Adaptability).
3.  **Batch Safety:** Use named bindings in `batch_design` and always verify with screenshots.

## Requirements
-   **Directory:** Create `.claude/skills/vibe-pencil/`.
-   **Manifest:** Create `SKILL.md` defining the skill's capabilities and instructions.
-   **Prompts:** Implement the Binh Phap mapping as system instructions.
-   **Safe Mode:** Enforce schema checks (`mcp-cli info`) before calls.

## Architecture
-   **Skill Type:** Hybrid (Command + Reference).
-   **Location:** `$HOME/.claude/skills/vibe-pencil/`.
-   **Input:** Natural language design requests.
-   **Output:** Executed Pencil MCP commands and verified screenshots.

## Related Files
-   `$HOME/.claude/skills/vibe-pencil/SKILL.md` (New)
-   `$HOME/.claude/skills/vibe-pencil/prompts.md` (New - optional, or inline)

## Implementation Steps

1.  **Create Directory Structure**
    -   `mkdir -p $HOME/.claude/skills/vibe-pencil/`

2.  **Draft SKILL.md**
    -   Define `name`: "vibe-pencil".
    -   Define `description`: "Strategic design agent using Pencil MCP and Binh Phap principles."
    -   **Instruction Block 1: The Protocol**
        -   Enforce `mcp-cli info` before use.
        -   Enforce `Search` (batch_get) before `Execute`.
    -   **Instruction Block 2: Binh Phap Strategy**
        -   Map "Laying Plans" to Discovery (Check constraints).
        -   Map "Energy/Momentum" to Visual Flow (F/Z patterns).
        -   Map "Weak/Strong" to Contrast (Whitespace usage).
        -   Map "Nine Situations" to Responsive/System checks.
    -   **Instruction Block 3: Technical Execution**
        -   Rules for `batch_design`: usage of `I()`, `U()`, `C()`.
        -   Mandatory `get_screenshot` after generation.

3.  **Define Binh Phap Primitives**
    -   Create reusable prompt snippets for "Ch.6 Contrast Check" (e.g., "Analyze the screenshot: Is the primary button the 'Strongest' element?").

## Todo List
-   [ ] Create `.claude/skills/vibe-pencil/` directory.
-   [ ] Write `SKILL.md` with Binh Phap integration.
-   [ ] Define "Search-Plan-Execute-Verify" strict stricture.
-   [ ] Review prompt against MCP limitations (token usage).

## Success Criteria
-   Skill is recognized by the agent (via `ls $HOME/.claude/skills`).
-   Instructions clearly guide the agent to use `mcp-cli` correctly.
-   Instructions effectively force the agent to consider "Flow" and "Contrast" before generating JSON.

## Risk Assessment
-   **Risk:** Context overflow from complex prompt instructions.
    -   **Mitigation:** Keep Binh Phap definitions concise (refer to the mapping report, don't copy the whole text).
-   **Risk:** Hallucination of MCP parameters.
    -   **Mitigation:** Hard constraint to run `mcp-cli info` every session.

## Next Steps
-   Proceed to [Phase 2: Templates & Assets](./phase-02-templates.md).
