# Phase 4: Testing & Verification

## Context
-   **Plan:** [Overview](./plan.md)
-   **User:** Bill Will (billwill.mentor@gmail.com)
-   **Tools:** Pencil MCP, Playwright (optional for web, but focus is Pencil)

## Overview
**Priority:** P3 (Low)
**Status:** Completed

Validate the implementation by running real design scenarios. This phase ensures the "Search-Plan-Execute-Verify" loop works and that the Binh Phap principles actually improve the output (or at least structure it).

## Key Insights
1.  **Visual Verification:** We cannot "see" the design without `get_screenshot`. This step is crucial for the "Verify" phase.
2.  **Error Handling:** `batch_design` fails transactionally. We need to test how the agent recovers from a failed batch (e.g., ID collision).
3.  **Binh Phap Check:** We need to verify if the agent *actually* explains its strategic choices (e.g., "I placed the CTA here for Momentum...").

## Requirements
-   **Test Case 1 (UI):** "Create a Login Screen for a Food App."
-   **Test Case 2 (Marketing):** "Create a Hero Section for a Tet Holiday Sale."
-   **Validation:**
    -   Successful MCP calls (no schema errors).
    -   Visual screenshot generated.
    -   Explanation referencing Sun Tzu principles.

## Architecture
-   **Test Script:** Manual execution via CLI using `/pencil`.
-   **Log Analysis:** Review agent logs for `mcp-cli info` usage.

## Related Files
-   `plans/reports/tester-260131-pencil-verification.md` (Output)

## Implementation Steps

1.  **Dry Run (Schema Check)**
    -   Run `/pencil status` or similar to check if agent can see the tools.
    -   Verify `mcp-cli info pencil/batch_design` returns correct schema.

2.  **Execute UI Test (Login Screen)**
    -   Prompt: "/pencil Design a minimalist login screen for Cơm Ánh Dương. Use Material Design 3."
    -   *Expected Behavior:*
        -   Agent maps "Laying Plans" -> Checks existing canvas.
        -   Agent maps "Energy" -> Vertical flow.
        -   Executes `batch_design`.
        -   Returns screenshot.

3.  **Execute Marketing Test (Hero Section)**
    -   Prompt: "/pencil Design a high-conversion hero section for Vibe Marketing. Focus on 'Momentum'."
    -   *Expected Behavior:*
        -   Agent uses "Indirect Attack" (Emotional imagery).
        -   Uses Z-pattern.
        -   Executes `batch_design`.

4.  **Binh Phap Audit**
    -   Ask the agent: "Why did you place the button there?"
    -   *Pass:* "To maintain the flow of energy (Ch.5) towards the conversion point."
    -   *Fail:* "Because it looks good."

## Todo List
-   [ ] Run Schema Check.
-   [ ] Run UI Test Case.
-   [ ] Run Marketing Test Case.
-   [ ] Document findings in `tester-260131-pencil-verification.md`.

## Success Criteria
-   Agent successfully designs both cases without crashing.
-   Screenshots are returned.
-   Strategic reasoning is evident in the chat logs.

## Risk Assessment
-   **Risk:** MCP tool failure (timeout or internal error).
    -   **Mitigation:** Retry logic in the skill instructions.
-   **Risk:** Agent ignores Binh Phap.
    -   **Mitigation:** Strengthen system prompt instructions in Phase 1.

## Next Steps
-   Mark project as Complete.
