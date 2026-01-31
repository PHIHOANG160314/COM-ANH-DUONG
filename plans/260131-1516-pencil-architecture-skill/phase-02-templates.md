# Phase 2: Templates & Assets

## Context
-   **Plan:** [Overview](./plan.md)
-   **Design Standard:** Material Design 3 (Project Rule)
-   **Strategy:** Binh Phap Ch.5 (Energy/Momentum) & Ch.11 (Nine Situations)

## Overview
**Priority:** P2 (Medium)
**Status:** Completed

Define the "genetic code" of the designs. Instead of generating every pixel from scratch, the agent will use "Templates" (pre-defined logical structures) that adhere to Material Design 3 and Marketing best practices. This corresponds to Sun Tzu's "Methods" (Ch.1).

## Key Insights
1.  **MD3 Standard:** Project requires Material Design 3. Templates must use MD3 tokens (roles, elevation, states).
2.  **Marketing vs. UI:**
    -   *UI (App):* High utility, low friction (Direct Attack).
    -   *Marketing (Landing):* High emotion, high engagement (Indirect Attack).
3.  **Batch Efficiency:** Templates should be stored as pseudo-code or efficient `batch_design` instruction sets to save tokens.

## Requirements
-   **UI Templates:** Login, Dashboard, List View, Detail View (MD3).
-   **Marketing Templates:** Hero Section, Feature Grid, Testimonials, CTA.
-   **Format:** Text-based instructions or JSON snippets usable by `batch_design`.

## Architecture
-   **Storage:** `$HOME/.claude/skills/vibe-pencil/templates/`
-   **Structure:**
    -   `ui/` - App components.
    -   `marketing/` - Landing page sections.
    -   `tokens.json` - Color/Typography mapping.

## Related Files
-   `$HOME/.claude/skills/vibe-pencil/templates/ui-patterns.md`
-   `$HOME/.claude/skills/vibe-pencil/templates/marketing-patterns.md`

## Implementation Steps

1.  **Create Template Directory**
    -   `mkdir -p $HOME/.claude/skills/vibe-pencil/templates/{ui,marketing}`

2.  **Define UI Patterns (MD3)**
    -   Create `ui-patterns.md`.
    -   **Login Screen:** Vertical layout, input fields (outlined), primary button (filled), surface container.
    -   **Dashboard:** Navigation rail, top app bar, card grid (masonry or uniform).
    -   *Constraint:* Ensure "Emptiness" (Ch.6) is baked into padding/gap rules.

3.  **Define Marketing Patterns (Vibe Style)**
    -   Create `marketing-patterns.md`.
    -   **Hero:** H1 (Display Large), Subtext, Dual CTA (Primary/Secondary), Image/Graphic placeholder.
    -   **Features:** Z-pattern layout (Text-Image / Image-Text) for "Flow" (Ch.5).
    -   **Social Proof:** Row of logos or card carousel.

4.  **Create Design System Tokens**
    -   Define a simple mapping for MD3 colors (Primary, Secondary, Surface, OnSurface) to hex codes or Figma variable names if Pencil supports them.

## Todo List
-   [ ] Create template directories.
-   [ ] Write `ui-patterns.md` (MD3 specs).
-   [ ] Write `marketing-patterns.md` (Conversion focused).
-   [ ] Define "Ch.11 Adaptability" rules (e.g., how templates stack on mobile).

## Success Criteria
-   Templates cover 80% of common requests.
-   Agent can recall a "Hero Section" template and adapt it without hallucinating structure.
-   Templates respect the "find_empty_space" requirement.

## Risk Assessment
-   **Risk:** Templates become stale or conflict with existing Pencil document styles.
    -   **Mitigation:** Templates should be "structure-first" (Frames/Layouts), allowing styles to be applied via `replace_all_matching_properties`.

## Next Steps
-   Proceed to [Phase 3: Command Integration](./phase-03-command-integration.md).
