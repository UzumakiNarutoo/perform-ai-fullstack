import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface AnalysisBody {
  id: string;
  status: string;
  foot_contact?: number;
  foot_off?: number;
  turning_point?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollUntilDone(
  app: INestApplication<App>,
  id: string,
  maxMs = 5000,
): Promise<request.Response> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const res = await request(app.getHttpServer()).get(`/analysis/${id}`);
    const body = res.body as AnalysisBody;
    if (body.status === 'COMPLETED' || body.status === 'FAILED') {
      return res;
    }
    await sleep(200);
  }
  throw new Error(`Analysis ${id} did not complete within ${maxMs}ms`);
}

describe('Analysis API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect((res.body as { status: string }).status).toBe('ok');
  });

  it('POST /analysis returns 202 with id and PENDING status', async () => {
    const res = await request(app.getHttpServer())
      .post('/analysis')
      .send({ athlete: 'Demo Athlete' });

    expect(res.status).toBe(202);
    const body = res.body as AnalysisBody;
    expect(typeof body.id).toBe('string');
    expect(body.status).toBe('PENDING');
  });

  it('POST /analysis then GET polls to COMPLETED with correct metrics', async () => {
    const post = await request(app.getHttpServer())
      .post('/analysis')
      .send({ athlete: 'Demo Athlete' });

    expect(post.status).toBe(202);
    const { id } = post.body as AnalysisBody;

    const result = await pollUntilDone(app, id);
    const resultBody = result.body as AnalysisBody;

    expect(result.status).toBe(200);
    expect(resultBody.id).toBe(id);
    expect(resultBody.status).toBe('COMPLETED');
    expect(resultBody.foot_contact).toBe(0.32);
    expect(resultBody.foot_off).toBe(1.08);
    expect(resultBody.turning_point).toBe(1.22);
  }, 10000);

  it('POST /analysis returns 400 when athlete is empty', async () => {
    const res = await request(app.getHttpServer())
      .post('/analysis')
      .send({ athlete: '' });

    expect(res.status).toBe(400);
  });

  it('POST /analysis returns 400 when body is missing', async () => {
    const res = await request(app.getHttpServer()).post('/analysis').send({});

    expect(res.status).toBe(400);
  });

  it('GET /analysis/:id returns 404 for unknown id', async () => {
    const res = await request(app.getHttpServer()).get(
      '/analysis/non-existent-id',
    );
    expect(res.status).toBe(404);
  });
});
