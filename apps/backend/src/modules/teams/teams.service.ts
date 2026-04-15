import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeam(userId: string) {
    // Get user's team or create one
    let team = await this.prisma.team.findFirst({
      where: { ownerId: userId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        invites: { where: { status: 'PENDING' } },
      },
    });

    if (!team) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      team = await this.prisma.team.create({
        data: {
          name: `${user?.name || 'My'}'s Team`,
          ownerId: userId,
          members: { create: { userId, role: 'OWNER' } },
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
          },
          invites: { where: { status: 'PENDING' } },
        },
      });
    }

    return team;
  }

  async inviteMember(userId: string, email: string, role: string) {
    const team = await this.prisma.team.findFirst({ where: { ownerId: userId } });
    if (!team) throw new ForbiddenException('Only team owners can invite members');

    const existing = await this.prisma.teamInvite.findFirst({
      where: { teamId: team.id, email, status: 'PENDING' },
    });
    if (existing) throw new ConflictException('Invite already sent to this email');

    const invite = await this.prisma.teamInvite.create({
      data: { teamId: team.id, email, role, invitedBy: userId },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'TEAM_INVITE',
        resource: 'team',
        resourceId: team.id,
        metadata: { email, role },
      },
    });

    return invite;
  }

  async updateMemberRole(userId: string, memberId: string, role: string) {
    const team = await this.prisma.team.findFirst({ where: { ownerId: userId } });
    if (!team) throw new ForbiddenException('Only team owners can change roles');

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    });
  }

  async removeMember(userId: string, memberId: string) {
    const team = await this.prisma.team.findFirst({ where: { ownerId: userId } });
    if (!team) throw new ForbiddenException('Only team owners can remove members');

    const member = await this.prisma.teamMember.findUnique({ where: { id: memberId } });
    if (member?.userId === userId) throw new ForbiddenException('Cannot remove yourself');

    return this.prisma.teamMember.delete({ where: { id: memberId } });
  }
}
