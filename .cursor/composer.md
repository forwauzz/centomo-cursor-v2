\# CentomoMD V2 Development Rules



\## Workflow Requirements

\- ALWAYS use `orchestrate\_workflow` before making code changes

\- Verify context with `verify\_context\_with\_memory` before suggestions

\- Record architecture decisions with `record\_architecture\_decision`

\- Check compliance with `manage\_compliance` for data-related changes



\## Compliance Requirements

\- All medical data handling must be PIPEDA/HIPAA compliant

\- Encryption required for sensitive data

\- Audit logging for all data operations

\- User consent mechanisms required



\## V2 Architecture

\- Frontend: React + TypeScript

\- Backend: Node.js + Express + Supabase

\- Database: Supabase (PostgreSQL) with RLS

\- Hosting: Replit

