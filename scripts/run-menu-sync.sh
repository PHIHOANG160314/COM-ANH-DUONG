#!/bin/bash
# Auto-run menu sync script non-interactively

export VITE_SUPABASE_URL="https://rnhtfaxqnvikedwufvcd.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk"

# Auto-answer "yes" to confirmation prompt
echo "yes" | python3 scripts/sync-menu-v2.py
