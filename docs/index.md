# Application Feature Documentation

Welcome to the central documentation hub for our application. This guide outlines the core user flows, system architectures, and feature implementations across our platform.

## Feature Flows

Explore step-by-step guides on how specific system features work:

- [STOCK_IN_DOCUMENTS_FLOW](features/STOCK_IN_DOCUMENTS.md) – Detailed walkthrough of the client-to-server secure file upload architecture.

---

## Getting Started

If you are new to the codebase, please review these foundational setup steps first:

1. Follow the root [README.md](../README.md) to set up your local development environment.
2. Ensure you have the required environment variables configured in your `.env.local` file.
3. Verify your local AWS credentials if you are testing the storage features locally.

## Contribution Guidelines

When adding a new feature or modifying an existing flow:

- Always update the corresponding Markdown file in the `features/` directory.
- Add your new file link to the **Feature Flows** list above.
- Use [Mermaid.js](https://js.org) for architectural or sequence diagrams.
