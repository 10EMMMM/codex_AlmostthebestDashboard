# Refactoring Plan

This document tracks files identified as candidates for refactoring due to size, complexity, or mixed concerns.

## High Priority

### 1. `src/components/features/requests/create-request-form.tsx`
- **Current Size**: ~662 lines
- **Issues**: 
  - Mixes complex form state management, data fetching (Account Managers, Cities), and UI rendering.
  - Large `render` method with conditional logic for "Proxy Creation" feature.
- **Refactoring Strategy**:
  - **Extract Hook**: Create `useCreateRequestForm` to handle form state, validation, and submission logic.
  - **Extract Components**:
    - `RequestTypeSelector`: For the 3-column type selection.
    - `LocationSelector`: For Account Manager and City selection logic.
    - `RequestDetailsInputs`: For title, description, company, volume, etc.

### 2. `src/components/features/requests/RequestEditForm.tsx`
- **Current Size**: ~440 lines
- **Issues**:
  - Similar to `create-request-form`, mixes data fetching and form logic.
  - Duplicates some UI patterns from the create form.
- **Refactoring Strategy**:
  - **Extract Hook**: Create `useRequestEditForm`.
  - **Share Components**: Reuse `LocationSelector` and `RequestDetailsInputs` from the create form refactor if possible (or create shared generic components).

## Medium Priority

### 3. `src/app/request/page.tsx`
- **Current Size**: ~405 lines
- **Issues**:
  - Contains heavy filtering (`filterRequests`) and sorting logic inline.
  - Manages multiple modal states (Create, Edit, Status, BDR).
- **Refactoring Strategy**:
  - **Extract Hook**: Move filtering and sorting to `useRequestFilters`.
  - **Extract Component**: Extract the `KanbanBoard` layout into its own component to declutter the main page.

### 4. `src/components/features/requests/CommentItem.tsx`
- **Current Size**: ~285 lines
- **Issues**:
  - Handles display, reply input, edit input, and delete confirmation all in one.
  - Complex "mention highlighting" logic inside the render.
- **Refactoring Strategy**:
  - **Extract Logic**: Move mention parsing/rendering to a utility or small sub-component.
  - **Extract Component**: Create `CommentReplyForm` and `CommentEditForm` to isolate input logic.

## Tracking

- [x] Refactor `create-request-form.tsx`
- [ ] Refactor `RequestEditForm.tsx`
- [ ] Refactor `RequestPage.tsx`
- [x] Refactor `CommentItem.tsx`
