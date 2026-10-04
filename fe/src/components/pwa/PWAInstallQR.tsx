'use client';

import { motion } from 'framer-motion';
import { MonitorSmartphone, ScanLine, Smartphone, ZoomIn, ZoomOut } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { PWAInstallDialog } from './PWAInstallDialog';

interface PWAInstallQRProps {
  className?: string;
}

export function PWAInstallQR({ className = '' }: PWAInstallQRProps) {
  const [installUrl, setInstallUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a URL pointing to the home page with ?pwa=install
      const url = new URL(window.location.href);
      url.searchParams.set('pwa', 'install');
      setInstallUrl(url.toString());
    }
  }, []);

  if (!installUrl) return null;

  return (
    <motion.div
      layout
      className={`flex flex-col items-center gap-3 p-4 bg-card/90 backdrop-blur-md rounded-2xl border border-border shadow-md hover:border-primary/40 transition-all ${className}`}
    >
      <div className="flex items-center justify-between w-full gap-4 text-xs sm:text-sm font-semibold text-foreground">
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="w-4 h-4 text-primary" />
          <span>Pasang Aplikasi SIMAD di HP</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label={isExpanded ? 'Perkecil QR' : 'Perbesar QR'}
        >
          {isExpanded ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        </button>
      </div>

      <motion.div layout className="relative p-2.5 bg-white rounded-xl shadow-xs">
        <QRCodeSVG
          value={installUrl}
          size={isExpanded ? 200 : 110}
          bgColor="#ffffff"
          fgColor="#000000"
          level="Q"
          imageSettings={{
            src: '/images/logos.png',
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
        <motion.div
          layout
          className="absolute inset-0 border-2 border-primary/20 rounded-xl pointer-events-none"
        />
      </motion.div>

      <motion.div
        layout
        className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground text-center"
      >
        <div className="flex items-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Scan dengan kamera HP untuk pasang PWA</span>
        </div>

        <PWAInstallDialog
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer mt-0.5"
            >
              <Smartphone className="w-3 h-3" />
              <span>Atau pasang langsung di perangkat ini</span>
            </button>
          }
        />
      </motion.div>
    </motion.div>
  );
}
