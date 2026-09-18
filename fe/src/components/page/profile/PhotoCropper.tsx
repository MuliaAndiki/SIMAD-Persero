import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/atoms';
import getCroppedImg from '@/utils/cropImage';
import { Loader2 } from 'lucide-react';

interface PhotoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export function PhotoCropper({ imageSrc, onCropComplete, onCancel, isUploading }: PhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-64 sm:h-80 w-full bg-black/10 rounded-xl overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
          cropShape="round"
          showGrid={false}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-12">Zoom</span>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Batal
        </Button>
        <Button onClick={handleApply} disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Terapkan
        </Button>
      </div>
    </div>
  );
}
