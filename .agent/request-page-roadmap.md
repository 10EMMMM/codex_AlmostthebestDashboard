# Request Page - Feature Roadmap

## ✅ Completed Features

### Core Functionality
- [x] View all requests in Kanban board layout
- [x] Create new requests
- [x] View request details
- [x] Edit request details
- [x] BDR assignment/unassignment
- [x] City selection for account managers
- [x] Account manager selection (for super admins)
- [x] Request type categorization
- [x] Volume tracking
- [x] Company information

### Code Quality
- [x] Phase 1: Extract type definitions
- [x] Phase 2: Extract stateless UI components
- [x] Phase 3: Extract business logic to hooks
- [x] Reduce page from 1343 → 314 lines (76% reduction)

---

## 🚀 Planned Features (Backlog)

### Priority 1: Core Enhancements
- [x] **Request Status Management**
  - [x] Add status field (new, ongoing, on hold, done)
  - [x] Status update dialog (separate from edit form)
  - [x] Visual status indicators with color coding
  - [x] Toast notifications for status changes
  - [x] Status workflow/transitions (validation)
  - [x] Status change audit trail (database recording)
  - [ ] Status history UI component (optional enhancement)

- [x] **Advanced Filtering & Search** ✅ COMPLETE
  - [x] Filter by request type (dropdown)
  - [x] Filter by status (dropdown)
  - [x] Text search (title, company, requester)
  - [x] Active filter chips (color-coded)
  - [x] Clear all filters button
  - [x] **Integrated into page.tsx**
  - [ ] Filter by date range (future enhancement)
  - [ ] Save filter presets (future enhancement)

- [x] **Sorting & Ordering** ✅ COMPLETE
  - [x] Sort by date (created, updated)
  - [x] Sort by title (alphabetical)
  - [x] Sort by company (alphabetical)
  - [x] Sort by volume (numerical)
  - [x] Ascending/descending toggle
  - [x] **Integrated into page.tsx**
  - [ ] Remember sort preferences (future enhancement)
  - [ ] Per-column sorting (future enhancement)

### Priority 2: Productivity Features
- [ ] **Bulk Operations**
  - [ ] Select multiple requests (checkboxes)
  - [ ] Bulk assign BDRs
  - [ ] Bulk status updates
  - [ ] Bulk delete/archive
  - [ ] Select all/deselect all

- [x] **Comments & Notes** ✅ COMPLETE
  - [x] Add internal notes to requests
  - [x] Comment threads with replies (3 levels deep)
  - [x] @mentions for team members with autocomplete
  - [x] Comment timestamps (relative time)
  - [x] Edit/delete comments (own comments only)
  - [x] Emoji reactions (👍, ❤️, 🎉, 👀, 🚀, 😄)
  - [x] Real-time updates via Supabase subscriptions
  - [x] Role-based visibility (super_admin, assigned BDR, feature flag)
  - [x] Run database migration
  - [ ] Notification system for mentions (future enhancement)

- [x] **Multi-Select BDR Assignment** ✅ COMPLETE
  - [x] Assign multiple BDRs to a single request
  - [x] Search/Filter BDRs in assignment dialog
  - [x] Real-time updates on assignment

- [ ] **Request Templates**
  - [ ] Create request from template
  - [ ] Save request as template
  - [ ] Template library
  - [ ] Template categories

### Priority 3: Collaboration Features
- [ ] **Activity Log / Audit Trail**
  - [ ] Track all changes to requests
  - [ ] Show who made changes and when
  - [ ] View change history
  - [ ] Revert changes (if needed)

- [ ] **Notifications**
  - [ ] Email notifications for assignments
  - [ ] In-app notifications
  - [ ] Notification preferences
  - [ ] Notification center/bell icon

- [ ] **Team Collaboration**
  - [ ] Assign multiple team members
  - [ ] Request ownership transfer
  - [ ] Watchers/followers
  - [ ] Team mentions in comments

### Priority 4: Advanced Features
- [ ] **File Attachments**
  - [ ] Upload documents to requests
  - [ ] View/download attachments
  - [ ] File preview (images, PDFs)
  - [ ] Attachment size limits
  - [ ] Multiple file upload

- [ ] **Analytics & Reporting**
  - [ ] Request metrics dashboard
  - [ ] Export to CSV/Excel
  - [ ] Charts and visualizations
  - [ ] Custom reports
  - [ ] Date range filtering for reports

- [ ] **Performance Optimization**
  - [ ] Implement React Query for caching
  - [ ] Virtualization for large lists
  - [ ] Optimistic updates
  - [ ] Loading skeletons
  - [ ] Suspense boundaries

### Priority 5: Quality & Testing
- [ ] **Testing**
  - [ ] Unit tests for hooks
  - [ ] Component tests
  - [ ] Integration tests
  - [ ] E2E tests for critical flows

- [ ] **Documentation**
  - [ ] JSDoc comments for all hooks
  - [ ] Storybook stories for components
  - [ ] Architecture documentation
  - [ ] Usage guides

---

## 📊 Other Pages to Refactor (Later)

> **Note**: These are deferred until request page features are complete

- [ ] Audit all page files for line count
- [ ] Identify pages > 500 lines
- [ ] Create refactoring plan for each page
- [ ] Apply Phase 1-3 refactoring pattern
- [ ] Document refactoring results

---

## 🎯 Next Steps

1. Review this roadmap and prioritize features
2. Pick the next feature to implement
3. Create implementation plan
4. Build and test
5. Repeat until request page is feature-complete
6. Then refactor other pages as needed

---

## 📝 Notes

- Always check page line count before adding features
- If page exceeds 500 lines, refactor before adding more features
- Test thoroughly after each feature
- Document changes in walkthrough.md
- Keep task.md updated with progress
