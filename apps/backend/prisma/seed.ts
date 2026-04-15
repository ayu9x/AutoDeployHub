// ============================================
// Prisma Seed Script
// Populates database with sample data for
// development and testing
// ============================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo@12345', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@autodeployhub.com' },
    update: {},
    create: {
      email: 'demo@autodeployhub.com',
      name: 'Demo User',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
  });

  console.log(`✅ User created: ${user.email}`);

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-001' },
    update: {},
    create: {
      id: 'demo-project-001',
      name: 'Next.js Blog',
      description: 'A modern blog built with Next.js and Tailwind CSS',
      repoUrl: 'https://github.com/demo/nextjs-blog',
      repoBranch: 'main',
      repoProvider: 'github',
      framework: 'nodejs',
      autoDetected: true,
      autoDeploy: true,
      pipelineConfig: {
        steps: [
          { name: 'install', command: 'npm ci' },
          { name: 'lint', command: 'npm run lint' },
          { name: 'build', command: 'npm run build' },
          { name: 'test', command: 'npm test' },
          { name: 'deploy', command: 'npm run deploy' },
        ],
      },
      members: {
        create: {
          userId: user.id,
          role: 'ADMIN',
        },
      },
    },
  });

  console.log(`✅ Project created: ${project.name}`);

  // Create sample pipelines
  const statuses = ['SUCCESS', 'SUCCESS', 'FAILED', 'SUCCESS', 'RUNNING'] as const;
  for (let i = 1; i <= 5; i++) {
    const pipeline = await prisma.pipeline.create({
      data: {
        number: i,
        status: statuses[i - 1],
        trigger: i === 5 ? 'MANUAL' : 'PUSH',
        branch: 'main',
        commitHash: `abc${i}def${i}0123456789abcdef0123456789abcd`,
        commitMsg: `feat: update component ${i}`,
        config: project.pipelineConfig || {},
        projectId: project.id,
        triggeredBy: user.id,
        startedAt: new Date(Date.now() - (6 - i) * 3600000),
        finishedAt: statuses[i - 1] !== 'RUNNING'
          ? new Date(Date.now() - (6 - i) * 3600000 + 120000)
          : null,
        duration: statuses[i - 1] !== 'RUNNING' ? 120 : null,
        jobs: {
          create: [
            { name: 'install', step: 0, status: 'SUCCESS', command: 'npm ci', duration: 15, exitCode: 0, startedAt: new Date(), finishedAt: new Date() },
            { name: 'lint', step: 1, status: 'SUCCESS', command: 'npm run lint', duration: 8, exitCode: 0, startedAt: new Date(), finishedAt: new Date() },
            { name: 'build', step: 2, status: statuses[i - 1] === 'FAILED' ? 'FAILED' : 'SUCCESS', command: 'npm run build', duration: 45, exitCode: statuses[i - 1] === 'FAILED' ? 1 : 0, startedAt: new Date(), finishedAt: new Date() },
            { name: 'test', step: 3, status: statuses[i - 1] === 'FAILED' ? 'SKIPPED' : (statuses[i - 1] === 'RUNNING' ? 'RUNNING' : 'SUCCESS'), command: 'npm test', duration: 30, startedAt: new Date() },
            { name: 'deploy', step: 4, status: statuses[i - 1] === 'SUCCESS' ? 'SUCCESS' : 'SKIPPED', command: 'npm run deploy', duration: 22, startedAt: new Date() },
          ],
        },
      },
    });

    console.log(`✅ Pipeline #${i} created (${statuses[i - 1]})`);
  }

  // Create sample deployment
  const successPipeline = await prisma.pipeline.findFirst({
    where: { projectId: project.id, status: 'SUCCESS' },
    orderBy: { number: 'desc' },
  });

  if (successPipeline) {
    await prisma.deployment.create({
      data: {
        version: `v${successPipeline.number}.0.0`,
        status: 'DEPLOYED',
        target: 'KUBERNETES',
        targetUrl: 'https://nextjs-blog.autodeployhub.dev',
        environment: 'production',
        projectId: project.id,
        pipelineId: successPipeline.id,
        deployedBy: user.id,
        startedAt: new Date(Date.now() - 3600000),
        finishedAt: new Date(Date.now() - 3500000),
      },
    });
    console.log('✅ Deployment created');
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
