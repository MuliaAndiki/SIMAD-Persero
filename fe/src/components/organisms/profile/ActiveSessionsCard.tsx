import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { AuthSession } from '@/types/api/auth.types';
import { Laptop, Loader2, LogOut, ShieldAlert, Trash2 } from 'lucide-react';

export interface ActiveSessionsCardProps {
  sessions: AuthSession[];
  isPending: boolean;
  isRevoking: boolean;
  onRevokeSession: (sessionId: string) => void;
  onLogoutAll: () => void;
}

export function ActiveSessionsCard({
  sessions,
  isPending,
  isRevoking,
  onRevokeSession,
  onLogoutAll,
}: ActiveSessionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="size-4 text-primary" />
            Perangkat & Sesi Aktif
          </CardTitle>
          <CardDescription>
            Kelola sesi login aktif akun Anda di berbagai perangkat dan browser.
          </CardDescription>
        </div>
        {sessions.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={onLogoutAll}
            disabled={isRevoking || isPending}
          >
            <LogOut className="mr-1.5 size-3.5" />
            Keluar Semua Perangkat Lain
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            <ShieldAlert className="size-4 shrink-0 text-amber-500" />
            Tidak ada data sesi aktif lainnya.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                    <Laptop className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        Sesi ID: {session.id.slice(0, 8)}...
                      </span>
                      {session.isCurrent && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          Sesi Saat Ini
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Dibuat pada: {new Date(session.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onRevokeSession(session.id)}
                    disabled={isRevoking}
                  >
                    <Trash2 className="size-4 sm:mr-1" />
                    <span className="hidden sm:inline">Cabut Sesi</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
