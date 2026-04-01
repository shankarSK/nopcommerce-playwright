# CI/CD Pipeline Setup

This document explains the CI/CD pipeline configured for the nopcommerce-playwright project.

## Pipeline Overview

The pipeline includes 4 stages that automatically run on every push to `main` or `develop` branches:

### 1. **Test** 🧪
- Runs on: Ubuntu Latest
- Installs dependencies
- Installs Playwright browsers
- Runs Playwright tests via `npm run test`
- Uploads test results and reports as artifacts (30-day retention)

### 2. **Lint & Format** ✅
- Runs on: Ubuntu Latest
- Performs TypeScript type checking
- Validates code quality

### 3. **Build** 🔨
- Runs on: Ubuntu Latest
- Depends on: Test and Lint passing
- Compiles/bundles application
- Note: Add a `build` script to package.json if needed

### 4. **Deploy** 🚀
- Runs on: Main branch pushes only
- Depends on: Build passing
- Builds Docker image
- Pushes to Docker Hub

## Setup Instructions

### Prerequisites
- GitHub account with repository access
- Docker Hub account (for Docker image registry)

### 1. GitHub Actions Setup (Automatic)
The workflow is already configured at `.github/workflows/ci-cd.yml`

### 2. Docker Hub Secrets (Required for Deploy Stage)
Add these secrets to your GitHub repository:

1. Go to: **Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token (NOT password)

**Get Docker Hub Token:**
1. Login to [Docker Hub](https://hub.docker.com)
2. Go to **Account Settings → Security**
3. Click **New Access Token**
4. Copy the token and add it as `DOCKER_PASSWORD`

### 3. Local Docker Testing

**Build Docker image locally:**
```bash
docker build -t nopcommerce-playwright:latest .
```

**Run tests in Docker:**
```bash
docker-compose up
```

**Or manually:**
```bash
docker run --rm nopcommerce-playwright:latest npm run test
```

## Workflow Files

### `.github/workflows/ci-cd.yml`
Contains the GitHub Actions workflow with all 4 stages

### `Dockerfile`
Multi-stage Docker build:
- **Builder stage**: Installs dependencies and Playwright browsers
- **Runtime stage**: Lightweight Alpine Linux image with Node.js

### `docker-compose.yml`
Orchestrates local testing with volume mounts for:
- Test files
- Test results
- Playwright reports

### `.dockerignore`
Excludes unnecessary files from Docker build context

## Monitoring Pipeline

1. **View Workflow Status:**
   - GitHub repo → **Actions** tab
   - Click on workflow run to see detailed logs

2. **Download Test Reports:**
   - Go to specific workflow run
   - Download "playwright-report" artifact

3. **Docker Image Registry:**
   - View pushed images: https://hub.docker.com/repository/docker/YOUR_USERNAME/nopcommerce-playwright

## Configuration Tips

### Add a Build Script
If you need to build/compile your code, add to `package.json`:
```json
"scripts": {
  "build": "tsc --outDir dist"
}
```

### Customize Branches
Edit `.github/workflows/ci-cd.yml` to change trigger branches:
```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging  # Add more branches
```

### Disable Deploy Stage
If you don't want automatic Docker push, remove the `deploy` job from the workflow

### Add Notifications
Add Slack/email notifications in workflow (optional):
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail in CI but pass locally | Check Node.js version mismatch or missing browser dependencies |
| Docker build fails | Run `docker build` locally to see error details |
| Deploy fails with auth error | Verify Docker Hub secrets are correctly set |
| Playwright timeout | Increase timeout in `playwright.config.ts` or add `--timeout` flag |

## Next Steps

- [ ] Add `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
- [ ] Push changes to trigger first pipeline run
- [ ] Monitor Actions tab for workflow execution
- [ ] Share test reports with team via artifacts
- [ ] Add more deployment stages as needed (staging, production)

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Playwright Testing Guide](https://playwright.dev/)
- [Docker Documentation](https://docs.docker.com/)
