// src/pages/admin/tabs/LogsTab.tsx
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, RefreshCw, Download } from "lucide-react";
import { Loader, ErrorMsg } from "../ui";
import { downloadCSV } from "../hooks";
import type { LogEntry } from "../types";

interface Props {
  logs:    any;
  loading: boolean;
  error:   string | null;
  reload:  () => void;
  token:   string;
}

export function LogsTab({ logs, loading, error, reload, token }: Props) {
  return (
    <TabsContent value="logs" className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold flex items-center gap-2">
          <ClipboardList className="h-4 w-4" /> Audit Trail
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={reload} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" variant="outline"
            onClick={() => downloadCSV(token, "/admin/export/monthly-report", "monthly_report.csv")}
            className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Monthly Report
          </Button>
        </div>
      </div>
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? <div className="p-6"><Loader /></div>
          : error   ? <div className="p-6"><ErrorMsg msg={error} onRetry={reload} /></div>
          : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Time", "Admin", "Action", "Target", "Detail"].map(h => (
                      <TableHead key={h} className="text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((logs?.items ?? []) as LogEntry[]).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        No admin actions logged yet.
                      </TableCell>
                    </TableRow>
                  ) : ((logs?.items ?? []) as LogEntry[]).map((log, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{log.admin_id?.slice(0, 8)}…</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{log.action}</Badge></TableCell>
                      <TableCell className="text-xs">{log.target  || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.detail || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
