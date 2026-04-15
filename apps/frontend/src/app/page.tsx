'use client';

import Link from 'next/link';
import { ArrowRight, GitBranch, Zap, Shield, BarChart3, Rocket, Container } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">AutoDeployHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/50 text-sm text-muted-foreground mb-8">
            <Zap className="w-3 h-3 text-amber-400" />
            Cloud-Native CI/CD Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Deploy Faster.</span>
            <br />
            <span className="text-foreground">Ship with Confidence.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect your repositories, automate builds, run pipelines, and deploy
            applications to Kubernetes with minimal configuration. Built for modern teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Start Deploying
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-border bg-card/50 text-foreground font-medium hover:bg-card transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Ship</h2>
            <p className="text-muted-foreground text-lg">
              A complete CI/CD platform built on cloud-native technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GitBranch,
                title: 'Git Integration',
                description: 'Connect GitHub repos with automatic webhook setup. Trigger pipelines on push, PR, or manually.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Zap,
                title: 'Automated Pipelines',
                description: 'YAML-based pipeline configuration. Define install, build, test, and deploy steps with ease.',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                icon: Container,
                title: 'Container Deployments',
                description: 'Deploy to Kubernetes, Docker registry, or static hosting. Canary and rollback support included.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: BarChart3,
                title: 'Real-time Monitoring',
                description: 'Stream build logs in real-time. Track pipeline status, deployment history, and performance metrics.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                icon: Shield,
                title: 'Secrets Management',
                description: 'Store environment variables securely with AES-256 encryption at rest. Never expose credentials.',
                gradient: 'from-red-500 to-rose-500',
              },
              {
                icon: Rocket,
                title: 'Auto-Deploy',
                description: 'Push to main and watch your app deploy automatically. Parallel execution and caching for speed.',
                gradient: 'from-indigo-500 to-violet-500',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Preview */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Pipeline Configuration</h2>
            <p className="text-muted-foreground">Define your CI/CD pipeline in a simple YAML format</p>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-xs text-muted-foreground">pipeline.yml</span>
            </div>
            <pre className="p-6 text-sm overflow-x-auto">
              <code className="text-muted-foreground">
{`# AutoDeployHub Pipeline Configuration
steps:
  - name: install
    command: npm ci
    cache:
      key: node-modules
      paths: [node_modules]

  - name: lint
    command: npm run lint

  - name: build
    command: npm run build

  - name: test
    command: npm test
    retries: 2

  - name: deploy
    command: kubectl apply -f k8s/
    condition: branch == 'main'`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Rocket className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">AutoDeployHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 AutoDeployHub. Cloud-Native CI/CD Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
