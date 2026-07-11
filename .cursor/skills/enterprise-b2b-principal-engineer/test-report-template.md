# Test Report Template

Use after every feature implementation.

```markdown
# Test Report — [Feature Name]

**Date:** [YYYY-MM-DD]
**Scope:** [Modules/endpoints/components tested]

## Summary

| Type | Planned | Passed | Failed | Skipped |
|------|---------|--------|--------|---------|
| Unit | | | | |
| Integration | | | | |
| Security | | | | |
| Accessibility | | | | |
| Regression | | | | |
| Performance | | | | |

## Test Cases

### Unit Tests
- [ ] [Test description] — PASS / FAIL

### Integration Tests
- [ ] [Test description] — PASS / FAIL

### Security Tests
- [ ] Unauthorized access blocked
- [ ] Invalid input rejected (Zod validation)
- [ ] RBAC enforced per role

### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] Color contrast (WCAG AA)

### Edge Cases
- [ ] Empty state
- [ ] Error state
- [ ] Loading state
- [ ] Large datasets / pagination
- [ ] Concurrent requests

### Performance Tests
- [ ] Lighthouse Performance 95+
- [ ] No N+1 database queries
- [ ] Bundle size acceptable

## Verdict

- [ ] **Approved** — all critical tests pass
- [ ] **Conditional** — fix failures before merge
- [ ] **Rejected** — insufficient test coverage
```
