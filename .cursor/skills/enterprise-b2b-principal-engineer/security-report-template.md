# Security Report Template

Use after every implementation or PR review.

```markdown
# Security Report — [Feature/PR Name]

**Date:** [YYYY-MM-DD]
**Reviewer:** Principal Engineer
**Scope:** [Files/modules reviewed]

## Executive Summary
[One paragraph: overall risk level — Low / Medium / High]

## Findings

| Severity | Category | Finding | Location | Remediation |
|----------|----------|---------|----------|-------------|
| Critical | [e.g. SQL Injection] | [Description] | [file:line] | [Fix] |
| High | | | | |
| Medium | | | | |
| Low | | | | |

## Checklist

- [ ] SQL Injection — parameterized queries, no raw user input in SQL
- [ ] XSS — output encoding, CSP, sanitized rich text
- [ ] CSRF — tokens on state-changing requests
- [ ] Authentication — secure session, MFA where required
- [ ] Authorization — RBAC enforced server-side
- [ ] Session Management — secure cookies, rotation, expiry
- [ ] RLS — Supabase row-level security policies active
- [ ] Supabase Policies — least-privilege per role
- [ ] Secrets — no keys in client bundle or git
- [ ] Cookies — HttpOnly, Secure, SameSite
- [ ] Headers — HSTS, X-Frame-Options, CSP
- [ ] Environment Variables — server-only for sensitive values
- [ ] Rate Limiting — applied to auth and public APIs
- [ ] Redirect attacks — allowlist redirect URLs

## Verdict

- [ ] **Approved** — no critical/high issues
- [ ] **Conditional** — fix listed items before merge
- [ ] **Rejected** — insecure code; do not merge
```
