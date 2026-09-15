# Production-Grade DevSecOps Microservice Pipeline & IaC

[![Pipeline Status](https://img.shields.io/badge/GitLab_CI-Passing-brightgreen?logo=gitlab)](https://gitlab.com)
[![Security Scan](https://img.shields.io/badge/Trivy-Container_Clean-blue?logo=aquasecurity)](https://github.com/aquasecurity/trivy)
[![SAST](https://img.shields.io/badge/Semgrep-SAST_Passed-purple?logo=semgrep)](https://semgrep.dev)
[![Signing](https://img.shields.io/badge/Cosign-Keyless_Signed-orange?logo=sigstore)](https://sigstore.dev)
[![IaC](https://img.shields.io/badge/Terraform-AWS_ECS/Fargate-623CE4?logo=terraform)](https://www.terraform.io)

An end-to-end, security-hardened DevSecOps CI/CD pipeline built on **GitLab CI/CD**, deploying microservices to **AWS ECS (Fargate)** via **Terraform**. Designed with a shift-left security architecture, continuous compliance auditing, container hardening, keyless artifact signing, and automated supply chain protections.

---

[ Developer ]
│
▼ (git push)
┌─────────────────────────────────────────────────────────────────────────┐
│                           GitLab CI/CD Pipeline                         │
│                                                                         │
│  [ 1. SAST ]     ➜   [ 2. Build ]   ➜   [ 3. Security & SBOM ]        |
│  • Semgrep Code       • Docker         • Trivy Container Scan           │
│    Analysis             Multi-Stage    • CycloneDX SBOM Export          │
│                                        • Dependency Auditing            │
│                                                                         │
│  [ 6. Deploy ]      [ 5. IaC ]        [ 4. Supply Chain ]           │
│  • Staging Auto       • Terraform      • Cosign Keyless Image          │
│  • Prod (Manual)        Plan & Apply     Signing via GitLab OIDC        │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             AWS Cloud Infrastructure                    │
│                                                                         │
│   ┌──────────────────────┐         ┌────────────────────────────────┐   │
│   │ AWS ECR              │         │ AWS ECS (Fargate Cluster)      │   │
│   │ • Immutable Tags     ├────────►│ • Read-Only Root Filesystem    │   │
│   │ • KMS Encrypted      │         │ • Non-Root Runtimes            │   │
│   └──────────────────────┘         └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘


---

## 🛡️ Security Features & Hardening Controls

### 1. Shift-Left Security & SAST
* **Static Application Security Testing (SAST):** Enforces static code scans on every commit using **Semgrep** (`returntocorp/semgrep`) to catch hardcoded secrets, injection risks, and insecure code patterns before compilation.

### 2. Container Image Hardening
* **Multi-Stage Builds:** Minimizes final container footprint using lightweight Alpine base images (`python:3.11-alpine`, `node:20-alpine`).
* **Least Privilege Runtimes:** Enforces explicit non-root user execution (`USER appuser`) and unprivileged group permissions.
* **Immutable & Read-Only Containers:** Applications execute with a `readOnlyRootFilesystem` and explicit ephemeral `/tmp` volume mounts.
* **Automated Package Sanitization:** Purges system-level `site-packages` prior to layer copy steps to prevent duplicate/stale dependency exposure.

### 3. Supply Chain Security & Attestation
* **Vulnerability Management:** **Trivy** performs strict static layer scans, failing the pipeline on `HIGH` or `CRITICAL` vulnerabilities (`--exit-code 1`). Audited exceptions are explicitly documented in `.trivyignore`.
* **Software Bill of Materials (SBOM):** Generates standardized **CycloneDX** SBOM artifacts (`sbom-api.json`, `sbom-auth.json`) for full dependency visibility.
* **Keyless Image Signing:** Utilizes **Cosign** (Sigstore) with GitLab OIDC ID tokens (`SIGSTORE_ID_TOKEN`) to cryptographically sign container images and verify signatures before deployment.
* **Automated Dependency Updates:** Integrated with **Renovate Bot** to enforce patch constraints (e.g., `minimumReleaseAge`).

### 4. Infrastructure as Code (IaC) & Cloud Security
* **AWS ECR:** Configured via Terraform with immutable image tags and KMS server-side encryption.
* **AWS ECS/Fargate:** Serverless container orchestration configured with minimal resource allocation (0.25 vCPU, 512MB RAM) and zero continuous task cost overhead (`desired_count = 0` for demo efficiency).

---

## 📁 Repository Structure

```text
.
├── .gitlab-ci.yml           # Complete 6-stage DevSecOps pipeline definition
├── .trivyignore             # Audited and documented CVE overrides
├── .gitignore               # Strict exclusion of state files, secrets, and artifacts
├── api-service/             # Node.js Express Microservice & Dockerfile
├── auth-service/            # Python FastAPI Microservice & Multi-Stage Dockerfile
└── terraform/               # Modular Infrastructure as Code
    ├── main.tf              # Provider configuration & backend setup
    ├── ecr.tf               # Encrypted ECR repositories definition
    ├── ecs.tf               # ECS Cluster, Task Definitions, and Services
    ├── variables.tf         # Input variables & environment constraints
    └── outputs.tf           # Terraform export outputs

🚀 Pipeline WorkflowStageJob NameTool / ImagePurposeTestsast-semgrepsemgrep:latestScans source code for SAST vulnerabilities and security flaws.Buildbuild-imagesdocker:24.0.5Compiles hardened multi-stage container images and pushes to GitLab Registry.Scantrivy-container-scanaquasec/trivyConducts CVE container scans and exports CycloneDX SBOM artifacts.Scanrenovate-depsrenovate/renovateExecutes scheduled dependency patch audits.Signsign-imagesbitnami/cosignKeylessly signs container images via OIDC tokens and verifies cryptographic signatures.Infra Plantf-planhashicorp/terraformFormats, validates, and generates Terraform infrastructure execution plans.Infra Applytf-applyhashicorp/terraformProvisions AWS ECR and ECS Fargate cluster resources automatically.Deploydeploy-stagingalpine/k8sDeploys validated microservices to the Staging environment.Deploydeploy-productionalpine/k8sManual approval gate for controlled Production releases.💻 Local Testing & VerificationBuild Hardened Images LocallyBash# Build Auth Service (Python FastAPI)
docker build -t auth-service:test ./auth-service

# Build API Service (Node.js)
docker build -t api-service:test ./api-service
Verify Container Security & Installed PackagesBash# Verify explicit package versioning inside container
docker run --rm auth-service:test pip show jaraco.context

# Run local Trivy scan against image
trivy image --severity HIGH,CRITICAL auth-service:test
Run Infrastructure ValidationBashcd terraform
terraform init
terraform validate
terraform plan
📝 LicenseDistributed under the MIT License. See LICENSE for more information.