# Architecture Note — Perform AI

## Q1 — Scaling concurrent analysis requests

The main bottleneck is the processing step, not the API. The fix is to stop doing work inside the request/response cycle entirely. The API should accept a job, persist it, enqueue it (SQS or BullMQ + Redis), and return 202. Workers run separately and can be scaled independently based on queue depth — a CloudWatch alarm or KEDA watching queue length is usually enough to drive the autoscaler.

The API tier itself is stateless, so it sits behind an ALB and scales horizontally on ECS Fargate or Kubernetes without any changes. Workers get their own task definition since they have different CPU/memory profiles (and eventually GPU requirements). For inference specifically, you want a pool of reserved GPU instances (g4dn or g5) rather than relying on spot alone, because cold starts on GPU nodes are slow and interrupt recovery is painful mid-inference. Spot can cover the batch/overflow load.

One thing worth calling out: if video files are involved, the API should never touch them. Presigned S3 URLs let the client upload directly, and the worker reads from S3. That keeps the API lightweight and avoids a whole class of memory/timeout problems.

## Q2 — Real biomechanics processing

For pose estimation, MoveNet Lightning is the practical starting point — it's fast enough to run on a mid-range phone and the keypoint quality is good for gait analysis. MediaPipe Pose is a solid alternative if you need more landmark coverage. Either way, the raw output is a sequence of (x, y, confidence) vectors per frame.

The actual event detection — foot contact, foot off, turning point — is a temporal classification problem on top of that sequence. A 1-D CNN or LSTM over a sliding window of keypoints works well here. Training data comes from annotated video sessions reviewed by sports scientists; the annotation tooling matters a lot in practice because label quality is the ceiling on model quality.

On mobile, Ionic + Capacitor gives you native camera access without leaving the web stack. For offline scenarios, store pending submissions in SQLite and use `BackgroundFetch` to retry when connectivity returns. The UI should make the sync state visible so athletes aren't left wondering if their session was lost.

## Q3 — Path to production

Roughly in order of what you need before anything else can work:

1. Postgres + migrations, connection pooling (PgBouncer), read replica for anything reporting-adjacent
2. Auth — JWT with refresh tokens, RBAC for athlete/coach/admin roles, row-level isolation if multi-tenant
3. S3 + SQS + worker fleet with a dead-letter queue; job handlers need to be idempotent because retries will happen
4. Model serving behind an internal endpoint (TorchServe or Triton); MLflow or a similar registry so you can version models and roll back without a code deploy
5. Observability before you go live, not after — OTel traces, structured logs, Sentry, and SLO dashboards for latency and error rate
6. Terraform for all of it so environments are reproducible
7. CI/CD pipeline: lint → unit → e2e → build → push ECR → staging deploy → smoke test → manual gate → prod
8. A feedback loop where coach-reviewed corrections flow back into the training set; without this the model doesn't improve after launch

## Q4 — Reliability and security

A few things that tend to get skipped and then cause incidents:

- **Job durability**: persist the job to DB *before* enqueuing. If the enqueue fails you can replay from the DB. Workers should mark status atomically to avoid double-processing.
- **Tenant isolation**: S3 keys include a tenant prefix enforced by bucket policy; workers run in ephemeral containers with no shared mutable state between tenants.
- **Secrets**: AWS Secrets Manager or Parameter Store only — nothing in env vars baked into images, nothing in source. Service-to-service auth uses IAM roles.
- **Security in CI**: Semgrep for SAST, Dependabot for SCA, ECR image scanning on every push. These are cheap to add early and expensive to retrofit.
- **Load testing**: k6 scripts against staging on every release, with pass/fail thresholds on p95 latency and error rate. You want to catch regressions before they reach prod, not after.
- **Runbooks**: queue drain, worker rollback, DB failover, model rollback — these should be written down and tested before you need them.

