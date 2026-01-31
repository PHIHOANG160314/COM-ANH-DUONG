# Binh Pháp (Sun Tzu) to Design Methodology Mapping

**Date:** 2026-01-31
**Context:** Cơm Ánh Dương - Design System Strategy
**Status:** Strategic Mapping

## 1. Ch.1 始計 (Laying Plans) → Design Planning & Strategy

*   **Principle:** "The general who wins a battle makes many calculations in his temple ere the battle is fought."
*   **Design Mapping:** **Discovery & User Research**
    *   **Know the Terrain:** User Needs, Market Analysis, Competitor Audit.
    *   **Five Factors:**
        *   *Tao (The Way):* Brand Mission & User Goal Alignment.
        *   *Heaven (Climate):* Market Trends & Timing.
        *   *Earth (Terrain):* Technical Constraints & Platform context.
        *   *Commander (Leadership):* Design System Governance.
        *   *Method (Discipline):* Workflow & Process (Agile/Waterfall).
*   **Actionable:**
    *   Never start pixel designs without wireframes and user flows.
    *   Conduct "Pre-mortem" sessions (calculating defeat to avoid it).
*   **Skill Command:** `/plan` (Blueprint creation), `/scout` (Research).

## 2. Ch.5 勢 (Energy/Momentum) → Visual Hierarchy & Flow

*   **Principle:** "In battle, there are not more than two methods of attack: the direct and the indirect."
*   **Design Mapping:** **UX Flow & Interaction Design**
    *   **Direct (Cheng):** Standard patterns, intuitive navigation, primary buttons.
    *   **Indirect (Ch'i):** Delight factors, micro-interactions, unexpected value, emotional design.
    *   **Momentum:** The "F" or "Z" pattern reading path. Guiding the user effortlessly to the CTA.
*   **Actionable:**
    *   Use **Direct** elements for utility (Navigation, Forms).
    *   Use **Indirect** elements for engagement (Animation, Gamification).
    *   Ensure the "Energy" flows towards the conversion point.
*   **Skill Command:** `/design` (Visuals), `/ui-ux-pro-max` (Advanced flow).

## 3. Ch.6 虛實 (Weak Points & Strong) → Whitespace & Contrast

*   **Principle:** "Appear at points which the enemy must hasten to defend; march swiftly to places where you are not expected."
*   **Design Mapping:** **Layout, Contrast & Negative Space**
    *   **Fullness (Solid):** Content, Images, Buttons (The "Strong").
    *   **Emptiness (Void):** Whitespace, Margins, Padding (The "Weak").
    *   **Tactic:** Use "Emptiness" (Whitespace) to amplify "Fullness" (Key Content). Don't clutter.
    *   **Focus:** Attacking the user's attention span where it is most receptive.
*   **Actionable:**
    *   Apply the **60-30-10 rule** for color (Strength distribution).
    *   Use negative space to define relationships, not just borders.
    *   "Avoid Strength, Strike Weakness": Simplify complex data (Weak cognitive load) rather than dumping raw data (Strong resistance).
*   **Skill Command:** `/frontend-design` (Layouts), `/ui-styling` (Refinement).

## 4. Ch.11 九地 (Nine Situations) → Design Systems & Adaptability

*   **Principle:** "On dispersive ground... On focal ground... On heavy ground..." (Adapt tactics to the terrain).
*   **Design Mapping:** **Responsive Design & Design Systems**
    *   **Dispersive Ground (Home):** Mobile Context (distracted, on-the-go) → Big buttons, simplified tasks.
    *   **Heavy Ground (Deep):** Desktop/Admin Dashboard (focused work) → Dense data, keyboard shortcuts.
    *   **Focal Ground:** Key conversion pages (Checkout) → Isolate the user, remove distractions.
*   **Actionable:**
    *   **Atomic Design:** Components (Soldiers) must function in any Terrain (Page/Device).
    *   **Tokens:** Use semantic tokens (color-bg-primary) over raw values to adapt to "climates" (Dark Mode).
*   **Skill Command:** `/design:system` (Token setup), `/mobile-development` (Adaptive).

## Unresolved Questions
*   How to quantify "Momentum" in our current analytics setup?
*   Should we implement "Deception" (Ch.1) in marketing (e.g., scarcity patterns) or stick to transparency?
