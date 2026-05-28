# Part C — Architecture Note

## 1. Scaling to 500 athlete videos per day

500 videos/day averages to one every three minutes, but athletes train in clusters — morning and evening windows will spike that to maybe 60 in an hour. The design has to absorb bursts, not just averages.

The API should never touch the video file. Clients get a presigned S3 URL, upload directly, and the S3 event triggers SQS. Workers pull from the queue, process, and write results back to Postgres. That separation means the API tier stays stateless and lightweight behind an ALB, and workers scale independently based on queue depth. A CloudWatch alarm on `ApproximateNumberOfMessages` driving an ECS Service Auto Scaling policy is enough to handle the burst shape.

For inference at this volume, a small fleet of CPU workers (c5.2xlarge) will handle it — 500 videos at ~3 minutes processing each is 25 CPU-hours/day, which two instances cover comfortably with headroom. Reserved capacity for baseline, spot for overflow. Spot interruptions are fine as long as jobs are idempotent and the SQS visibility timeout is set conservatively. GPU instances become relevant later when you're doing dense per-frame inference on longer sessions or running multiple models in sequence.

Video lifecycle: S3 Standard for 30 days, then Glacier. At even 1 GB per video that's 500 GB/day retention cost, so lifecycle policies matter from day one.

---

## 2. Automated event detection, mobile, and offline

**Event detection.** The prototype mocks results but the real pipeline has two layers. First, a pose estimation model (MediaPipe Pose or MoveNet Lightning) extracts keypoints — (x, y, confidence) per joint per frame — from the video. Second, a temporal model — a 1D CNN or LSTM over a sliding window of those keypoint sequences — classifies events like foot contact, foot off, and turning point. A biomechanical rules layer sits on top as a sanity check (e.g., foot contact shouldn't fire if the ankle keypoint confidence is below threshold, or if the vertical velocity is still negative). Annotation tooling for sports scientists to review and correct predictions is what actually closes the feedback loop; without it, the model accuracy plateaus.

**Android and iOS.** Ionic + Capacitor is the natural extension of this stack — same codebase, native camera and filesystem access via plugins. For real-time feedback during recording, TensorFlow Lite (cross-platform) running MoveNet on-device can give the athlete immediate visual cues without a round-trip. For full analysis, compressed video uploads to the server with server-side inference is more practical for now; on-device full analysis is a later optimization once the model is stable.

**Offline mode.** Submissions are queued locally in SQLite (via `@capacitor-community/sqlite`) when connectivity is absent, with a status row per job. A background sync task — Capacitor's BackgroundFetch on iOS, WorkManager via a Capacitor plugin on Android — retries uploads when the device is back online. Video uploads use chunked multipart or the TUS protocol so a failed upload can resume from where it left off rather than restarting. The UI needs to make the job state visible at all times: queued, uploading, processing, completed, failed.

---

## 3. Minimum roadmap to a production-ready platform

**Months 1–2 — replace every in-memory part with something durable.** Postgres with a migration tool (Prisma or Flyway), PgBouncer for connection pooling, BullMQ + Redis or SQS for the job queue. Auth with JWT + refresh tokens and RBAC for athlete/coach/admin. S3 for video storage. Docker + docker-compose so local dev matches what runs in staging. CI pipeline from day one: lint, unit tests, e2e, build, push.

**Months 2–4 — build the real product.** Integrate the first version of the pose + event detection pipeline, even if it's a rule-based fallback rather than a trained model. Capacitor mobile app with camera integration. Results history and a coach dashboard. MLflow or a lightweight model registry so you can version models separately from code — this discipline matters more than it seems early on.

**Months 4–6 — harden for production.** Multi-environment AWS infrastructure in Terraform. OpenTelemetry tracing, structured logs, Sentry, SLO dashboards. Staging environment with automated load tests via k6 on every release. Dead-letter queue handling with alerting. Runbooks written and tested before you need them in an incident.

After that the work becomes multi-tenancy, offline mode, advanced analytics, and on-device inference — all of which are easier on a solid foundation.

---

## 4. First 90 days — backend and production engineering priorities

**Days 1–30.** The goal is to stop having anything that disappears on restart. Postgres with proper schema design (tenancy boundaries, soft deletes, audit columns from the start — retrofitting these is painful). Real job queue with idempotency keys on handlers. S3 integration. Auth that doesn't need to be replaced in six months. Docker parity between local and staging. CI running on every PR.

**Days 31–60.** Observability before you have users, not after. OTel traces on every request and job, structured JSON logs flowing to CloudWatch, Sentry wired up, p95 latency and error rate on a dashboard. Staging on ECS Fargate provisioned by Terraform. First k6 load test run to establish a baseline — you need something to regress against. Secrets in AWS Secrets Manager, nothing in environment variables baked into images.

**Days 61–90.** Production deploy with a proper deployment pipeline: staging smoke tests as a gate before prod, feature flags for the first model rollout so you can turn it off without a deploy if something goes wrong. Semgrep in CI for SAST, Dependabot for dependency scanning. On-call rotation and alerting set up before the first external user. The model serving infrastructure (TorchServe or ONNX Runtime behind an internal endpoint) doesn't need to be perfect yet, but it needs to exist so the ML team isn't blocked.

The instinct early on is to optimize for velocity, but the things that slow you down most at month six are usually the shortcuts taken at month one — skipping migrations, skipping connection pooling, skipping secrets hygiene. These are cheap to do right the first time and expensive to fix later.
