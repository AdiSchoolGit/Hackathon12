#!/bin/bash
# Syntax Check Script for cards.js
# This script checks for syntax errors using Node.js compiler

echo "🔍 Checking syntax in cards.js..."

# Check Node.js syntax (most reliable check - catches all syntax errors)
SYNTAX_OUTPUT=$(node -c src/routes/cards.js 2>&1)
SYNTAX_EXIT=$?

if [ $SYNTAX_EXIT -ne 0 ]; then
    echo "❌ ERROR: Syntax check failed"
    echo "$SYNTAX_OUTPUT"
    echo ""
    echo "💡 Tip: Look for '? .' (with space) - it should be '?.' (no space)"
    exit 1
fi

echo "✅ Syntax check passed!"
exit 0

