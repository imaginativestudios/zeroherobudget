import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { RefreshCw, Mail, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEmailLogs, EmailType, EmailStatus } from '@/hooks/useEmailLogs';
import { Skeleton } from '@/components/ui/skeleton';

const StatusIcon = ({ status }: { status: EmailStatus }) => {
  switch (status) {
    case 'sent':
    case 'delivered':
      return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
    case 'failed':
    case 'bounced':
      return <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />;
    default:
      return <Mail className="h-4 w-4" aria-hidden="true" />;
  }
};

export function EmailLogsTable() {
  const [typeFilter, setTypeFilter] = useState<EmailType | 'all'>('all');
  
  const { 
    logs, 
    loading, 
    error, 
    refetch, 
    getStatusBadgeVariant, 
    getEmailTypeLabel 
  } = useEmailLogs({
    limit: 50,
    emailType: typeFilter === 'all' ? undefined : typeFilter,
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as EmailType | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="waitlist_welcome">Waitlist Welcome</SelectItem>
              <SelectItem value="household_invite">Household Invite</SelectItem>
              <SelectItem value="deletion_code">Deletion Code</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p>No email logs found</p>
          <p className="text-sm">Email logs will appear here as emails are sent</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead className="hidden md:table-cell">Sent</TableHead>
                <TableHead className="hidden lg:table-cell">Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={log.status} />
                      <Badge variant={getStatusBadgeVariant(log.status)} className="capitalize">
                        {log.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {getEmailTypeLabel(log.email_type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm truncate max-w-[200px] block">
                            {log.recipient_email}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{log.recipient_email}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(new Date(log.created_at), 'PPpp')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {log.error_message ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-destructive truncate max-w-[200px] block cursor-help">
                              {log.error_message}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p className="text-sm">{log.error_message}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
