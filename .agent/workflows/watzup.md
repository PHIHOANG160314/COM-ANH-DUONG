---
description: Generate weekly project status report (/watzup command)
---

# /watzup - Project Status Report

Generate a comprehensive project status report.

## Steps

// turbo-all

1. Read the project roadmap for current priorities
```bash
cat .agent/project-roadmap.md
```

2. Check recent git activity (last 10 commits)
```bash
git log -10 --oneline --date=short
```

3. Review open tasks and blockers from roadmap

4. Generate status report with:
   - **Completed:** Features done this week
   - **In Progress:** Current work items
   - **Next Up:** Priority items for next week
   - **Blockers:** Any issues blocking progress
   - **Velocity:** Story points completed vs planned

5. Save report to `.agent/reports/YYMMDD-weekly-status.md`

## Report Template

```markdown
# Weekly Status Report - [DATE]

## 📊 Summary
- Sprint: [Sprint N]
- Velocity: [X/Y] story points

## ✅ Completed This Week
- [Feature 1]
- [Feature 2]

## 🚧 In Progress
- [Task 1] - [% complete]

## 📋 Next Priorities
1. [Priority 1]
2. [Priority 2]

## 🚨 Blockers
- [None / List blockers]

## 📈 Metrics
- Commits: [N]
- Deployments: [N]
```

## Usage

Just type `/watzup` to get the current project status.
