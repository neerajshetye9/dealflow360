# DealFlow360 â€” Multi-Account Git & GitHub Engineering Workflow

## 1. Architecture of the Local Setup
To safely support three distinct GitHub accounts on a single Windows workstation without identity cross-contamination:
- Three independent repository folders exist under `D:\DealFlow360\`:
  - `dealflow-neeraj` (Identity: `neerajshetye9`, Remote: `git@github-neeraj:...`)
  - `dealflow-atharva` (Identity: `atharvashirke18`, Remote: `git@github-atharva:...`)
  - `dealflow-vignesh` (Identity: `vignesh752006`, Remote: `git@github-vignesh:...`)
- OpenSSH is configured in `~/.ssh/config` with strict `IdentitiesOnly yes` directives.
- Git global configuration is **NEVER** used for identities. All identities are set locally (`git config --local user.name` and `user.email`).

---

## 2. Branch Hierarchy & Protection Rules
- **`main`**: Production release branch. Strictly protected. No developer may push directly to `main`.
- **`develop`**: Shared integration branch. All feature branches branch off `develop` and merge back into `develop` via Pull Requests.
- **Feature Branches**:
  - `feature/neeraj-auth-configuration-approval-negotiation`
  - `feature/atharva-sales-workspace-intelligence`
  - `feature/vignesh-fulfillment-billing-reporting`

---

## 3. Daily Developer Routine
Before beginning any code changes:
```powershell
# In your respective repository folder:
git status
git fetch origin
git switch develop
git pull origin develop
git switch <your-feature-branch>
git merge develop
```

Before committing:
```powershell
git status
git diff
# Stage only intentional files (Avoid git add .)
git add <path/to/files>
git commit -m "<type>(<scope>): <clear descriptive message>"
```

Before pushing:
```powershell
# Run identity and safety verification:
..\scripts\check-git-identity.ps1
..\scripts\pre-push-check.ps1

git push origin <your-feature-branch>
```

---

## 4. Conventional Commit Standards
Commits must follow the Conventional Commits specification:
- `feat(<module>)`: New business capability or API
- `fix(<module>)`: Bug fix or calculation correction
- `test(<module>)`: Adding unit, integration, or E2E tests
- `refactor(<module>)`: Code refactoring without changing behavior
- `docs(<module>)`: Documentation or API contract updates
- `chore(<module>)`: Build script, dependencies, or Docker configuration

### Example Commits by Developer:
- **Neeraj**:
  - `feat(auth): implement JWT authentication and role-based middleware`
  - `feat(approval): implement multi-level blended risk routing algorithm`
  - `feat(negotiation): implement customer counter-discount proposal API`
- **Atharva**:
  - `feat(quotation): implement interactive quotation builder and cart`
  - `feat(margin): implement real-time margin impact calculation`
  - `feat(intelligence): implement upsell ranking with minimum margin filter`
- **Vignesh**:
  - `feat(warehouse): implement stock allocation and order splitting engine`
  - `feat(billing): generate hybrid invoice schedules for recurring plans`
  - `feat(reporting): add multi-dimensional sales analytics with PDF export`

---

## 5. Conflict Resolution Protocol
- Never automatically resolve conflicts involving shared schemas or API contracts.
- Both affected authors must review the changes together.
- After resolving conflicts locally, re-run tests and verify migrations before committing the merge.
