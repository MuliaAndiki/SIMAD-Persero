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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Bell, Loader2, Send } from 'lucide-react';
import { useState } from 'react';

export interface SendNotificationModalProps {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    message: string;
    typeCode?: string;
    isBroadcast?: boolean;
  }) => Promise<void>;
}

export function SendNotificationModal({
  open,
  isPending,
  onClose,
  onSubmit,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [typeCode, setTypeCode] = useState('ANNOUNCEMENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    await onSubmit({
      title: title.trim(),
      message: message.trim(),
      typeCode,
      isBroadcast: true,
    });
    setTitle('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            Kirim Pengumuman / Notifikasi Siaran
          </DialogTitle>
          <DialogDescription>
            Kirimkan notifikasi langsung ke seluruh pengguna terdaftar di sistem.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="send-notif-type" className="text-xs font-medium text-foreground">
              Tipe Pengumuman
            </label>
            <Select value={typeCode} onValueChange={setTypeCode}>
              <SelectTrigger id="send-notif-type">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANNOUNCEMENT">Pengumuman (ANNOUNCEMENT)</SelectItem>
                <SelectItem value="INFO">Informasi (INFO)</SelectItem>
                <SelectItem value="WARNING">Peringatan (WARNING)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="send-notif-title" className="text-xs font-medium text-foreground">
              Judul Pengumuman
            </label>
            <Input
              id="send-notif-title"
              type="text"
              placeholder="Judul pengumuman..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="send-notif-message" className="text-xs font-medium text-foreground">
              Isi Pesan
            </label>
            <textarea
              id="send-notif-message"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tuliskan isi pengumuman secara rinci..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !title.trim() || !message.trim()}>
              {isPending ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 size-4" />
              )}
              Kirim Notifikasi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
