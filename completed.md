# Nexus HRM — Completed Features

This file records the features currently implemented in the application.

## Platform and infrastructure

- React + Vite frontend with Tailwind CSS.
- Express REST API with Prisma ORM.
- PostgreSQL running through Docker Compose.
- Adminer database console through Docker Compose.
- Docker Postgres defaults to host port `55432`.
- Committed Prisma migrations and repeatable seed script.
- One-command setup with `./scripts/setup.sh`.
- Concurrent development startup with `./scripts/run-dev.sh`.
- Database reset, backup, and test helper scripts.
- Environment examples and full setup instructions in `README.md` and `steps.md`.

## Authentication and authorization

- JWT authentication stored in an httpOnly cookie.
- bcrypt password hashing.
- Login, logout, and current-session endpoints.
- Protected frontend routes.
- Backend role enforcement for `ADMIN`, `MANAGER`, and `EMPLOYEE`.
- Role-specific navigation and redirects.

## Shared frontend experience

- Responsive Nexus HRM application shell.
- Desktop sidebar and mobile navigation drawer.
- Organization and account context in the navigation rail.
- Shared page headers, stat cards, tables, badges, error states, and buttons.
- Semantic color tokens for primary, success, warning, destructive, surface, border, and sidebar states.
- Consistent focus rings, disabled states, compact controls, table overflow, and empty states.
- Lucide icons with accessible labels for icon-only controls.
- Login password visibility toggle and inline error handling.
- Responsive layout for desktop, tablet, and mobile widths.

## Employee and organization management

- Admin employee directory.
- Employee search by name, email, or designation.
- Department filter and filter reset.
- Employee create, edit, and delete flows.
- Employee role, manager, department, account, and salary fields.
- Department create, rename, and delete flows.
- Employee profile editing for allowed personal fields.
- Role-aware employee visibility.

## Attendance

- Employee check-in.
- Employee check-out.
- Own attendance history.
- Manager team attendance view.
- Admin company-wide attendance view through the API.
- Attendance status tracking for present, late, absent, and half-day records.
- Date-range and employee filters on the admin attendance API.

## Leave management

- Employee leave application.
- Own leave history.
- Manager pending leave queue for direct reports.
- Admin pending/all leave visibility.
- Approve and reject actions with backend authorization checks.
- Leave types: sick, casual, annual, and unpaid.
- Pending, approved, and rejected status presentation.

## Recruitment

- Job opening creation, editing through status changes, and deletion.
- Candidate creation and pipeline stage updates.
- Candidate filtering by job opening through the API.
- Recruitment summary metrics.
- Admin and manager recruitment access controls.

## Reports

- Company and team report scopes.
- Headcount reporting.
- Department headcount reporting.
- Attendance status reporting.
- Leave type reporting.
- Recruitment stage reporting.

## Payroll

- Salary structures for employees.
- Seeded salary structures for all demo employees.
- Decimal-backed salary and payslip values.
- Monthly payroll generation.
- Working-day calculation excluding Saturdays.
- Present and half-day attendance calculations.
- Paid sick/casual/annual leave handling.
- Unpaid leave and unexplained absence deductions.
- Late deduction after the three-late monthly grace allowance.
- Gross pay, deductions, and net pay calculation.
- Draft payroll runs.
- Payroll finalization and recalculation lock.
- Idempotent draft regeneration for the same month/year.
- Admin payroll history and payslip breakdown.
- Employee finalized payslip history with expandable details.
- API protection so employees only see their own finalized payslips.

## Quality and verification

- Existing Selenium page-object QA suite for auth, CRUD, attendance, and leave workflows.
- Existing Postman/Newman API regression setup.
- Client production build passes.
- Prisma schema validation passes.
- Prisma migrations apply cleanly to Docker Postgres.
- Server JavaScript syntax checks pass.
- Payroll lifecycle manually verified against seeded Docker data:
  - 9 employees produce 9 payslips.
  - Draft payroll finalizes successfully.
  - Recalculation after finalization returns `409`.
- Employees receive finalized payslip data only.

## Phase 2 operations and compliance

- Holiday calendar with admin CRUD and year filtering.
- Nine seeded Nepali public holidays for the current year.
- Holidays excluded from payroll working-day calculations.
- Shared upcoming-holiday dashboard widget.
- Payroll trend, leave trend, and attendance trend API endpoints.
- Reports trends page with selectable 3, 6, and 12 month ranges.
- Empty states for missing finalized payroll and historical trend data.
- Local employee document storage under `server/uploads/documents/{employeeId}`.
- Document upload with file type, metadata, and optional expiry date.
- Employee document list, download authorization, and admin deletion.
- Expiring-document API and admin dashboard alert widget.
- Company-wide and department-specific announcements.
- Announcement expiry filtering and role-aware visibility.
- Admin announcement management page.
- Audit log model and paginated admin API.
- Audit entries for employee changes, leave decisions, payroll finalization, announcements, and document deletion/upload.
- Admin audit log page with target-type filtering.

## Not implemented / intentionally deferred

- Payslip PDF export is outside the current scope.
- Email and SMS notifications are outside the current scope.
- AI/ML features are intentionally excluded.
- Mobile native application is not included.
- Biometric attendance integration is not included.
