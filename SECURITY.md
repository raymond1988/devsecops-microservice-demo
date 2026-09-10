# Security Policy & Pipeline Architecture Decision Record (ADR)

This document outlines the security architecture, threat model mitigations, container hardening practices, and active policy exception rationales enforced in the GitLab CI/CD pipeline for this dual-stack microservice repository (`api-service` and `auth-service`).

---

## 1. Pipeline Security Architecture & Scanning Model

The DevSecOps CI/CD pipeline operates on a strict **Shift-Left** security model. Code and container artifacts must pass all scanning gates before being approved for deployment or image registry promotion.


### Pipeline Stages & Enforced Controls

* **Stage 1: Static Application Security Testing (SAST)**
  * **Tool:** Semgrep (`returntocorp/semgrep:latest`)
  * **Scope:** Analyzes source code across Node.js (`api-service`) and Python (`auth-service`) for OWASP Top 10 flaws and hardcoded secrets.
  * **Policy:** Blocks on static analysis errors (`--error .`).
* **Stage 2: Isolated Multi-Stage Build & Artifact Export**
  * **Tool:** Docker-in-Docker (`docker:24.0.5-dind`)
  * **Mechanism:** Builds hardened production container layers and exports raw container streams as pipeline artifacts (`api-image.tar`, `auth-image.tar`).
* **Stage 3: Container & File System Vulnerability Scanning**
  * **Tool:** Aqua Security Trivy (`aquasec/trivy:latest`)
  * **Gating Policy:** Absolute failure (`--exit-code 1`) on any unignored `HIGH` or `CRITICAL` severity vulnerability found within OS packages or application dependencies.

---

## 2. Container Hardening & Operating System Standards

Both microservices adhere to container security best practices to ensure minimal attack surface area and non-root execution at runtime.

### `api-service` (Node.js API)
* **Base Image:** `node:20-alpine`
* **Multi-Stage Build Pattern:**
  * **Stage 1 (Builder):** Uses `npm ci --omit=dev` to install production dependencies only, removing build-time tooling from the final image layer.
  * **Stage 2 (Runtime):** Copies pruned `node_modules` into a clean Alpine image.
* **Privilege Reduction:** Explicitly drops `root` privileges by enforcing non-root user execution (`USER node`) and setting strict file ownership (`chown -R node:node /app`).

### `auth-service` (Python Auth API)
* **Base Image:** `python:3.11-alpine`
* **OS Layer Patching:** Executes `apk update && apk upgrade --no-cache` to force immediate runtime upgrades for Alpine OS packages.
* **Dependency Isolation:** System packaging tools (`pip`, `setuptools`, `wheel`) are upgraded prior to application dependency installation.
* **Privilege Reduction:** Creates an isolated system user and group (`appuser:appgroup`) with dropped root rights (`USER appuser`).

---

## 3. Cross-Platform & Repository Integrity Controls

* **Line-Ending Standardization (`.gitattributes`):**
  * Configured `* text=auto eol=lf` to enforce Unix-style line endings across all platforms.
  * **RATIONALE:** Prevents Windows local development environments from converting `LF` to `CRLF` on lockfiles (`package-lock.json`, `requirements.txt`) or shell scripts, which can cause checksum mismatches, breaking changes in Linux CI runners, and unnecessary Git diff churn.

---

## 4. Vulnerability Exception Log (`.trivyignore`)

The following security findings have been evaluated and explicitly exempted via `.trivyignore`. Each exemption represents a documented risk acceptance or phantom metadata finding that cannot be patched via standard package resolution.

| Target / Library | CVE / Advisory ID | Severity | Resolution / Risk Acceptance Rationale |
| :--- | :--- | :--- | :--- |
| `setuptools` | **CVE-2025-47273** | `HIGH` | **Upstream Base Image Metadata.** Path traversal vulnerability present in pre-packaged Alpine Python site-packages. Upgrading `setuptools` via `pip` leaves residual system metadata flagged by static scanners. Mitigated by running as non-root `appuser`. |
| `msgpack` | **GHSA-6v7p-g79w-8964** | `HIGH` | **Unresolvable Upstream Advisory.** Memory crash issue in `msgpack` Python package. The required patched version (`1.2.1`) is unavailable/unreleased in target index mirrors. Exempted to unblock pipeline pending upstream package release. |

### Policy for Adding Future Exceptions
1. Every entry added to `.trivyignore` **must** be accompanied by a justification in this log.
2. Exceptions must be re-evaluated during monthly security review cycles to check if upstream patches have become available.

---

## 5. Security Incident Contact & Reporting

To report a vulnerability or pipeline policy bypass request, contact the DevSecOps engineering team or submit an internal security ticket.