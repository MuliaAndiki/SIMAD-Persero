'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { SupervisorAssignInternDialog } from '@/components/organisms/supervisor/SupervisorAssignInternDialog';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { formatDate } from '@/utils/string.format';
import { ArrowLeft, UserPlus, Users, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function SupervisorDetailContainer({
  supervisorId,
}: {
  supervisorId: string;
}) {
  const router = useRouter();
  const api = useApi();
  const ns = useAppNameSpace();

  const [assignOpen, setAssignOpen] = useState(false);
  const [internshipId, setInternshipId] = useState('');

  const detailParams = { supervisorId };
  const detail = api.supervisor.query.detail(detailParams);
  const approvedApplications = api.application.query.list({
    status: 'APPROVED',
    limit: 100,
  });

  const assign = api.supervisor.mutate.assign();
  const removeAssignment = api.supervisor.mutate.removeAssignment();

  const handleOpenAssign = useCallback(() => {
    setInternshipId('');
    setAssignOpen(true);
  }, []);

  const handleCloseAssign = useCallback(() => {
    setInternshipId('');
    setAssignOpen(false);
  }, []);

  const handleSubmitAssign = useCallback(async () => {
    if (!internshipId) return;
    await assign.mutateAsync({
      params: { supervisorId },
      body: { internshipId },
    });
    setAssignOpen(false);
    setInternshipId('');
  }, [assign, internshipId, supervisorId]);

  const handleRemoveAssignment = useCallback(
    async (assignmentId: string) => {
      const confirmed = await ns.alert.confirm({
        title: 'Lepas Penugasan?',
        icon: 'question',
        deskripsi:
          'Intern akan dilepas dari bimbingan supervisor ini. Supervisor dapat di-assign ulang kapan saja.',
        confirmButtonText: 'Lepas',
      });
      if (!confirmed) return;
      await removeAssignment.mutateAsync({
        supervisorId,
        assignmentId,
      });
    },
    [ns.alert, removeAssignment, supervisorId],
  );

  const supervisor = detail.data;
  const isRemoving = removeAssignment.isPending;

  if (detail.isPending) {
    return (
      <Card className="p-8">
        <p>Memuat detail...</p>
      </Card>
    );
  }

  if (!supervisor) {
    return (
      <Card className="p-8 text-destructive">
        <p>Data tidak ditemukan atau gagal dimuat.</p>
      </Card>
    );
  }

  const assignedInternshipIds = (supervisor.assignments ?? [])
    .map((a) => a.internshipId)
    .filter((id): id is string => Boolean(id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Detail Supervisor</h1>
          <p className="text-sm text-muted-foreground">
            {supervisor.fullName} · {supervisor.email}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge variant={supervisor.isActive ? 'default' : 'secondary'} className="w-fit">
                {supervisor.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Bimbingan Aktif</span>
              <span className="font-medium">{supervisor.activeAssignmentsCount}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Total Penugasan</span>
              <span className="font-medium">{supervisor.assignments.length}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Intern Bimbingan</h3>
              <Button size="sm" onClick={handleOpenAssign}>
                <UserPlus className="size-4" />
                Assign Intern
              </Button>
            </div>

            {supervisor.assignments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center">
                <Users className="size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Belum ada intern yang dibimbing supervisor ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Intern</th>
                      <th className="px-4 py-3 font-medium">Departemen</th>
                      <th className="px-4 py-3 font-medium">Periode</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisor.assignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {assignment.internship?.intern?.fullName ?? '-'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {assignment.internship?.intern?.studentNumber ?? ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {assignment.internship?.department?.name ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span>
                              {formatDate(assignment.internship?.actualStartDate ?? null)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              s.d. {formatDate(assignment.internship?.actualEndDate ?? null)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{assignment.internship?.status ?? '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={isRemoving}
                            onClick={() => handleRemoveAssignment(assignment.id)}
                          >
                            <XCircle className="size-4" />
                            Lepas
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Card>

      <SupervisorAssignInternDialog
        open={assignOpen}
        internshipId={internshipId}
        approvedApplications={approvedApplications.data ?? []}
        assignedInternshipIds={assignedInternshipIds}
        isAssigning={assign.isPending}
        onInternshipIdChange={setInternshipId}
        onClose={handleCloseAssign}
        onSubmit={handleSubmitAssign}
      />
    </div>
  );
}
