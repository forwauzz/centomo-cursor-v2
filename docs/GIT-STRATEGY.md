# Git Strategy for CentomoMD V2

## Repository Information
- **Repository URL**: https://github.com/forwauzz/centomo-cursor-v2
- **Project Name**: CentomoMD V2 - Medical Documentation Platform
- **Primary Branch**: `main`
- **Development Port**: 5002

## Branching Strategy

### Main Branches

#### `main` (Production)
- **Purpose**: Production-ready code
- **Protection**: Required PR reviews, status checks
- **Deployment**: Automatic deployment to production
- **Merge Policy**: Only from `develop` or hotfix branches

#### `develop` (Development)
- **Purpose**: Integration branch for features
- **Protection**: Required PR reviews
- **Deployment**: Staging environment
- **Merge Policy**: From feature branches

### Feature Branches

#### `feature/` (Feature Development)
- **Naming**: `feature/feature-name` (e.g., `feature/patient-management`)
- **Purpose**: New features and enhancements
- **Base**: `develop`
- **Merge**: Into `develop` via PR
- **Lifecycle**: Delete after merge

#### `bugfix/` (Bug Fixes)
- **Naming**: `bugfix/issue-description` (e.g., `bugfix/login-validation`)
- **Purpose**: Bug fixes for development
- **Base**: `develop`
- **Merge**: Into `develop` via PR

#### `hotfix/` (Production Fixes)
- **Naming**: `hotfix/critical-issue` (e.g., `hotfix/security-vulnerability`)
- **Purpose**: Critical production fixes
- **Base**: `main`
- **Merge**: Into both `main` and `develop` via PR

#### `release/` (Release Preparation)
- **Naming**: `release/version-number` (e.g., `release/v2.1.0`)
- **Purpose**: Final testing and preparation
- **Base**: `develop`
- **Merge**: Into `main` and `develop` via PR

## Commit Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements
- **ci**: CI/CD changes
- **build**: Build system changes
- **security**: Security-related changes
- **compliance**: Compliance-related changes

### Scopes
- **auth**: Authentication system
- **patient**: Patient management
- **medical**: Medical records
- **voice**: Voice dictation
- **ui**: User interface
- **api**: API endpoints
- **db**: Database changes
- **config**: Configuration
- **docs**: Documentation
- **test**: Testing

### Examples
```
feat(patient): add patient search functionality
fix(auth): resolve login validation issue
docs(api): update API documentation
refactor(medical): improve record validation
test(voice): add voice dictation tests
security(auth): implement rate limiting
compliance(medical): add PIPEDA audit logging
```

## Pull Request Guidelines

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Compliance
- [ ] PIPEDA compliance maintained
- [ ] HIPAA compliance maintained
- [ ] Security review completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left
- [ ] Environment variables documented
```

### Review Requirements
- **Minimum Reviewers**: 1
- **Required Approvals**: 1
- **Status Checks**: All must pass
- **Branch Protection**: Enabled for `main` and `develop`

## Workflow Guidelines

### Development Workflow
1. **Create Feature Branch**: `git checkout -b feature/feature-name`
2. **Develop**: Make commits following convention
3. **Push**: `git push origin feature/feature-name`
4. **Create PR**: Against `develop` branch
5. **Review**: Address feedback and get approval
6. **Merge**: Squash and merge into `develop`
7. **Cleanup**: Delete feature branch

### Release Workflow
1. **Create Release Branch**: `git checkout -b release/v2.x.x`
2. **Final Testing**: Complete testing and fixes
3. **Version Update**: Update version in `package.json`
4. **Create PR**: Against `main` and `develop`
5. **Merge**: After approval
6. **Tag**: Create git tag for release
7. **Deploy**: Trigger production deployment

### Hotfix Workflow
1. **Create Hotfix Branch**: `git checkout -b hotfix/critical-issue`
2. **Fix**: Implement critical fix
3. **Test**: Thorough testing
4. **Create PR**: Against `main`
5. **Merge**: After approval
6. **Cherry-pick**: Merge into `develop`
7. **Tag**: Create hotfix tag

## Environment Management

### Branch-Specific Configurations
- **main**: Production environment variables
- **develop**: Staging environment variables
- **feature branches**: Development environment variables

### Environment Files
- `.env.local`: Local development (gitignored)
- `.env.example`: Template for environment setup
- `.env.production`: Production environment (gitignored)
- `.env.staging`: Staging environment (gitignored)

## Security and Compliance

### Sensitive Data
- **Never commit**: API keys, passwords, secrets
- **Use**: Environment variables for sensitive data
- **Validate**: All environment variables are set
- **Audit**: Regular security audits of dependencies

### Compliance Requirements
- **PIPEDA**: Canadian privacy compliance
- **HIPAA**: US healthcare compliance
- **Audit Logging**: All changes logged
- **Data Retention**: Proper data lifecycle management

## Tools and Automation

### Pre-commit Hooks
- **Linting**: ESLint checks
- **Formatting**: Prettier formatting
- **Type Checking**: TypeScript validation
- **Tests**: Unit test execution

### CI/CD Pipeline
- **Build**: Next.js build verification
- **Test**: Automated testing
- **Lint**: Code quality checks
- **Security**: Dependency vulnerability scanning
- **Deploy**: Automated deployment

## Best Practices

### Code Quality
- **Small Commits**: Atomic, focused commits
- **Clear Messages**: Descriptive commit messages
- **No Direct Commits**: Always use PRs for main branches
- **Regular Updates**: Keep branches up to date

### Collaboration
- **Communication**: Clear communication in PRs
- **Documentation**: Update docs with changes
- **Testing**: Comprehensive testing before PR
- **Review**: Thorough code reviews

### Performance
- **Bundle Size**: Monitor bundle size changes
- **Performance**: Performance impact assessment
- **Monitoring**: Application performance monitoring

## Emergency Procedures

### Critical Issues
1. **Assess**: Determine severity and impact
2. **Communicate**: Notify team immediately
3. **Hotfix**: Create hotfix branch
4. **Test**: Rapid but thorough testing
5. **Deploy**: Emergency deployment
6. **Document**: Document incident and resolution

### Rollback Procedures
1. **Identify**: Determine rollback point
2. **Create**: Rollback branch from previous tag
3. **Test**: Verify rollback fixes issue
4. **Deploy**: Deploy rollback
5. **Investigate**: Root cause analysis
6. **Prevent**: Implement preventive measures

## Version Management

### Semantic Versioning
- **Major**: Breaking changes (v2.0.0)
- **Minor**: New features (v2.1.0)
- **Patch**: Bug fixes (v2.1.1)

### Release Notes
- **Changelog**: Maintain CHANGELOG.md
- **Breaking Changes**: Document clearly
- **Migration Guide**: Provide upgrade instructions
- **Security Updates**: Highlight security changes

## Monitoring and Metrics

### Key Metrics
- **Deployment Frequency**: Track deployment success
- **Lead Time**: Time from commit to deployment
- **MTTR**: Mean time to recovery
- **Change Failure Rate**: Failed deployments

### Tools
- **GitHub Insights**: Repository analytics
- **CI/CD Metrics**: Pipeline performance
- **Application Monitoring**: Performance and errors
- **Security Scanning**: Vulnerability detection

---

*This git strategy ensures consistent, secure, and compliant development practices for the CentomoMD V2 medical documentation platform.*
