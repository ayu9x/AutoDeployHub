'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Terminal,
  Loader2, RotateCcw, XOctagon, Upload,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, formatDuration, getStatusColor, getStatusDot } from '@/lib/utils';

export default function PipelineDetailPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    api.getPipeline(pipelineId).then((res) => {
      setPipeline(res.data);
      setLoading(false);
      if (res.data.jobs?.length > 0) {
        setSelectedJob(res.data.jobs[0].id);
      }
    });
  }, [pipelineId]);

  useEffect(() => {
    if (!selectedJob) return;
    setLogsLoading(true);
    api.getJobLogs(selectedJob).then((res) => {
      setLogs(res.data || []);
      setLogsLoading(false);
    }).catch(() => setLogsLoading(false));
  }, [selectedJob]);

  const handleCancel = async () => {
    await api.cancelPipeline(pipelineId);
    const res = await api.getPipeline(pipelineId);
    setPipeline(res.data);
  };

  const handleRetry = async () => {
    await api.retryPipeline(pipelineId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'RUNNING': return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'QUEUED': return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${pipeline.project?.id}`} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Pipeline #{pipeline.number}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(pipeline.status)}`}>
                {pipeline.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {pipeline.commitMsg || pipeline.trigger} • {pipeline.branch}
              {pipeline.commitHash && ` • ${pipeline.commitHash.substring(0, 7)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {['PENDING', 'RUNNING'].includes(pipeline.status) && (
            <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-destructive/50 text-destructive text-sm hover:bg-destructive/10 flex items-center gap-2">
              <XOctagon className="w-4 h-4" /> Cancel
            </button>
          )}
          {pipeline.status === 'FAILED' && (
            <button onClick={handleRetry} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="font-medium mt-1">{pipeline.duration ? formatDuration(pipeline.duration) : '—'}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Trigger</p>
          <p className="font-medium mt-1">{pipeline.trigger}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Started</p>
          <p className="font-medium mt-1">{pipeline.startedAt ? formatDate(pipeline.startedAt) : '—'}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Steps</p>
          <p className="font-medium mt-1">{pipeline.jobs?.length || 0}</p>
        </div>
      </div>

      {/* Steps + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps sidebar */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Pipeline Steps</h3>
          {pipeline.jobs?.map((job: any) => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                selectedJob === job.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'glass-card hover:border-primary/10'
              }`}
            >
              {getStepIcon(job.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{job.name}</p>
                <p className="text-xs text-muted-foreground">
                  {job.duration ? formatDuration(job.duration) : job.status}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Log viewer */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card/50">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {pipeline.jobs?.find((j: any) => j.id === selectedJob)?.name || 'Logs'}
              </span>
            </div>
            <div className="log-viewer p-4 max-h-[500px] overflow-auto bg-[hsl(222,47%,5%)]">
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : logs.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No logs available for this step
                </p>
              ) : (
                logs.map((log: any, i: number) => (
                  <div key={i} className="log-line flex gap-3 py-0.5 px-2 rounded hover:bg-white/5">
                    <span className="text-muted-foreground select-none w-8 text-right shrink-0">
                      {log.line}
                    </span>
                    <span className={
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warn' ? 'text-amber-400' :
                      'text-gray-300'
                    }>
                      {log.content}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
