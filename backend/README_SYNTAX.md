# Syntax Protection for cards.js

## ⚠️ CRITICAL: Optional Chaining Syntax

The `cards.js` file uses optional chaining (`?.`) throughout. **NEVER use spaces** in optional chaining operators.

### ❌ WRONG (will cause syntax errors):
```javascript
manualRedId ? .trim()
extractedInfo ? .redId
owner ? .email
```

### ✅ CORRECT:
```javascript
manualRedId?.trim()
extractedInfo?.redId
owner?.email
```

## Safeguards in Place

1. **VS Code Settings** (`.vscode/settings.json`):
   - Auto-formatting disabled for JavaScript
   - Format on save/paste/type disabled
   - Prevents formatters from adding spaces

2. **Syntax Check Script** (`check-syntax.sh`):
   - Run `npm run check-syntax` to verify syntax
   - Automatically runs before `npm start`
   - Checks for spaces in optional chaining operators

3. **Pre-commit Hook** (`.husky/pre-commit`):
   - Runs syntax check before git commits
   - Prevents committing broken code

4. **File Header Warning**:
   - Clear documentation at top of `cards.js`
   - Reminds developers about the syntax requirement

## How to Use

### Before Starting Server:
```bash
npm run check-syntax  # Manual check
npm start            # Automatically runs check-syntax first
```

### If You See Syntax Errors:
1. Check for `? .` (with space) in your code
2. Replace with `?.` (no space)
3. Run `npm run check-syntax` to verify
4. Check VS Code settings if auto-formatting is enabled

## Common Issues

- **"SyntaxError: Unexpected token '.'"** → Look for `? .` (with space)
- **Auto-formatter adding spaces** → Check `.vscode/settings.json`
- **Syntax check failing** → Run `npm run check-syntax` for details

