# Binh Pháp Strategy Rules

## Core Philosophy

**Công Thành Phá Trận** - Total Victory through systematic execution.

## 6 Battle Fronts

### 🔴 Front 1: Tech Debt Elimination (始計 - Initial Calculations)

- Remove ALL `console.log/warn/error`
- Fix ALL `TODO/FIXME` comments
- Remove ALL `@ts-ignore`
- Goal: 0 tech debt items

### 🔴 Front 2: Type Safety 100% (作戰 - Waging War)

- Replace ALL `any` types with proper types
- Add interfaces where missing
- Strict null checks enabled
- Goal: 0 `any` types

### 🟡 Front 3: Performance (謀攻 - Attack by Stratagem)

- Code splitting with React.lazy
- Configure manualChunks in vite.config
- Image optimization to webp
- Goal: Build < 10s

### 🟡 Front 4: Security (軍形 - Military Disposition)

- Input validation with zod
- XSS prevention
- No secrets exposed
- Goal: 0 vulnerabilities

### 🟢 Front 5: UX Polish (兵勢 - Energy)

- Loading states on all async
- Error boundaries
- Empty states with illustrations
- Goal: Seamless UX

### 🟢 Front 6: Documentation (虛實 - Weaknesses and Strengths)

- README with deployment guide
- Inline code comments
- Updated SOPs
- Goal: Self-documenting

## Victory Criteria

```bash
# Must all return 0
grep -r "console\." src | wc -l  # Tech debt
grep -r "TODO\|FIXME" src | wc -l  # TODOs
grep -r ": any" src | wc -l  # Type safety
```

## 🚀 GO-LIVE Verification (STRICT ENFORCEMENT)

> ⚠️ **BẮT BUỘC**: CC CLI PHẢI giám sát CI/CD đến khi DEPLOY GREEN mới được báo cáo!  
> Không được "báo cáo láo" - phải chờ thực sự xong!

### 🔴 CRITICAL: CI/CD Monitoring Loop

**CC CLI MUST execute this polling loop until GREEN:**

```bash
# POLLING LOOP - Run until success or timeout (5 min max)
MAX_ATTEMPTS=10
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "=== Attempt $ATTEMPT/$MAX_ATTEMPTS ==="

  # Check GitHub Actions status
  STATUS=$(gh run list -L 1 --json status,conclusion -q '.[0]' 2>/dev/null)
  echo "GitHub Actions: $STATUS"

  # Check if completed and successful
  if echo "$STATUS" | grep -q '"conclusion":"success"'; then
    echo "✅ CI/CD GREEN - Deploy confirmed!"
    break
  fi

  # Wait 30 seconds before next check
  echo "⏳ Waiting 30s for deploy..."
  sleep 30
done
```

### 🔴 KHÔNG ĐƯỢC báo cáo success nếu chưa chạy lệnh verify!

**Trước khi report GO-LIVE, CC CLI PHẢI:**

1. **Chạy lệnh thực tế** - không được giả định
2. **Show output** - phải hiển thị kết quả command
3. **Poll đến khi green** - không timeout sớm
4. **Verify production URL** - check thực tế trên web

### Vercel Verification Commands (MANDATORY)

```bash
# 1. Get latest deployment
DEPLOY_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' || echo "Check manually")
echo "Deploy URL: $DEPLOY_URL"

# 2. Check deployment state
vercel inspect "$DEPLOY_URL" --json 2>/dev/null | jq '.readyState' || echo "PENDING"

# 3. Curl production to verify live
curl -sI "https://$DEPLOY_URL" | head -5
```

### GitHub Actions Verification (MANDATORY)

```bash
# Run until conclusion=success
gh run watch $(gh run list -L 1 --json databaseId -q '.[0].databaseId') || \
  gh run list -L 1 --json status,conclusion,name
```

### Production Health Check (MANDATORY)

```bash
# Actual curl test - not optional!
PROD_URL="https://com-anh-duong.vercel.app"  # UPDATE THIS
HTTP_STATUS=$(curl -sI "$PROD_URL" | head -1 | awk '{print $2}')
echo "Production HTTP: $HTTP_STATUS"
[ "$HTTP_STATUS" = "200" ] && echo "✅ LIVE!" || echo "❌ NOT LIVE"
```

### ❌ FORBIDDEN Actions

- ❌ Report "Ready for GO-LIVE" without running verification commands
- ❌ Skip CI/CD check and assume success
- ❌ Report success before GitHub Actions completes
- ❌ Không chờ Vercel deploy xong đã báo cáo

### ✅ REQUIRED Report Format

When reporting GO-LIVE status, MUST include:

```
## CI/CD Verification Log
- GitHub Actions: [STATUS] [CONCLUSION] (link)
- Vercel Deploy: [URL] [STATE]
- HTTP Check: [STATUS_CODE]
- Timestamp: [ACTUAL_TIME]
```

---

## Commit Convention

```
refactor: 10x bootstrap - [specific change]
```

---

## CC CLI Input Protocol

**QUAN TRỌNG**: Khi gửi lệnh cho CC CLI qua `send_command_input`:

- **Dòng 1**: Lệnh/text
- **Dòng 2**: `\n` (Enter riêng)
- **KHÔNG** gộp chung lệnh + enter → CC CLI không hiểu

```typescript
// ❌ SAI
Input: "git commit -m 'message'\n";

// ✅ ĐÚNG
Input: "git commit -m 'message'";
// wait for response...
Input: "\n"; // Enter riêng
```
