'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MonitorSmartphone, ScanLine, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAInstallQR() {
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
      className="flex flex-col items-center gap-3 p-4 bg-background/50 backdrop-blur-md rounded-2xl border border-border shadow-lg"
    >
      <div className="flex items-center justify-between w-full gap-4 text-sm font-semibold text-foreground">
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="size-4 text-[#00A2E9]" />
          <span>Install App di HP Kamu</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
          aria-label={isExpanded ? 'Perkecil QR' : 'Perbesar QR'}
        >
          {isExpanded ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
        </button>
      </div>
      <motion.div layout className="relative p-2 bg-white rounded-xl">
        <QRCodeSVG
          value={installUrl}
          size={isExpanded ? 240 : 120}
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
          className="absolute inset-0 border-2 border-[#00A2E9]/20 rounded-xl pointer-events-none"
        />
      </motion.div>
      <motion.div
        layout
        className="flex items-center gap-1.5 text-xs text-muted-foreground text-center"
      >
        <ScanLine className="size-3.5 shrink-0" />
        <span>
          Scan QR Code ini dengan HP
          <br />
          untuk install SIMAD{' '}
        </span>
      </motion.div>
    </motion.div>
  );
}
