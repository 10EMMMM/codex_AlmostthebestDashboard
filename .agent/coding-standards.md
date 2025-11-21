# Coding Standards & Best Practices

## File Size & Refactoring Rules

### 🚨 500-Line Rule
**Any page file exceeding 500 lines MUST be refactored.**

**Refactoring Process:**
1. **Phase 1**: Extract type definitions to separate `types.ts` file
2. **Phase 2**: Extract stateless UI components
   - Create reusable components in `@/components/features/[feature-name]/`
   - Extract shared constants to `constants.ts`
   - Extract utility functions to `utils.ts`
3. **Phase 3**: Extract business logic to custom hooks
   - Create hooks in `@/hooks/`
   - Each hook should have a single responsibility
   - Hooks should be reusable and testable

**Target**: Reduce page files to under 400 lines after refactoring

---

## Code Organization

### Component Structure
```
src/
├── app/
│   └── [feature]/
│       └── page.tsx          # Main page (< 400 lines)
├── components/
│   ├── features/
│   │   └── [feature]/
│   │       ├── ComponentName.tsx
│   │       ├── types.ts
│   │       ├── constants.ts
│   │       └── utils.ts
│   └── ui/                   # Shared UI components
└── hooks/
    └── useFeatureName.ts     # Custom hooks
```

### Hook Guidelines
- One hook per file
- Clear, descriptive names (use[Feature][Purpose])
- Export interface/return type
- Include JSDoc comments
- Handle errors gracefully
- Provide loading states

### Component Guidelines
- Stateless when possible
- Single responsibility
- Props interface defined
- TypeScript strict mode
- Reusable across features

---

## Development Workflow

### Before Adding Features
1. ✅ Check current page line count
2. ✅ If > 500 lines, refactor FIRST before adding features
3. ✅ If < 500 lines, proceed with feature development
4. ✅ After adding feature, check if refactoring is needed

### Feature Development Priority
1. **Complete current feature** before refactoring other pages
2. **Test thoroughly** after each feature
3. **Document changes** in walkthrough
4. **Refactor when needed**, not preemptively

---

## Quality Standards

### Build Requirements
- ✅ `npm run build` must pass with exit code 0
- ✅ No TypeScript errors
- ✅ No ESLint errors (warnings acceptable)

### Testing Requirements
- ✅ Manual testing for all user flows
- ✅ Verify no regressions
- ✅ Test error states and edge cases

### Documentation Requirements
- ✅ Update walkthrough.md after major changes
- ✅ Update task.md to track progress
- ✅ Add comments for complex logic

---

## Current Status

### Request Page
- **Status**: ✅ Refactored (Phase 2 & 3 complete)
- **Lines**: 314 (was 1343)
- **Next**: Complete remaining features before refactoring other pages

### Other Pages
- **Status**: ⏸️ Deferred until request page features are complete
- **Action**: Audit and refactor when request page is finished
