# Repository & Merge Request Workflow (Demo Guide)

This guide walks you through the end-to-end lifecycle in the platform using the new demo seed endpoint.

## 1. Seed Demo Data
Call (authenticated) POST http://localhost:8000/api/demo/seed
Response includes repository id plus several merge requests in different states:
- approved (open)
- needs_review (open)
- pending (open – can run validation)
- closed (historical)
- merged (historical)

If the repository already exists, the endpoint is idempotent and only returns existing data.

## 2. Repository Concept ("Case")
A repository acts as an OSINT case container:
- Markdown reports, IOC JSON files, timelines, analysis notes.
- Future: audit history, settings, collaborator roles.

The UI New Case button triggers the create repository modal.

## 3. Creating a Repository
Via UI: New Case (sidebar) or New Repository button on Repositories page.
Backend: POST /api/repositories/ { name, description, is_private }
Returns repository with owner + collaborators.

## 4. Adding / Editing Files (Planned Enhancements)
For now files are seeded; future flows will:
- Create or update repository files.
- Track versions (file_versions table already exists).
- Generate commit graph and link commits to merge requests.

## 5. Creating a Merge Request
POST /api/merge-requests/ with:
- title, description
- source_repo_id, target_repo_id (same id for intra-repo changes in current model)
Router immediately triggers AI validation (EnhancedAIService.validate_merge_request).
AI sets: status (approved|rejected|needs_review|pending) + score + feedback + suggestions.
On AI failure: fallback status needs_review with error feedback.

## 6. AI Validation Meaning
Fields displayed:
- ai_validation.status: pending, approved, rejected, needs_review
- ai_validation.score: overall normalized score
- feedback: reasoning or failure explanation
- suggestions: actionable improvements
Merge is blocked if status is rejected or needs_review (enforced in merge endpoint with reason ai_validation_block).

Re-run validation: POST /api/merge-requests/{id}/validate
- Recomputes analysis; updates ai_validation_* columns.

## 7. Updating a Merge Request
PUT /api/merge-requests/{id} to change title/description/status (limited usage now).
Each update snapshots a version row in merge_request_versions for audit + future diff view.

## 8. Merging
POST /api/merge-requests/{id}/merge
Requirements:
- Current user owns target repository
- MR status == open
- ai_validation.status NOT in { rejected, needs_review }
On success: status -> merged, audit entry + webhook fire.
On failure: structured JSON error with reason (not_target_owner | invalid_status | ai_validation_block).

## 9. Closing
POST /api/merge-requests/{id}/close (author OR target owner). Sets status closed.

## 10. Version Restore
POST /api/merge-requests/{id}/restore/{version_number}
Pushes current state to a new version, then restores specified version fields.

## 11. Comments (Inline Review Foundation)
POST /api/merge-requests/{id}/comments { content, (optional) line_number, file_path }
Returns comment with author; designed for future diff annotation.

## 12. AI Service Internals (Simplified)
EnhancedAIService.validate_merge_request -> validate_merge_request_with_documents:
- Builds contextual prompt (repo descriptions + summarized file changes + document content placeholder)
- Expects JSON with decision + scores + arrays. Attempts to parse JSON; falls back to heuristic extraction.
- On any exception returns needs_review with diagnostic suggestion.

## 13. Typical Analyst Flow
1. Create New Case (repository) with initial description.
2. Add baseline files (README, indicators.json, timeline.md).
3. Create Merge Request describing new analysis or IOC additions.
4. Review AI feedback:
   - If approved & accurate -> request repository owner to merge.
   - If needs_review/rejected -> apply suggested improvements, re-run validation.
5. Repository owner merges once non-blocking.
6. (Future) Commit graph & file versioning reflect merged state.

## 14. Trying It Now
1. Seed: POST /api/demo/seed
2. List MRs: GET /api/merge-requests?repository_id=<repo_id>
3. Pick the pending MR -> POST /api/merge-requests/{id}/validate
4. Attempt merge on approved vs needs_review to see enforcement.

## 15. Roadmap Enhancements
- File diff viewer + change attribution feeding AI with real diffs
- Override merge with admin justification trail
- Store raw ai_analysis text for advanced auditing (column already returned in service; persistence pending)
- Per-field scoring visualization (relevance / accuracy / completeness bars)
- Repository-level risk / quality aggregate scoring
- Real commit ingestion & graph-driven context for AI

## 16. Glossary
Repository (Case): Container for all investigation artifacts.
Merge Request: Proposed change set / analysis addition to a case.
AI Validation: Automated triage guiding human reviewers and gating merges.
Version: Snapshot of MR state after each update or restore.

---
Use this document while exploring the seeded demo to understand each stage.
