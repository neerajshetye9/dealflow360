import { db } from "../config/database";

export interface AuditLogRecord {
  id: string;
  actor_id?: string | null;
  actor_ip?: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  before_state?: Record<string, any> | null;
  after_state?: Record<string, any> | null;
  created_at: Date;
}

export const auditLogsTable = () => db<AuditLogRecord>("audit_logs");
