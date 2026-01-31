# CLAUDE.md - Cơm Ánh Dương Project

**Project**: Restaurant POS + Customer App
**Stack**: React 19, Vite, Material UI, Supabase
**Status**: Pre-launch - Production Ready

## Critical Rules

1. **ALWAYS follow Binh Pháp strategy** in `.claude/rules/binh-phap.md`
2. **YAGNI / KISS / DRY** - No over-engineering
3. **File size < 200 lines** - Modularize large files
4. **Kebab-case** for all file names

## Key Workflows

- `/ck:review:codebase` - Deep audit
- `/ck:fix:hard` - Fix complex issues
- `/ck:cook:auto` - Auto implement features
- `/ck:git:cp` - Commit and push

## Tech Debt Targets

```bash
# Run before commit - all must return 0
grep -rn "console\." react-app/src --include="*.ts" --include="*.tsx" | grep -v debug.ts | wc -l
grep -rn "TODO\|FIXME" react-app/src --include="*.ts" --include="*.tsx" | wc -l
```

## SOPs Location

- `react-app/docs/stakeholder-sops.md`

## COD Focus

Default payment: Cash on Delivery (COD)
Badge: "Phổ biến" highlighted on checkout
