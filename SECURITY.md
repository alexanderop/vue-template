# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Email
`opalicalexander@gmail.com` with:

- A short description of the vulnerability.
- Steps to reproduce or a proof of concept.
- The commit SHA you tested against.

You'll get an acknowledgement within 72 hours. Fixes will be coordinated
through a private patch before public disclosure.

## Scope

This is a template, not a deployed service. Reports should be about the
template's code, dependencies, or default configuration — not about an app
built on top of it.

## Dependencies

Dependency updates land through Dependabot (see `.github/dependabot.yml`).
The `zizmor` workflow audits GitHub Actions for known misconfigurations on
every PR touching `.github/workflows/`.
