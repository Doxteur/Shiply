## 0.4.0 (2025-08-19)

### Features

* **api:** add Shiply core tables, models and minimal endpoints ([a0a06cd](https://github.com/Doxteur/Shiply/commit/a0a06cdb4d973aa7315174e6ba8272e3c0083faa))
* **api:** add Shiply core tables, models and minimal endpoints ([fd5d02b](https://github.com/Doxteur/Shiply/commit/fd5d02bf2e7f8a3e1ee6a2a8dfcb480ac8d28854))
* **api:** minimal job orchestrator (plan/claim/finish) + tests ([f775fab](https://github.com/Doxteur/Shiply/commit/f775fab031b9e7cb8069a015f38ddf4a09199fe5))
* **logs:** add SSE stream for job logs and tests ([7d174a3](https://github.com/Doxteur/Shiply/commit/7d174a3664a3c35e3f1c89dd88d5b9e20042dbc5))
* **pipelines:** validate pipeline YAML with Ajv + tests ([5ec99a2](https://github.com/Doxteur/Shiply/commit/5ec99a272b80d598d2ddc3922308f785d63807db))
* **project-details:** brancher données réelles (pipelines + runs) et enrichir UI ([7f32466](https://github.com/Doxteur/Shiply/commit/7f324669dbaaafc9ccf55a873aa422d15b8fcf07))
* **projects:** création projet GitHub → finalisation + UI modernisée ([d90aa6c](https://github.com/Doxteur/Shiply/commit/d90aa6cf62a47b7fb2b117fd0ea8bc8e88a6af93))
* **projects:** suppression de projet + nettoyage workspace ([982c7fd](https://github.com/Doxteur/Shiply/commit/982c7fd29fa6b57e85e5996d3fcb6ebe7db60f74))
* **runner-logs:** stream Docker logs + GET/POST /jobs/:id/logs ([8d7ef84](https://github.com/Doxteur/Shiply/commit/8d7ef84a8801e0f6126c0a0c7ca29e22fc6ef059))
* **runs:** list jobs per run and return aggregated status ([77ec3e9](https://github.com/Doxteur/Shiply/commit/77ec3e95cbc5fcd982f36b16af4e1812f8fd5c32))
* **ui:** redesign Home dashboard using shadcn + Tailwind + framer-motion ([637c739](https://github.com/Doxteur/Shiply/commit/637c739221237d9c86655e1b0e6fa2a62cbb1cab))

### Bug Fixes

* **api:** update PipelineRun status on claim and on job finish ([7db7d30](https://github.com/Doxteur/Shiply/commit/7db7d30ae2475c6977167d6fcc33896d6148a429))
