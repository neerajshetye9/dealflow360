import { db } from "../config/database";

export interface ReportExportRecord {
  id: string;
  report_type: string;
  format: "PDF" | "XLSX";
  file_path: string;
  generated_by?: string | null;
  filters: Record<string, any>;
  created_at: Date;
}

export const reportExportsTable = () => db<ReportExportRecord>("report_exports");
