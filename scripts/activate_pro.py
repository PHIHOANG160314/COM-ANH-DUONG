#!/usr/bin/env python3
"""
🚀 Gemini Pro License Activation Script
========================================

Activates Gemini PRO tier license for specified email(s).
Stores license in ~/.mekong/license.json for offline CLI usage.
Supports multiple emails - new emails are merged with existing ones.

Usage:
    python3 scripts/activate_pro.py <email1> [email2] ...
    python3 scripts/activate_pro.py gaogavi01@gmail.com confarm07@gmail.com

PRO Tier (Google AI Studio):
- 1,500 requests/day (RPD)
- 15 requests/minute (RPM)
- 1M tokens/minute (TPM)
"""

import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path


# Pro tier limits from Google AI Studio
PRO_TIER_LIMITS = {
    "requests_per_day": 1500,
    "requests_per_minute": 15,
    "tokens_per_minute": 1_000_000,
    "monthly_api_calls": 45000,  # 1500 RPD * 30 days
    "api_access": True,
    "priority_support": False,
}


def generate_license_key(emails: list, tier: str = "pro") -> str:
    """Generate deterministic license key from emails."""
    sorted_emails = sorted(emails)
    hash_input = f"{','.join(sorted_emails)}-{tier}-gemini"
    hash_suffix = hashlib.sha256(hash_input.encode()).hexdigest()[:8].upper()
    return f"GEMINI-{tier.upper()}-{hash_suffix}"


def load_existing_license() -> dict | None:
    """Load existing license if it exists."""
    license_file = Path.home() / ".mekong" / "license.json"
    if license_file.exists():
        try:
            with open(license_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return None
    return None


def activate_pro(new_emails: list) -> dict:
    """
    Activate Gemini PRO tier license for email(s).
    Merges with existing emails if license already exists.
    """
    license_dir = Path.home() / ".mekong"
    license_file = license_dir / "license.json"

    # Ensure directory exists
    license_dir.mkdir(parents=True, exist_ok=True)

    # Load existing license and merge emails
    existing = load_existing_license()
    if existing and "emails" in existing:
        all_emails = list(set(existing["emails"]) | set(new_emails))
    elif existing and "email" in existing:
        all_emails = list(set([existing["email"]]) | set(new_emails))
    else:
        all_emails = list(set(new_emails))

    all_emails = sorted(all_emails)

    # Generate license key
    license_key = generate_license_key(all_emails, "pro")

    # Create license data
    license_data = {
        "key": license_key,
        "tier": "pro",
        "tier_name": "Gemini Pro",
        "emails": all_emails,
        "activated_at": datetime.now().isoformat(),
        "status": "active",
        "limits": PRO_TIER_LIMITS,
    }

    # Save to file
    with open(license_file, "w", encoding="utf-8") as f:
        json.dump(license_data, f, indent=2)

    return license_data


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 activate_pro.py <email1> [email2] ...")
        print("Example: python3 activate_pro.py gaogavi01@gmail.com confarm07@gmail.com")
        sys.exit(1)

    emails = sys.argv[1:]

    print(f"🚀 Activating Gemini PRO license for {len(emails)} email(s)")
    print("=" * 55)

    result = activate_pro(emails)

    print("✅ License activated!")
    print(f"   Key: {result['key']}")
    print(f"   Tier: {result['tier_name']}")
    print(f"   Status: {result['status']}")
    print()
    print("📧 Licensed Emails:")
    for email in result['emails']:
        print(f"   • {email}")
    print()
    print("📊 Gemini Pro Limits:")
    limits = result['limits']
    print(f"   Requests/Day (RPD): {limits['requests_per_day']:,}")
    print(f"   Requests/Min (RPM): {limits['requests_per_minute']}")
    print(f"   Tokens/Min (TPM): {limits['tokens_per_minute']:,}")
    print(f"   Monthly API Calls: ~{limits['monthly_api_calls']:,}")
    print()
    print("📁 License saved to: ~/.mekong/license.json")
    print()
    print("🚀 Now restart Antigravity IDE to apply changes!")


if __name__ == "__main__":
    main()
