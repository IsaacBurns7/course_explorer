# Observability Infrastructure Setup - Platform Configuration and Tooling

## Problem Description / Summary

Before implementing structured logging, error tracking, or performance monitoring, the project requires comprehensive observability infrastructure setup. This foundational work ensures all observability components integrate properly, data flows correctly, and the team has access to necessary platforms and dashboards. Without proper infrastructure:

### Infrastructure Gaps

**No Centralized Platforms**:
- **No Log Aggregation**: Logs printed to console, lost when containers restart
- **No Error Tracking Service**: Errors not captured or aggregated anywhere
- **No APM Platform**: No performance data collection or visualization
- **No Monitoring Dashboard**: No single pane of glass for application health

**No Data Pipeline**:
- **Log Transport Missing**: Logs don't flow from application to storage
- **Metric Collection Absent**: No time-series database for metrics
- **Trace Propagation Unconfigured**: Cannot trace requests across services
- **Data Retention Undefined**: No policy for how long to keep observability data

**Access and Authentication**:
- **Platform Access Unmanaged**: Team members cannot access observability tools
- **API Keys Unmanaged**: No secure storage for service API keys
- **Role-Based Access**: No defined permissions for who can view/modify what
- **SSO Not Configured**: Team members use separate logins everywhere

**Integration Gaps**:
- **CI/CD Not Integrated**: Deployments not tracked in observability platforms
- **Alerting Not Configured**: No connection to Slack, email, or PagerDuty
- **Source Control Not Linked**: Cannot link errors/performance to code commits
- **Issue Tracking Not Connected**: Cannot create GitHub issues from errors

**Operational Challenges**:
- **No Runbooks**: Team doesn't know how to respond to observability alerts
- **No SLA Definitions**: No agreed-upon performance targets or error budgets
- **No Escalation Path**: Unclear who to notify for critical issues
- **No Training**: Team unfamiliar with observability tools

### Current State Assessment

**Logging** (Score: 0/10):
- Console.log/console.error only
- No structured logging
- No log aggregation
- Logs lost on container restart

**Error Tracking** (Score: 0/10):
- No error tracking service
- Errors only visible in logs
- No error aggregation or grouping
- No stack traces preserved

**Performance Monitoring** (Score: 0/10):
- No APM
- No performance metrics
- No request tracing
- Response times unknown

**Alerting** (Score: 0/10):
- No automated alerts
- No integration with communication tools
- No on-call system
- Reactive incident discovery only

**Dashboards** (Score: 0/10):
- No observability dashboards
- No health status visualization
- Cannot see system state at a glance

## Expected Behavior

After infrastructure setup:

### Platform Access
- **Accounts Created**: Accounts on all observability platforms (Sentry, log aggregation, etc.)
- **Team Access**: All team members have appropriate access
- **API Keys Secured**: Service API keys stored securely in environment variables
- **SSO Configured**: Single sign-on for easier team access (if applicable)
- **Audit Trail**: Track who accessed what and when

### Data Flow Configuration
- **Log Pipeline**: Logs flow from application → aggregation service → storage
- **Error Pipeline**: Errors flow from application → error tracking → storage
- **Metrics Pipeline**: Metrics flow from application → time-series DB → dashboards
- **Traces Pipeline**: Traces flow from application → tracing backend → visualization

### Integration Setup
- **CI/CD Integration**: Deployments tracked automatically
- **Slack Integration**: Alerts and notifications sent to Slack
- **GitHub Integration**: Link errors/performance to code commits, create issues
- **PagerDuty Integration**: Critical alerts page on-call engineer (if applicable)
- **Email Integration**: Fallback alerting via email

### Environment Configuration
- **Development Environment**: Full observability for local development
- **Staging Environment**: Production-like observability for testing
- **Production Environment**: Comprehensive observability with alerting
- **Environment Separation**: Clear boundaries between environments

### Documentation and Training
- **Platform Documentation**: How to access and use each platform
- **Runbooks Created**: How to respond to common alerts
- **SLA Definitions**: Performance and error rate targets documented
- **Team Training**: All team members trained on tools
- **On-Call Playbook**: Procedures for on-call engineers

## Context

### Technical Environment
- **Node Version**: 20.11 LTS
- **Backend Framework**: Express.js 4.x
- **Frontend Framework**: React 18.x
- **Database**: PostgreSQL via Neon (serverless)
- **Deployment**: Likely Docker containers
- **CI/CD**: GitHub Actions (based on repo structure)
- **Communication**: Slack (assumption)

### Platform Selection

Based on Course Explorer's needs and budget constraints:

**Logging Platform**: **Logtail** (Better Stack) or **CloudWatch Logs**
- **Logtail Pros**: Modern UI, affordable, easy setup, generous free tier (1GB/month)
- **CloudWatch Pros**: Free tier (5GB), native AWS integration if on AWS
- **Recommendation**: Logtail for better developer experience

**Error Tracking**: **Sentry**
- Industry standard
- Excellent React and Node.js support
- Performance monitoring included
- Free tier: 5,000 errors/month
- Upgrade path available

**APM/Metrics**: **Sentry Performance** (included with Sentry)
- Already have Sentry for errors
- No additional platform needed
- Transaction tracing and metrics
- Sufficient for application size

**Alternative All-in-One**: **DataDog** (if budget allows)
- Comprehensive observability (logs, metrics, traces, APM)
- Higher cost (~$15-31/host/month)
- Better for larger teams or microservices

**Communication**: **Slack**
- Assumption based on common usage
- Primary channel for alerts

**Final Recommendation**:
- **Sentry** - Error tracking + APM
- **Logtail** - Structured log aggregation
- **Slack** - Alerting and notifications
- **GitHub** - Source control integration

Total cost: ~$0-50/month for small team/traffic

## Acceptance Criteria

### Phase 1: Platform Account Creation (Week 1, Days 1-2)
- [ ] Sentry account created (free tier initially)
- [ ] Sentry organization configured
- [ ] Sentry projects created (backend, frontend)
- [ ] Logtail account created (or CloudWatch configured)
- [ ] Logtail sources created (backend, frontend if applicable)
- [ ] All team members invited to platforms
- [ ] API keys/DSNs documented securely

### Phase 2: Development Environment Setup (Week 1, Days 3-4)
- [ ] Local development can send logs to Logtail
- [ ] Local development can send errors to Sentry (separate project)
- [ ] Environment variables configured for development
- [ ] Test logs and errors successfully captured
- [ ] Dashboards visible in development

### Phase 3: Staging Environment Setup (Week 1, Day 5)
- [ ] Staging logs configured to send to Logtail
- [ ] Staging errors configured to send to Sentry
- [ ] Staging tagged properly in all platforms
- [ ] Test deployments tracked in platforms
- [ ] Staging data separate from production

### Phase 4: Production Environment Setup (Week 2, Days 1-2)
- [ ] Production logs configured to send to Logtail
- [ ] Production errors configured to send to Sentry
- [ ] Production performance monitoring enabled
- [ ] Data retention policies configured
- [ ] Sampling rates configured appropriately

### Phase 5: CI/CD Integration (Week 2, Days 3-4)
- [ ] GitHub Actions configured to track deployments
- [ ] Sentry releases created automatically on deploy
- [ ] Source maps uploaded automatically (frontend)
- [ ] Deploy notifications sent to Slack
- [ ] Release health tracked in Sentry

### Phase 6: Alerting Integration (Week 2, Day 5)
- [ ] Slack workspace connected to Sentry
- [ ] Slack channels created (#errors, #alerts, #deploys)
- [ ] Alert rules configured and tested
- [ ] Email alerting configured as fallback
- [ ] Notification preferences set per team member

### Phase 7: Dashboards and Visualization (Week 3, Days 1-2)
- [ ] Logtail dashboard created for logs
- [ ] Sentry dashboard for errors and performance
- [ ] System health dashboard
- [ ] Custom dashboards for key metrics
- [ ] Dashboard access shared with team

### Phase 8: Documentation and Training (Week 3, Days 3-5)
- [ ] Platform access documentation
- [ ] Environment configuration documentation
- [ ] Alert response runbooks
- [ ] SLA definitions documented
- [ ] Team training session conducted
- [ ] On-call procedures documented (if applicable)

### Quality Metrics
- [ ] 100% of team has access to observability platforms
- [ ] All environments (dev, staging, prod) configured
- [ ] Test alerts successfully delivered
- [ ] Documentation complete and accessible
- [ ] Team trained on basic usage

## Proposed Solution / Ideas

### Overall Strategy

The implementation follows a **platform-first, environment-by-environment approach**:

1. **Platforms First** - Set up accounts before instrumenting code
2. **Development First** - Verify setup in development before production
3. **Staging for Testing** - Test full observability pipeline in staging
4. **Production Last** - Deploy to production only after verification
5. **Integration After Setup** - Add integrations after platforms work
6. **Training Continuously** - Train team as platforms are added

### Phase 1: Platform Account Creation

#### Sentry Setup
1. **Create Sentry Account**:
   - Go to https://sentry.io
   - Sign up with work email
   - Create organization: "course-explorer"
   - Use free tier initially (5k errors/month)

2. **Create Sentry Projects**:
   - Project 1: `course-explorer-backend` (Platform: Node.js)
   - Project 2: `course-explorer-frontend` (Platform: React)
   - Note DSN for each project
   - Configure alert rules (disabled initially)

3. **Team Access**:
   - Invite all team members
   - Assign roles: Admin for leads, Member for developers
   - Configure notification preferences per member

4. **Security**:
   - Store DSNs in secure location (1Password, LastPass, etc.)
   - Never commit DSNs to repository
   - Use environment variables for DSNs

#### Logtail Setup
1. **Create Logtail Account**:
   - Go to https://betterstack.com/logs
   - Sign up with work email
   - Start with free tier (1GB/month, 3-day retention)

2. **Create Logtail Sources**:
   - Source 1: `course-explorer-backend` (Type: Custom HTTP)
   - Source 2: `course-explorer-frontend` (optional, if logging client-side)
   - Note source tokens

3. **Team Access**:
   - Invite team members
   - Configure access levels
   - Set up email digests (optional)

4. **Security**:
   - Store source tokens securely
   - Never commit tokens to repository

#### Alternative: CloudWatch Logs
If using AWS:
1. Create CloudWatch Log Groups:
   - `/course-explorer/backend`
   - `/course-explorer/frontend`
2. Configure IAM permissions
3. Note region and log group names

#### Slack Setup
1. **Create Slack Channels**:
   - `#engineering-errors` - Error notifications
   - `#engineering-alerts` - Performance and system alerts
   - `#engineering-deploys` - Deployment notifications

2. **Configure Channel Settings**:
   - Set descriptions
   - Pin important links (dashboard URLs, runbooks)
   - Configure notification preferences

### Phase 2: Development Environment Configuration

#### Environment Variables
Create `.env.development` (backend):
```bash
# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=development

# Logtail
LOGTAIL_SOURCE_TOKEN=xxx

# Application
NODE_ENV=development
```

Create `.env.development` (frontend):
```bash
REACT_APP_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
REACT_APP_SENTRY_ENVIRONMENT=development
REACT_APP_ENV=development
```

#### Git Ignore Configuration
Update `.gitignore`:
```
# Environment variables
.env
.env.local
.env.*.local
.env.development
.env.production

# Secrets
secrets/
*.key
*.pem
```

#### Test Configuration
Create `backend/test/observability.test.js`:
```javascript
// Test that observability configuration works
describe('Observability Configuration', () => {
  it('should have Sentry DSN configured', () => {
    expect(process.env.SENTRY_DSN).toBeDefined();
  });
  
  it('should have Logtail token configured', () => {
    expect(process.env.LOGTAIL_SOURCE_TOKEN).toBeDefined();
  });
  
  it('should have environment set', () => {
    expect(process.env.SENTRY_ENVIRONMENT).toBeDefined();
  });
});
```

### Phase 3: Staging Environment Configuration

#### Staging Environment Variables
Create `.env.staging` (backend):
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=staging
LOGTAIL_SOURCE_TOKEN=xxx
NODE_ENV=production  # Use production mode in staging
```

#### Docker Environment (if applicable)
Update `docker-compose.staging.yml`:
```yaml
services:
  backend:
    environment:
      - SENTRY_DSN=${SENTRY_DSN}
      - SENTRY_ENVIRONMENT=staging
      - LOGTAIL_SOURCE_TOKEN=${LOGTAIL_SOURCE_TOKEN}
```

#### Kubernetes Secrets (if applicable)
Create secret:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: observability-secrets
  namespace: staging
type: Opaque
stringData:
  sentry-dsn: https://xxx@xxx.ingest.sentry.io/xxx
  logtail-token: xxx
```

### Phase 4: Production Environment Configuration

#### Production Environment Variables
Store in secure secret manager:
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- Or Docker/K8s secrets

**Never store production secrets in `.env.production` in repository**

#### Production Configuration Checklist
- [ ] DSNs point to production Sentry project
- [ ] Log tokens point to production Logtail source
- [ ] Environment set to "production"
- [ ] Sample rates configured (10-50% for performance)
- [ ] Data retention configured
- [ ] Alert rules enabled
- [ ] Team notified of production deployment

### Phase 5: CI/CD Integration

#### GitHub Actions for Sentry Releases
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0  # Fetch all commits
      
      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: course-explorer
          SENTRY_PROJECT: course-explorer-backend
        with:
          environment: production
          version: ${{ github.sha }}
          sourcemaps: ./frontend/build/static/js
      
      - name: Notify Slack of Deploy
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "Deployed to production: ${{ github.sha }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": ":rocket: *Deployed to production*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}"
                  }
                }
              ]
            }
```

#### Setup Requirements
1. Create Sentry Auth Token:
   - Go to Sentry → Settings → Auth Tokens
   - Create new token with `project:releases` permission
   - Add to GitHub Secrets as `SENTRY_AUTH_TOKEN`

2. Create Slack Webhook:
   - Go to Slack → Apps → Incoming Webhooks
   - Create webhook for #engineering-deploys
   - Add URL to GitHub Secrets as `SLACK_WEBHOOK_URL`

### Phase 6: Alerting Integration

#### Sentry + Slack Integration
1. **Connect Slack to Sentry**:
   - Sentry → Settings → Integrations → Slack
   - Click "Add Workspace"
   - Authorize Slack workspace
   - Select channels for notifications

2. **Configure Alert Rules**:
   Create alert rules in Sentry:

   **Critical Error Alert**:
   - Condition: Error is tagged as "critical"
   - Action: Send to #engineering-errors immediately
   - Frequency: Every time

   **High Error Rate Alert**:
   - Condition: >100 errors in 5 minutes
   - Action: Send to #engineering-alerts
   - Frequency: Once per hour max

   **New Error Type Alert**:
   - Condition: First occurrence of error type
   - Action: Send to #engineering-errors
   - Frequency: Once per error type

   **Performance Degradation Alert**:
   - Condition: p95 response time > 500ms for 10 minutes
   - Action: Send to #engineering-alerts
   - Frequency: Once per hour max

3. **Test Alerts**:
   - Trigger test error in staging
   - Verify Slack notification received
   - Check notification format and content
   - Adjust alert rules as needed

#### Email Alerting (Fallback)
Configure email alerts as backup:
- Sentry → Settings → Mail
- Add team email addresses
- Configure email alert rules (same as Slack)
- Test email delivery

### Phase 7: Dashboards and Visualization

#### Logtail Dashboards
Create dashboards in Logtail:

**System Health Dashboard**:
- Log volume over time (by level)
- Error rate over time
- Top errors by count
- Recent critical errors

**Request Dashboard**:
- API request volume
- Average response time
- p95 response time
- Error rate by endpoint

**Database Dashboard**:
- Query counts
- Slow query log (>1s)
- Connection pool usage
- Database errors

#### Sentry Dashboards
Create dashboards in Sentry:

**Error Overview**:
- Total errors (last 24h)
- Error rate trend
- Top errors by count
- Errors by environment

**Performance Overview**:
- Average transaction duration
- p95 transaction duration
- Throughput (transactions/second)
- Apdex score

**Release Health**:
- Errors by release
- Crash-free users %
- Session count by release

#### Custom Dashboards
Create Google Data Studio or Grafana dashboards (if needed):
- Combine data from multiple sources
- Business metrics
- Custom visualizations

### Phase 8: Documentation and Training

#### Platform Access Documentation
Create `docs/OBSERVABILITY_ACCESS.md`:
```markdown
# Observability Platform Access

## Sentry
- **URL**: https://sentry.io/organizations/course-explorer/
- **Purpose**: Error tracking and performance monitoring
- **Projects**:
  - Backend: course-explorer-backend
  - Frontend: course-explorer-frontend

## Logtail
- **URL**: https://logs.betterstack.com/team/xxx/
- **Purpose**: Structured log aggregation
- **Sources**:
  - Backend: course-explorer-backend

## Access Requests
Contact: [lead developer email]

## API Keys
API keys are stored in [secret manager location]
Never commit API keys to repository
```

#### Environment Configuration Documentation
Create `docs/OBSERVABILITY_SETUP.md`:
```markdown
# Observability Configuration

## Environment Variables

### Backend
- `SENTRY_DSN` - Sentry Data Source Name
- `SENTRY_ENVIRONMENT` - Environment name (development/staging/production)
- `LOGTAIL_SOURCE_TOKEN` - Logtail source token

### Frontend
- `REACT_APP_SENTRY_DSN` - Frontend Sentry DSN
- `REACT_APP_SENTRY_ENVIRONMENT` - Environment name

## Local Development Setup

1. Copy `.env.example` to `.env.development`
2. Ask team lead for development API keys
3. Update environment variables
4. Restart dev server

## Testing Observability

### Test Logging
```bash
npm run test:logging
```

### Test Error Tracking
```bash
npm run test:errors
```
```

#### Runbooks
Create `docs/RUNBOOKS.md`:
```markdown
# Observability Runbooks

## High Error Rate Alert

**Alert**: >100 errors in 5 minutes

**Steps**:
1. Check #engineering-errors channel for recent errors
2. Open Sentry dashboard
3. Identify top errors by count
4. Check if errors started after recent deploy
5. If after deploy, consider rollback
6. If not deploy-related, investigate top error
7. Create GitHub issue for error if new
8. Notify team in #engineering

## Database Connection Failure

**Alert**: Cannot connect to database

**Steps**:
1. Check database status (Neon dashboard)
2. Verify connection string is correct
3. Check connection pool exhaustion
4. Check firewall rules
5. Restart application if needed
6. Escalate to DevOps if persists >5 minutes

... [more runbooks for common scenarios]
```

#### SLA Definitions
Create `docs/SLA.md`:
```markdown
# Service Level Agreements (SLAs)

## API Performance
- **p50 response time**: <200ms
- **p95 response time**: <500ms
- **p99 response time**: <1s

## Schedule Generation
- **p95 generation time**: <5s
- **p99 generation time**: <10s

## Database Queries
- **p95 query time**: <200ms
- **p99 query time**: <500ms

## Error Budget
- **Error rate**: <1% of requests
- **Uptime**: 99.5% (monthly)

## Alerting Thresholds
- **Critical**: p95 > 1s for 10 minutes
- **Warning**: p95 > 500ms for 10 minutes
```

#### Team Training
Conduct training session:

**Topics to Cover**:
1. Platform access and navigation
2. How to view logs in Logtail
3. How to search and filter errors in Sentry
4. How to view performance traces
5. How to create dashboards
6. How to respond to alerts
7. How to use runbooks
8. Q&A

**Format**:
- 1-hour session
- Screen sharing demonstration
- Hands-on exercises
- Record for future reference

## Relevant Code / Links

### Configuration Files to Create/Update

**Backend**:
- `.env.example` - Example environment variables (safe to commit)
- `.env.development` - Development config (DO NOT commit)
- `.env.staging` - Staging config (DO NOT commit)
- `.env.production` - Production config (DO NOT commit, use secret manager)
- `backend/config/observability.js` - Centralized observability configuration

**Frontend**:
- `.env.example` - Example environment variables
- `.env.development` - Development config
- `.env.staging` - Staging config
- `.env.production` - Production config (use secret manager)

**CI/CD**:
- `.github/workflows/deploy.yml` - Deployment workflow with Sentry integration
- `.github/workflows/test.yml` - Update to test observability configuration

**Documentation**:
- `docs/OBSERVABILITY_ACCESS.md` - Platform access guide
- `docs/OBSERVABILITY_SETUP.md` - Configuration guide
- `docs/RUNBOOKS.md` - Alert response procedures
- `docs/SLA.md` - Service level agreements
- `docs/ON_CALL.md` - On-call procedures (if applicable)

### External Resources
- [Sentry Documentation](https://docs.sentry.io/)
- [Logtail Documentation](https://betterstack.com/docs/logs/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

## Risk Mitigation

### Potential Risks

**Risk 1**: API key/DSN leaked to repository
- **Mitigation**: Use `.gitignore` properly, never commit secrets
- **Mitigation**: Use git-secrets or similar pre-commit hooks
- **Contingency**: Rotate keys immediately if leaked, revoke old keys

**Risk 2**: Wrong configuration in production
- **Mitigation**: Test in staging first, verify configuration
- **Mitigation**: Use infrastructure-as-code for consistency
- **Contingency**: Rollback configuration, verify in staging again

**Risk 3**: Team members cannot access platforms
- **Mitigation**: Document access process clearly
- **Mitigation**: Test access for all team members
- **Contingency**: Provide temporary access credentials

**Risk 4**: Alert fatigue from too many notifications
- **Mitigation**: Start with conservative alert thresholds
- **Mitigation**: Tune alerts based on actual patterns
- **Contingency**: Mute noisy alerts, refine rules

**Risk 5**: Cost overruns on observability platforms
- **Mitigation**: Monitor usage against free tier limits
- **Mitigation**: Start with sampling, increase if needed
- **Contingency**: Adjust sample rates or switch tiers/platforms

**Risk 6**: Data sovereignty or compliance issues
- **Mitigation**: Review platform data policies
- **Mitigation**: Configure data scrubbing properly
- **Contingency**: Switch to self-hosted solution if needed

## Success Metrics

### Quantitative Metrics
- **Platform Availability**: >99% uptime for all platforms
- **Team Access**: 100% of team can access all platforms
- **Configuration Correctness**: All environments configured correctly
- **Alert Delivery**: 100% of critical alerts delivered successfully
- **Documentation Completeness**: All required docs complete

### Qualitative Metrics
- **Team Confidence**: Team feels confident using platforms
- **Incident Response**: Team knows how to respond to alerts
- **Onboarding**: New team members can access platforms in <1 day
- **Maintainability**: Configuration is easy to understand and modify
- **Security**: No API keys leaked, all secrets secured

## Timeline Estimate

### 3-Week Setup Plan

**Week 1: Platform and Development Setup**
- Days 1-2: Create platform accounts, configure team access
- Days 3-4: Configure development environment
- Day 5: Configure staging environment

**Week 2: Production and Integration**
- Days 1-2: Configure production environment
- Days 3-4: Integrate with CI/CD
- Day 5: Configure alerting (Slack, email)

**Week 3: Dashboards and Documentation**
- Days 1-2: Create dashboards and visualizations
- Days 3-4: Write documentation and runbooks
- Day 5: Conduct team training

## Labels
`enhancement`, `observability`, `infrastructure`, `setup`, `devops`, `difficulty level: medium`, `priority level: critical`

## Dependencies
- Blocks: Structured Logging Implementation (Issue #1)
- Blocks: Error Tracking and Monitoring (Issue #2)
- Blocks: Application Performance Monitoring (Issue #3)
- This issue must be completed FIRST before any observability implementation