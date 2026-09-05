import { auditLogsTable, AuditLogRecord } from "../models/AuditLog.model";
import { logger } from "../config/logger";

export class AuditLogService {
  public static async recordEvent(
    actorId: string | null | undefined,
    actorIp: string | null | undefined,
    entityType: string,
    entityId: string,
    action: string,
    beforeState?: Record<string, any> | null,
    afterState?: Record<string, any> | null
  ): Promise<AuditLogRecord> {
    try {
      const [record] = await auditLogsTable()
        .insert({
          actor_id: actorId || null,
          actor_ip: actorIp || null,
          entity_type: entityType,
          entity_id: entityId,
          action,
          before_state: beforeState ? JSON.stringify(beforeState) : null,
          after_state: afterState ? JSON.stringify(afterState) : null,
        } as any)
        .returning("*");

      return record;
    } catch (error) {
      logger.error("Failed to record audit log:", error);
      throw error;
    }
  }

  public static async getAuditLogs(entityType?: string, entityId?: string, limit = 50): Promise<AuditLogRecord[]> {
    let query = auditLogsTable().orderBy("created_at", "desc").limit(limit);
    if (entityType) {
      query = query.where({ entity_type: entityType });
    }
    if (entityId) {
      query = query.where({ entity_id: entityId });
    }
    return query;
  }
}
