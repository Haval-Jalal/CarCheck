#!/bin/bash
# Smoke test script for CarCheck API
# Usage: ./smoke-test.sh <base_url>
# Example: ./smoke-test.sh https://staging.carcheck.se

BASE_URL="${1:-http://localhost:8080}"
PASSED=0
FAILED=0

check() {
    local name="$1"
    local method="$2"
    local url="$3"
    local expected_status="$4"
    local data="$5"

    if [ -n "$data" ]; then
        actual_status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
    else
        actual_status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
    fi

    if [ "$actual_status" = "$expected_status" ]; then
        echo "✓ PASS: $name (expected $expected_status, got $actual_status)"
        PASSED=$((PASSED + 1))
    else
        echo "✗ FAIL: $name (expected $expected_status, got $actual_status)"
        FAILED=$((FAILED + 1))
    fi
}

echo "========================================="
echo "CarCheck API Smoke Tests"
echo "Base URL: $BASE_URL"
echo "========================================="
echo ""

# Health check
check "Health endpoint" GET "$BASE_URL/health" 200

# Auth endpoints (should return 400 for empty body, not 500)
check "Register (empty body)" POST "$BASE_URL/api/auth/register" 400 "{}"
check "Login (empty body)" POST "$BASE_URL/api/auth/login" 400 "{}"

# Protected endpoints (should return 401 without token)
check "Car search (no auth)" POST "$BASE_URL/api/cars/search" 401 '{"registrationNumber":"ABC123"}'
check "Favorites (no auth)" GET "$BASE_URL/api/favorites" 401
check "History (no auth)" GET "$BASE_URL/api/history" 401
check "Subscription (no auth)" GET "$BASE_URL/api/billing/subscription" 401

# Public endpoints
check "Get tiers (public)" GET "$BASE_URL/api/billing/tiers" 200

echo ""
echo "========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "========================================="

if [ "$FAILED" -gt 0 ]; then
    exit 1
fi
