# Pencil MCP Research Report

## 1. Tool Capabilities & Limitations
**Core Capabilities:**
- **Atomic Batch Operations:** `batch_design` executes up to 25 operations (Insert, Copy, Update, Replace, Move, Delete, Image) transactionally. Rollback on failure.
- **Deep Search:** `batch_get` finds nodes by ID, Regex pattern, type, or reusability status with adjustable depth.
- **Visual Verification:** `get_screenshot` provides pixel-perfect validation of generated layouts.
- **Style & Theming:** Dedicated tools for style guides, variable management, and global property replacement.
- **Layout Intelligence:** `find_empty_space_on_canvas` prevents overlapping elements.

**Limitations:**
- **Batch Size:** Hard limit of ~25 operations per call; larger designs must be split logically.
- **Context Limits:** Reading deep trees (`readDepth > 3`) can overflow context; prefer targeted reads.
- **No "Image" Node:** Images are fills on Frames/Rectangles, not standalone nodes.

## 2. Best Practices for .pen Operations
- **Binding Strategy:** ALWAYS use binding names (e.g., `card=I(...)`) in `batch_design`. DO NOT reuse names across batches.
- **Component Instantiation:**
  - Insert components as `type: "ref"`.
  - Use `descendants` map in `Copy` operations to override children immediately (prevents ID mismatch errors).
  - Use paths (e.g., `cardInstance/title`) for updates.
- **Safe Editing:**
  - **Read First:** Use `batch_get` to map the target area before modification.
  - **Space Finding:** Always run `find_empty_space_on_canvas` before inserting new root frames.
  - **Verify:** Always call `get_screenshot` after significant changes.

## 3. Design Workflow Patterns

### A. The "Search-Plan-Execute-Verify" Loop
1. **Search:** `batch_get` or `get_style_guide` to find assets/components.
2. **Plan:** Calculate layout requirements; `find_empty_space_on_canvas`.
3. **Execute:** `batch_design` with logical grouping (e.g., "Scaffold Frame" -> "Add Content" -> "Style").
4. **Verify:** `get_screenshot` to check visual correctness.

### B. Efficient `batch_design` Syntax
- **Insert (I):** `btn=I(parent, {type: "ref", ref: "btnID"})`
- **Update (U):** `U(btn, {width: "fill_container"})` - *Incremental changes only.*
- **Replace (R):** `R(btn+"/label", {type: "text", content: "Go"})` - *Swapping slot content.*
- **Copy (C):** `C(target, parent, {descendants: {"childId": {fill: "#F00"}}})` - *Duplicate + Override.*
- **Generate (G):** `G(frameId, "ai", "prompt")` - *Apply image fill.*

### C. Node Manipulation Patterns
- **Slot Injection:**
  1. Identify slot ID via `batch_get`.
  2. Insert content: `I("instance/slotId", {type: "text", ...})`.
- **Global Theming:** Use `replace_all_matching_properties` to swap colors/fonts across the entire tree efficiently.

## 4. Integration with AI & Design Systems
- **AI Images:** Create a Frame first, then apply `G(frameId, "ai", ...)` to fill it.
- **Style Guides:**
  1. `get_style_guide_tags` -> `get_style_guide` to retrieve curated assets.
  2. Use `set_variables` to apply theme tokens globally.
- **Design Systems:**
  - Structure: Atoms (Buttons) -> Molecules (Cards) -> Organisms (Sections).
  - Discovery: `batch_get` with `{patterns: [{reusable: true}]}` to index available components.

## 5. Anti-Patterns (Avoid These)
- **Deep Nesting in One Op:** Don't insert a huge tree in one `I()`. Break it down.
- **Updating Copied Children:** Never `C()` a node and then `U()` its old child ID. The IDs change on copy! Use `descendants` in `C()` instead.
- **Guessing IDs:** Never guess IDs. Always read first.
- **Missing Bindings:** Failing to capture `I()` or `C()` results makes subsequent modification impossible.
