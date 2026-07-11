# Pull Request Review Template

Use for every PR review. Never allow poor-quality code.

```markdown
# PR Review — [PR Title]

**Author:** [name]
**Reviewer:** Principal Engineer
**Date:** [YYYY-MM-DD]

## Summary
[What this PR does and why]

## Review Checklist

### Architecture
- [ ] Follows Clean Architecture and SOLID
- [ ] Reuses existing components, hooks, services, utilities, types
- [ ] No code duplication
- [ ] Server Components preferred; Client only when needed
- [ ] Server Actions for mutations

### Performance
- [ ] Images optimized
- [ ] Bundle size acceptable (dynamic imports where appropriate)
- [ ] Database queries optimized (no N+1)
- [ ] Caching applied where appropriate
- [ ] Lighthouse targets met

### Security
- [ ] Input validated with Zod
- [ ] No secrets exposed
- [ ] RBAC enforced server-side
- [ ] RLS policies correct
- [ ] See security report (if applicable)

### Maintainability
- [ ] Clear naming
- [ ] Functions under 50 lines
- [ ] Components under 300 lines
- [ ] No `any` types
- [ ] ESLint and TypeScript not disabled

### Testing
- [ ] Unit tests present
- [ ] Integration tests for critical paths
- [ ] Edge cases covered
- [ ] See test report (if applicable)

### Documentation
- [ ] Implementation plan was explained
- [ ] Deployment impact documented if needed

## Findings

### Critical (must fix)
- [ ] [Finding]

### Suggestions (consider)
- [ ] [Suggestion]

### Improvements (optional)
- [ ] [Improvement]

## Verdict

- [ ] **Approved**
- [ ] **Request Changes**
- [ ] **Rejected**
```
