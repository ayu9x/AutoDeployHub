// ============================================
// WebSocket Events Gateway
// Handles real-time communication for pipeline
// status updates, job logs, and build progress
// ============================================

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, Set<string>>();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, new Set());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Subscribe to pipeline updates for a specific project
   */
  @SubscribeMessage('subscribe:pipeline')
  handleSubscribePipeline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pipelineId: string },
  ) {
    const room = `pipeline:${data.pipelineId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', data: { room } };
  }

  /**
   * Subscribe to project-level events
   */
  @SubscribeMessage('subscribe:project')
  handleSubscribeProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const room = `project:${data.projectId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', data: { room } };
  }

  /**
   * Subscribe to job log streaming
   */
  @SubscribeMessage('subscribe:logs')
  handleSubscribeLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string },
  ) {
    const room = `logs:${data.jobId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', data: { room } };
  }

  /**
   * Unsubscribe from a room
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.debug(`Client ${client.id} unsubscribed from ${data.room}`);
    return { event: 'unsubscribed', data: { room: data.room } };
  }

  // -- Emission methods called by services --

  /**
   * Emit pipeline status change to all subscribers
   */
  emitPipelineStatus(pipelineId: string, projectId: string, status: string, data?: any) {
    this.server.to(`pipeline:${pipelineId}`).emit('pipeline:status', {
      pipelineId,
      projectId,
      status,
      ...data,
      timestamp: new Date(),
    });
    // Also emit to project room for dashboard updates
    this.server.to(`project:${projectId}`).emit('pipeline:status', {
      pipelineId,
      projectId,
      status,
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Emit job status change
   */
  emitJobStatus(jobId: string, pipelineId: string, status: string, data?: any) {
    this.server.to(`pipeline:${pipelineId}`).emit('job:status', {
      jobId,
      pipelineId,
      status,
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Emit a log line for real-time log streaming
   */
  emitJobLog(jobId: string, pipelineId: string, line: number, content: string, level: string = 'info') {
    this.server.to(`logs:${jobId}`).emit('job:log', {
      jobId,
      pipelineId,
      line,
      content,
      level,
      timestamp: new Date(),
    });
  }

  /**
   * Emit build progress update
   */
  emitBuildProgress(pipelineId: string, projectId: string, progress: number, currentStep: string) {
    this.server.to(`pipeline:${pipelineId}`).emit('build:progress', {
      pipelineId,
      projectId,
      progress,
      currentStep,
      timestamp: new Date(),
    });
  }

  /**
   * Get count of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
