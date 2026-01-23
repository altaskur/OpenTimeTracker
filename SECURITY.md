# Security Policy

## Reporting a Vulnerability

The OpenTimeTracker team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **Opening a private security advisory** on GitHub:
   - Go to the [Security tab](https://github.com/altaskur/OpenTimeTracker/security/advisories)
   - Click "Report a vulnerability"
   - Fill in the details

2. **Contacting the maintainer directly**:
   - GitHub: [@altaskur](https://github.com/altaskur)
   - Please include "SECURITY" in the subject line

### What to Include in Your Report

To help us understand and address the issue quickly, please include as much of the following information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it
- **Your assessment of severity** (Critical, High, Medium, Low)
- **Any possible mitigations** you've identified

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 3 business days.
- **Assessment**: We will work to verify and assess the vulnerability within 7 days.
- **Updates**: We will keep you informed about the progress of fixing the issue.
- **Resolution**: We aim to release a fix within 30 days for critical vulnerabilities, longer for less severe issues.
- **Credit**: With your permission, we will publicly acknowledge your responsible disclosure once the vulnerability is fixed.

## Security Update Process

When a security vulnerability is confirmed:

1. We will develop and test a fix
2. We will prepare a security advisory
3. We will release a patched version
4. We will publish the security advisory with details and credit

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest release (main branch)  | :white_check_mark: |
| Develop branch | :white_check_mark: |
| Older releases | :x: |

We recommend always using the latest stable release.

## Security Best Practices for Contributors

When contributing to OpenTimeTracker:

- **Never commit secrets**: Don't commit `.env` files, API keys, tokens, or passwords
- **Use environment variables**: Store sensitive configuration in environment variables
- **Validate input**: Always validate and sanitize user input
- **Follow secure coding practices**: Review OWASP guidelines for common vulnerabilities
- **Keep dependencies updated**: Regularly update npm packages to patch known vulnerabilities
- **Review security alerts**: Pay attention to GitHub security advisories and Dependabot alerts

## Known Security Considerations

### Data Storage

OpenTimeTracker stores all data locally in a SQLite database. Users are responsible for:
- Securing their local database files
- Managing backups securely
- Protecting their system from unauthorized access

### Electron Security

The application uses Electron with the following security measures:
- Context isolation enabled in preload scripts
- Node integration disabled in renderer processes
- IPC communication through secure channels

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)
- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories)

## Questions?

If you have questions about this security policy, please open a regular (non-security) issue in the repository or contact [@altaskur](https://github.com/altaskur).

---

Thank you for helping keep OpenTimeTracker and its users safe!
