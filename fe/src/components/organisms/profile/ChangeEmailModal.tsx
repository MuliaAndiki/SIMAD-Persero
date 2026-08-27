import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { KeyRound, Loader2, Mail, Send } from 'lucide-react';
import { useState } from 'react';

export interface ChangeEmailModalProps {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onChangeEmailSubmit: (data: { newEmail: string; password: string }) => Promise<
    boolean | undefined
  >;
  onVerifyTokenSubmit: (token: string) => Promise<boolean | undefined>;
}

export function ChangeEmailModal({
  open,
  isPending,
  onClose,
  onChangeEmailSubmit,
  onVerifyTokenSubmit,
}: ChangeEmailModalProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const handleReset = () => {
    setStep('request');
    setNewEmail('');
    setPassword('');
    setToken('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !password) return;
    const res = await onChangeEmailSubmit({ newEmail, password });
    if (res !== false) {
      setStep('verify');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await onVerifyTokenSubmit(token);
    if (res !== false) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            {step === 'request' ? 'Ubah Alamat Email' : 'Verifikasi Token Email Baru'}
          </DialogTitle>
          <DialogDescription>
            {step === 'request'
              ? 'Masukkan alamat email baru dan kata sandi Anda saat ini untuk menerima kode/token verifikasi.'
              : 'Masukkan kode/token verifikasi yang telah dikirimkan ke alamat email baru Anda.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'request' ? (
          <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="change-new-email" className="text-xs font-medium text-foreground">
                Email Baru
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="change-new-email"
                  type="email"
                  placeholder="email.baru@example.com"
                  className="pl-9"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="change-current-password"
                className="text-xs font-medium text-foreground"
              >
                Password Saat Ini
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="change-current-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending || !newEmail || !password}>
                {isPending ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <Send className="mr-1.5 size-4" />
                )}
                Kirim Token Verifikasi
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="change-verify-token" className="text-xs font-medium text-foreground">
                Token Verifikasi
              </label>
              <Input
                id="change-verify-token"
                type="text"
                placeholder="Masukkan token dari email..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('request')}
                disabled={isPending}
              >
                Kembali
              </Button>
              <Button type="submit" disabled={isPending || !token}>
                {isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                Verifikasi & Simpan Email
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
