import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import type { DepartmentResponse } from "@/types/api/department.types";
import type { InternshipResponse } from "@/types/api/internship.types";
import type { OfficeResponse } from "@/types/api/office.types";
import type { SupervisorResponse } from "@/types/api/supervisor.types";
import { Building2, Calendar, Loader2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

// ---------- 1. Extend Modal Props & Component ----------

export interface ExtendModalProps {
  open: boolean;
  isPending: boolean;
  internship: InternshipResponse | null;
  onClose: () => void;
  onSubmit: (data: { newEndDate: string; reason: string }) => Promise<void>;
}

export function ExtendInternshipModal({
  open,
  isPending,
  internship,
  onClose,
  onSubmit,
}: ExtendModalProps) {
  const [newEndDate, setNewEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (internship?.actualEndDate) {
      setNewEndDate(internship.actualEndDate.split("T")[0] ?? "");
    } else {
      setNewEndDate("");
    }
    setReason("");
  }, [internship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndDate || !reason.trim()) return;
    await onSubmit({ newEndDate, reason: reason.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            Perpanjang Masa Magang
          </DialogTitle>
          <DialogDescription>
            Tentukan tanggal berakhir baru dan alasan perpanjangan untuk peserta{" "}
            <span className="font-semibold text-foreground">
              {internship?.internProfile?.user.fullName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="extend-new-end-date"
              className="text-xs font-medium text-foreground"
            >
              Tanggal Berakhir Baru
            </label>
            <Input
              id="extend-new-end-date"
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="extend-reason"
              className="text-xs font-medium text-foreground"
            >
              Alasan Perpanjangan
            </label>
            <Input
              id="extend-reason"
              type="text"
              placeholder="Contoh: Penambahan target proyek final..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || !newEndDate || !reason.trim()}
            >
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Simpan Perpanjangan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- 2. Change Department & Office Modal Props & Component ----------

export interface ChangeDepartmentModalProps {
  open: boolean;
  isPending: boolean;
  internship: InternshipResponse | null;
  departments: DepartmentResponse[];
  offices: OfficeResponse[];
  onClose: () => void;
  onSubmit: (data: {
    departmentId: string;
    officeLocationId: string;
  }) => Promise<void>;
}

export function ChangeDepartmentModal({
  open,
  isPending,
  internship,
  departments,
  offices,
  onClose,
  onSubmit,
}: ChangeDepartmentModalProps) {
  const [departmentId, setDepartmentId] = useState("");
  const [officeLocationId, setOfficeLocationId] = useState("");

  useEffect(() => {
    if (internship) {
      setDepartmentId(internship.departmentId ?? "");
      setOfficeLocationId(internship.officeLocationId ?? "");
    }
  }, [internship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !officeLocationId) return;
    await onSubmit({ departmentId, officeLocationId });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Pindahkan Departemen & Lokasi Kantor
          </DialogTitle>
          <DialogDescription>
            Pilih departemen dan lokasi kantor baru untuk peserta{" "}
            <span className="font-semibold text-foreground">
              {internship?.internProfile?.user.fullName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="change-dept-select"
              className="text-xs font-medium text-foreground"
            >
              Departemen Baru
            </label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="change-dept-select">
                <SelectValue placeholder="Pilih Departemen" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="change-office-select"
              className="text-xs font-medium text-foreground"
            >
              Lokasi Kantor Baru
            </label>
            <Select
              value={officeLocationId}
              onValueChange={setOfficeLocationId}
            >
              <SelectTrigger id="change-office-select">
                <SelectValue placeholder="Pilih Lokasi Kantor" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || !departmentId || !officeLocationId}
            >
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- 3. Assign Supervisor Modal Props & Component ----------

export interface AssignSupervisorModalProps {
  open: boolean;
  isPending: boolean;
  internship: InternshipResponse | null;
  supervisors: SupervisorResponse[];
  onClose: () => void;
  onSubmit: (data: { supervisorId: string }) => Promise<void>;
}

export function AssignSupervisorModal({
  open,
  isPending,
  internship,
  supervisors,
  onClose,
  onSubmit,
}: AssignSupervisorModalProps) {
  const [supervisorId, setSupervisorId] = useState("");

  useEffect(() => {
    if (internship?.supervisorAssignments?.[0]?.id) {
      setSupervisorId(internship.supervisorAssignments[0].id);
    } else {
      setSupervisorId("");
    }
  }, [internship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supervisorId) return;
    await onSubmit({ supervisorId });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-primary" />
            Tugaskan Supervisor
          </DialogTitle>
          <DialogDescription>
            Pilih supervisor pembimbing untuk peserta{" "}
            <span className="font-semibold text-foreground">
              {internship?.internProfile?.user.fullName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="assign-super-select"
              className="text-xs font-medium text-foreground"
            >
              Supervisor Pembimbing
            </label>
            <Select value={supervisorId} onValueChange={setSupervisorId}>
              <SelectTrigger id="assign-super-select">
                <SelectValue placeholder="Pilih Supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((superv) => (
                  <SelectItem key={superv.id} value={superv.id}>
                    {superv.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !supervisorId}>
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Simpan Penugasan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
