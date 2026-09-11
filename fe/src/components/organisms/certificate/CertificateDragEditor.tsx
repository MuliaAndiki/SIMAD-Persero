'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import {
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCheck,
  GripVertical,
  Italic,
  Maximize2,
  Minimize2,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Type,
  Undo2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FieldItem {
  id: string;
  label: string;
  type: 'system' | 'custom' | 'signature';
  xPct: number;
  yPct: number;
  scale: number;
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  uppercase?: boolean;
  align?: 'center' | 'left' | 'right';
  letterSpacing?: string;
  baseEm?: number;
}

export interface SampleData {
  internName: string;
  internNim: string;
  departmentName: string;
  unitName: string;
  cityName: string;
  periodText: string;
  gradeText: string;
  signerName: string;
  signerRole: string;
  signatureUrl?: string;
}

export interface CertificateDragEditorProps {
  templateUrl?: string;
  signatureUrl?: string;
  signerName?: string;
  signerRole?: string;
  internName?: string;
  internNim?: string;
  departmentName?: string;
  unitName?: string;
  cityName?: string;
  periodText?: string;
  gradeText?: string;
  onLayoutSaved?: (fields: FieldItem[]) => void;
}

// ─── Default Fields ───────────────────────────────────────────────────────────

export const DEFAULT_FIELDS: FieldItem[] = [
  {
    id: 'title',
    label: 'Judul Sertifikat',
    type: 'system',
    xPct: 50,
    yPct: 27,
    scale: 1.0,
    baseEm: 1.55,
    text: '',
    color: '#0ba1b9',
    bold: true,
    italic: false,
    uppercase: true,
    letterSpacing: '0.22em',
    align: 'center',
  },
  {
    id: 'subtitle',
    label: 'Teks "diberikan kepada"',
    type: 'system',
    xPct: 50,
    yPct: 33.5,
    scale: 1.0,
    baseEm: 0.75,
    text: '',
    color: '#334155',
    bold: false,
    italic: false,
    uppercase: false,
    align: 'center',
  },
  {
    id: 'name',
    label: 'Nama Penerima',
    type: 'system',
    xPct: 50,
    yPct: 40,
    scale: 1.0,
    baseEm: 1.25,
    text: '',
    color: '#000000',
    bold: true,
    italic: false,
    uppercase: true,
    align: 'center',
  },
  {
    id: 'nim',
    label: 'NIM',
    type: 'system',
    xPct: 50,
    yPct: 46,
    scale: 1.0,
    baseEm: 0.72,
    text: '',
    color: '#000000',
    bold: true,
    italic: false,
    uppercase: false,
    align: 'center',
  },
  {
    id: 'body',
    label: 'Paragraf Deskripsi',
    type: 'system',
    xPct: 50,
    yPct: 53,
    scale: 1.0,
    baseEm: 0.62,
    text: '',
    color: '#1e293b',
    bold: false,
    italic: false,
    uppercase: false,
    align: 'center',
  },
  {
    id: 'grade',
    label: 'Nilai / Predikat',
    type: 'system',
    xPct: 50,
    yPct: 60.5,
    scale: 1.0,
    baseEm: 1.1,
    text: '',
    color: '#0ba1b9',
    bold: true,
    italic: false,
    uppercase: true,
    letterSpacing: '0.16em',
    align: 'center',
  },
  {
    id: 'cityDate',
    label: 'Kota & Tanggal',
    type: 'system',
    xPct: 50,
    yPct: 68,
    scale: 1.0,
    baseEm: 0.62,
    text: '',
    color: '#334155',
    bold: false,
    italic: false,
    uppercase: false,
    align: 'center',
  },
  {
    id: 'signature',
    label: 'Tanda Tangan / Cap',
    type: 'signature',
    xPct: 50,
    yPct: 76,
    scale: 1.0,
    baseEm: 1.0,
    text: '',
    align: 'center',
  },
  {
    id: 'signerName',
    label: 'Nama Penandatangan',
    type: 'system',
    xPct: 50,
    yPct: 87,
    scale: 1.0,
    baseEm: 0.72,
    text: '',
    color: '#000000',
    bold: true,
    italic: false,
    uppercase: true,
    align: 'center',
  },
  {
    id: 'signerRole',
    label: 'Jabatan Penandatangan',
    type: 'system',
    xPct: 50,
    yPct: 91,
    scale: 1.0,
    baseEm: 0.6,
    text: '',
    color: '#475569',
    bold: false,
    italic: false,
    uppercase: false,
    align: 'center',
  },
  {
    id: 'signerUnit',
    label: 'Unit PLN',
    type: 'system',
    xPct: 50,
    yPct: 94.5,
    scale: 1.0,
    baseEm: 0.6,
    text: 'PLN UID Aceh',
    color: '#475569',
    bold: false,
    italic: false,
    uppercase: false,
    align: 'center',
  },
];

const COLOR_PRESETS = [
  { label: 'PLN Cyan', value: '#0ba1b9' },
  { label: 'Hitam', value: '#000000' },
  { label: 'Abu Gelap', value: '#1e293b' },
  { label: 'Abu-abu', value: '#475569' },
  { label: 'Emas', value: '#d97706' },
  { label: 'Biru', value: '#2563eb' },
  { label: 'Merah', value: '#dc2626' },
  { label: 'Putih', value: '#ffffff' },
];

const LAYOUT_STORAGE_KEY = 'simad_cert_layout_v4';

function loadStoredFields(): FieldItem[] {
  if (typeof window === 'undefined') return DEFAULT_FIELDS;
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FieldItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_FIELDS;
}

function persistStoredFields(fields: FieldItem[]) {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(fields));
  } catch {
    // quota
  }
}

function getFieldDisplayText(field: FieldItem, sample: SampleData): string {
  if (field.text && field.text.trim().length > 0) {
    return field.text;
  }
  switch (field.id) {
    case 'title':
      return 'SERTIFIKAT';
    case 'subtitle':
      return 'diberikan kepada';
    case 'name':
      return sample.internName;
    case 'nim':
      return `NIM: ${sample.internNim}`;
    case 'body':
      return `Telah menyelesaikan program magang di PT PLN (Persero) ${sample.unitName} pada bidang ${sample.departmentName} dari tanggal ${sample.periodText} dengan hasil :`;
    case 'grade':
      return sample.gradeText;
    case 'cityDate':
      return `${sample.cityName}, 31 Agustus 2026`;
    case 'signerName':
      return sample.signerName;
    case 'signerRole':
      return sample.signerRole;
    case 'signerUnit':
      return 'PLN UID Aceh';
    default:
      return field.text || field.label;
  }
}

// ─── Draggable Field Sub-component ────────────────────────────────────────────

interface DraggableFieldProps {
  field: FieldItem;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, xPct: number, yPct: number) => void;
  sampleData: SampleData;
}

function DraggableField({
  field,
  canvasRef,
  isSelected,
  onSelect,
  onPositionChange,
  sampleData,
}: DraggableFieldProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const getPixelPos = useCallback((): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    return {
      x: (field.xPct / 100) * canvas.offsetWidth,
      y: (field.yPct / 100) * canvas.offsetHeight,
    };
  }, [field.xPct, field.yPct, canvasRef]);

  const handleStop = (_e: DraggableEvent, data: DraggableData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const xPct = Math.max(0, Math.min(100, (data.x / canvas.offsetWidth) * 100));
    const yPct = Math.max(0, Math.min(100, (data.y / canvas.offsetHeight) * 100));
    onPositionChange(field.id, xPct, yPct);
  };

  const displayText = getFieldDisplayText(field, sampleData);
  const px = getPixelPos();
  const baseEm = field.baseEm ?? 0.85;
  const badgeColor = field.color && field.color !== '#ffffff' ? field.color : '#0ba1b9';

  return (
    <Draggable
      nodeRef={nodeRef as unknown as React.RefObject<HTMLElement>}
      position={px}
      onStop={handleStop}
      onStart={() => onSelect(field.id)}
      bounds="parent"
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className="absolute left-0 top-0 select-none pointer-events-auto"
        style={{
          zIndex: isSelected ? 50 : 10,
        }}
      >
        <button
          type="button"
          className="relative flex flex-col items-center cursor-move transition-shadow"
          style={{
            transform: 'translate(-50%, -50%)',
            outline: isSelected ? `2px dashed ${badgeColor}` : '1px dashed rgba(120,120,120,0.3)',
            outlineOffset: '2px',
            borderRadius: '2px',
            background: isSelected ? 'rgba(255,255,255,0.45)' : 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            fontFamily: 'inherit',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(field.id);
          }}
        >
          {/* Floating drag handle pill above the element (does NOT push content) */}
          <div
            className="drag-handle absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full cursor-grab active:cursor-grabbing select-none shadow-xs"
            style={{
              background: badgeColor,
              fontSize: '8px',
              color: '#fff',
              fontWeight: 600,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              opacity: isSelected ? 1 : 0.65,
            }}
          >
            <GripVertical size={8} />
            <span>{field.label}</span>
          </div>

          {/* Content Render — Identical styling to Preview */}
          {field.type === 'signature' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sampleData.signatureUrl || '/images/sample-signature.png'}
              alt="Tanda Tangan"
              style={{
                height: `${5 * field.scale}em`,
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
              draggable={false}
            />
          ) : (
            <span
              style={{
                fontSize: `${baseEm * field.scale}em`,
                fontWeight: field.bold ? 700 : 400,
                fontStyle: field.italic ? 'italic' : 'normal',
                textTransform: field.uppercase ? 'uppercase' : 'none',
                letterSpacing: field.letterSpacing || 'normal',
                color: field.color || '#000000',
                textAlign: field.align || 'center',
                display: 'block',
                maxWidth: field.id === 'body' ? '54ch' : undefined,
                lineHeight: 1.3,
                pointerEvents: 'none',
              }}
            >
              {displayText}
            </span>
          )}
        </button>
      </div>
    </Draggable>
  );
}

// ─── Sidebar Property Editor (Mode Editor) ────────────────────────────────────

interface FieldSidebarProps {
  field: FieldItem | null;
  fields: FieldItem[];
  sampleData: SampleData;
  onUpdateField: (updated: FieldItem) => void;
  onAddField: () => void;
  onDeleteField: (id: string) => void;
  onSelectField: (id: string) => void;
  onClose: () => void;
}

function FieldSidebar({
  field,
  fields,
  sampleData,
  onUpdateField,
  onAddField,
  onDeleteField,
  onSelectField,
  onClose,
}: FieldSidebarProps) {
  if (!field) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b flex items-center justify-between bg-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daftar Elemen ({fields.length})
          </span>
          <Button type="button" size="sm" onClick={onAddField} className="h-7 text-xs gap-1 px-2.5">
            <Plus className="size-3.5" />
            Tambah Teks
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {fields.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectField(f.id)}
              className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-muted text-xs transition-colors group"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className="size-2.5 rounded-full shrink-0"
                  style={{ background: f.color || '#0ba1b9' }}
                />
                <span className="font-medium text-foreground truncate">{f.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground font-mono text-[10px]">
                {f.type === 'custom' && (
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-sans">
                    Kustom
                  </span>
                )}
                <span>{(f.scale * 100).toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const isCustom = field.type === 'custom';
  const defaultText = getFieldDisplayText({ ...field, text: '' }, sampleData);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full" style={{ background: field.color || '#0ba1b9' }} />
          <span className="text-sm font-bold text-foreground truncate max-w-[140px]">
            {field.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isCustom && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteField(field.id)}
              className="size-7 p-0 text-destructive hover:bg-destructive/10"
              title="Hapus Elemen"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="size-7 p-0 text-muted-foreground"
            title="Tutup"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Edit Label Name */}
      <div className="space-y-1.5">
        <label htmlFor="edit-field-label" className="text-xs font-semibold text-foreground">
          Nama Label Elemen
        </label>
        <Input
          id="edit-field-label"
          className="h-8 text-xs"
          value={field.label}
          onChange={(e) => onUpdateField({ ...field, label: e.target.value })}
          placeholder="Nama label"
        />
      </div>

      {/* Edit Text Content (if not signature) */}
      {field.type !== 'signature' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="edit-field-text" className="text-xs font-semibold text-foreground">
              Isi Teks
            </label>
            {field.text && field.type === 'system' && (
              <button
                type="button"
                onClick={() => onUpdateField({ ...field, text: '' })}
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
              >
                <RefreshCw className="size-2.5" /> Pakai Data Dinamis
              </button>
            )}
          </div>
          {field.id === 'body' ? (
            <textarea
              id="edit-field-text"
              className="w-full rounded-md border border-input bg-background p-2 text-xs min-h-[70px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={field.text}
              onChange={(e) => onUpdateField({ ...field, text: e.target.value })}
              placeholder={defaultText}
            />
          ) : (
            <Input
              id="edit-field-text"
              className="h-8 text-xs"
              value={field.text}
              onChange={(e) => onUpdateField({ ...field, text: e.target.value })}
              placeholder={defaultText}
            />
          )}
          {field.type === 'system' && !field.text && (
            <p className="text-[10px] text-muted-foreground italic">
              Saat ini menggunakan data otomatis: &quot;{defaultText}&quot;
            </p>
          )}
        </div>
      )}

      {/* Color Picker & Presets (if not signature) */}
      {field.type !== 'signature' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="color-custom-input"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Palette className="size-3.5 text-primary" />
              Warna Teks
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="color-custom-input"
                type="color"
                value={field.color || '#000000'}
                onChange={(e) => onUpdateField({ ...field, color: e.target.value })}
                className="size-6 rounded border border-border cursor-pointer p-0 bg-transparent"
                title="Pilih warna kustom"
              />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                {field.color || '#000000'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onUpdateField({ ...field, color: preset.value })}
                className={`flex items-center gap-1 p-1.5 rounded border text-[10px] transition-all ${
                  field.color === preset.value
                    ? 'border-primary ring-1 ring-primary bg-primary/5 font-semibold'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div
                  className="size-3 rounded-full border border-black/20 shrink-0"
                  style={{ background: preset.value }}
                />
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Font Size Scale */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="font-scale-range"
            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <Type className="size-3.5 text-primary" />
            Ukuran Font
          </label>
          <span className="font-mono text-xs font-bold text-primary">
            {(field.scale * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateField({
                ...field,
                scale: Math.max(0.4, Number((field.scale - 0.05).toFixed(2))),
              })
            }
            className="size-7 p-0"
            title="Perkecil Font"
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <input
            id="font-scale-range"
            type="range"
            min={0.4}
            max={2.5}
            step={0.05}
            value={field.scale}
            onChange={(e) => onUpdateField({ ...field, scale: Number.parseFloat(e.target.value) })}
            className="flex-1 h-1.5 accent-primary cursor-pointer"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateField({
                ...field,
                scale: Math.min(2.5, Number((field.scale + 0.05).toFixed(2))),
              })
            }
            className="size-7 p-0"
            title="Perbesar Font"
          >
            <ChevronUp className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Font Style: Bold, Italic, Uppercase, Align (if not signature) */}
      {field.type !== 'signature' && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground">Gaya &amp; Format Teks</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Bold Toggle */}
            <Button
              type="button"
              variant={field.bold ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateField({ ...field, bold: !field.bold })}
              className="h-8 px-2.5 text-xs gap-1"
              title="Tebal (Bold)"
            >
              <Bold className="size-3.5" />
              <span>Bold</span>
            </Button>

            {/* Italic Toggle */}
            <Button
              type="button"
              variant={field.italic ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateField({ ...field, italic: !field.italic })}
              className="h-8 px-2.5 text-xs gap-1"
              title="Miring (Italic)"
            >
              <Italic className="size-3.5" />
              <span>Italic</span>
            </Button>

            {/* Uppercase Toggle */}
            <Button
              type="button"
              variant={field.uppercase ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateField({ ...field, uppercase: !field.uppercase })}
              className="h-8 px-2.5 text-xs gap-1 font-mono font-bold"
              title="Huruf Besar (UPPERCASE)"
            >
              TT
            </Button>

            {/* Text Alignment */}
            <div className="flex items-center rounded-md border border-input p-0.5 ml-auto">
              <button
                type="button"
                onClick={() => onUpdateField({ ...field, align: 'left' })}
                className={`p-1 rounded ${
                  field.align === 'left'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Rata Kiri"
              >
                <AlignLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateField({ ...field, align: 'center' })}
                className={`p-1 rounded ${
                  !field.align || field.align === 'center'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Rata Tengah"
              >
                <AlignHorizontalJustifyCenter className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateField({ ...field, align: 'right' })}
                className={`p-1 rounded ${
                  field.align === 'right'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Rata Kanan"
              >
                <AlignRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Position & Fine-Tuning */}
      <div className="space-y-2 rounded-lg bg-muted/30 border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Posisi Koordinat (%)</span>
          <div className="font-mono text-[11px] text-muted-foreground">
            X: {field.xPct.toFixed(1)}% • Y: {field.yPct.toFixed(1)}%
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Gunakan tombol di bawah untuk pergeseran presisi halus:
        </p>
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUpdateField({ ...field, xPct: Math.max(0, field.xPct - 0.5) })}
            className="size-7 p-0"
            title="Geser Kiri (0.5%)"
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdateField({ ...field, yPct: Math.max(0, field.yPct - 0.5) })}
              className="size-7 p-0"
              title="Geser Atas (0.5%)"
            >
              <ArrowUp className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdateField({ ...field, yPct: Math.min(100, field.yPct + 0.5) })}
              className="size-7 p-0"
              title="Geser Bawah (0.5%)"
            >
              <ArrowDown className="size-3.5" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUpdateField({ ...field, xPct: Math.min(100, field.xPct + 0.5) })}
            className="size-7 p-0"
            title="Geser Kanan (0.5%)"
          >
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Mode Pratinjau (Menjaga Dimensi Kanvas 100% Identik) ─────────────

interface PreviewSidebarProps {
  sampleData: SampleData;
  onUpdateSampleData: (data: SampleData) => void;
  onBackToEditor: () => void;
  onSave: () => void;
  isSaved: boolean;
  templateFileName?: string;
}

function PreviewSidebar({
  sampleData,
  onUpdateSampleData,
  onBackToEditor,
  onSave,
  isSaved,
  templateFileName,
}: PreviewSidebarProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-5 bg-card">
      {/* Header */}
      <div className="pb-2 border-b">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Pratinjau Cetak Final</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Tampilan identik sesuai dengan sertifikat yang akan diterbitkan.
        </p>
      </div>

      {/* Info Status Dimensi */}
      <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FileCheck className="size-3.5 text-emerald-500" />
          Dimensi &amp; Format
        </span>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
            A4 Landscape
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-mono">
            29,7 cm × 21,0 cm
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Template: {templateFileName || 'Template Resmi PT PLN (Persero)'}
        </p>
      </div>

      {/* Form Uji Data Simulasi */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-foreground block">
          Uji Coba Data Penerima (Simulasi)
        </span>

        <div className="space-y-1">
          <label
            htmlFor="preview-intern-name"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Nama Mahasiswa
          </label>
          <Input
            id="preview-intern-name"
            className="h-8 text-xs font-medium"
            value={sampleData.internName}
            onChange={(e) => onUpdateSampleData({ ...sampleData, internName: e.target.value })}
            placeholder="Nama Mahasiswa"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="preview-intern-nim"
            className="text-[11px] font-medium text-muted-foreground"
          >
            NIM
          </label>
          <Input
            id="preview-intern-nim"
            className="h-8 text-xs font-medium"
            value={sampleData.internNim}
            onChange={(e) => onUpdateSampleData({ ...sampleData, internNim: e.target.value })}
            placeholder="NIM Mahasiswa"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="preview-intern-grade"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Predikat / Hasil
          </label>
          <Input
            id="preview-intern-grade"
            className="h-8 text-xs font-medium text-[#0ba1b9]"
            value={sampleData.gradeText}
            onChange={(e) => onUpdateSampleData({ ...sampleData, gradeText: e.target.value })}
            placeholder="Predikat Nilai"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="preview-intern-dept"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Bidang / Departemen
          </label>
          <Input
            id="preview-intern-dept"
            className="h-8 text-xs font-medium"
            value={sampleData.departmentName}
            onChange={(e) => onUpdateSampleData({ ...sampleData, departmentName: e.target.value })}
            placeholder="Bidang Penempatan"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t space-y-2 mt-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToEditor}
          className="w-full text-xs gap-1.5"
        >
          <Pencil className="size-3.5 text-violet-500" />
          <span>Kembali ke Mode Edit</span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          className={`w-full text-xs gap-1.5 transition-all ${
            isSaved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
          }`}
        >
          {isSaved ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
          <span>{isSaved ? 'Tersimpan ✓' : 'Simpan Layout'}</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CertificateDragEditor({
  templateUrl,
  signatureUrl,
  signerName = 'NURLANA',
  signerRole = 'Senior Manager Keuangan, Komunikasi & Umum',
  internName = 'ALYA ISRAJ FATIN',
  internNim = '230401039',
  departmentName = 'Keuangan, Komunikasi & Umum',
  unitName = 'Unit Induk Distribusi Aceh',
  cityName = 'Banda Aceh',
  periodText = '1 Juli hingga 31 Agustus 2026',
  gradeText = 'SANGAT KOMPETEN',
  onLayoutSaved,
}: CertificateDragEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [fields, setFields] = useState<FieldItem[]>(() => loadStoredFields());
  const [savedFields, setSavedFields] = useState<FieldItem[]>(() => loadStoredFields());
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(850);

  const isPdf = templateUrl?.toLowerCase().endsWith('.pdf');

  const [sampleData, setSampleData] = useState<SampleData>({
    internName,
    internNim,
    departmentName,
    unitName,
    cityName,
    periodText,
    gradeText,
    signerName,
    signerRole,
    signatureUrl,
  });

  // Keep signer props in sync if changed from parent
  useEffect(() => {
    setSampleData((prev) => ({
      ...prev,
      signerName: signerName || prev.signerName,
      signerRole: signerRole || prev.signerRole,
      signatureUrl: signatureUrl || prev.signatureUrl,
    }));
  }, [signerName, signerRole, signatureUrl]);

  // Measure canvas size for 100% proportional font scaling
  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setCanvasWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePositionChange = useCallback((id: string, xPct: number, yPct: number) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, xPct, yPct } : f)));
    setIsSaved(false);
  }, []);

  const handleUpdateField = useCallback((updated: FieldItem) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setIsSaved(false);
  }, []);

  const handleAddField = useCallback(() => {
    const newId = `custom_${Date.now()}`;
    const customCount = fields.filter((f) => f.type === 'custom').length + 1;
    const newField: FieldItem = {
      id: newId,
      label: `Label Baru ${customCount}`,
      type: 'custom',
      xPct: 50,
      yPct: 50,
      scale: 1.0,
      baseEm: 0.85,
      text: 'Teks Baru',
      color: '#000000',
      bold: false,
      italic: false,
      uppercase: false,
      align: 'center',
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newId);
    setIsSaved(false);
    toast.success('Elemen teks baru berhasil ditambahkan');
  }, [fields]);

  const handleDeleteField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedFieldId(null);
    setIsSaved(false);
    toast.info('Elemen berhasil dihapus');
  }, []);

  const handleSave = () => {
    persistStoredFields(fields);
    setSavedFields([...fields]);
    setIsSaved(true);
    onLayoutSaved?.(fields);
    toast.success('Tata letak sertifikat berhasil disimpan');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setFields([...DEFAULT_FIELDS]);
    setSelectedFieldId(null);
    setIsSaved(false);
    toast.info('Tata letak dikembalikan ke pengaturan default');
  };

  const handleUndo = () => {
    setFields([...savedFields]);
    setIsSaved(false);
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;
  const hasChanges = JSON.stringify(fields) !== JSON.stringify(savedFields);

  return (
    <div
      className={`flex flex-col h-full bg-background ${
        isFullscreen ? 'fixed inset-0 z-[100]' : ''
      }`}
    >
      {/* ── Top Toolbar ── */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b bg-card shrink-0">
        {/* Left: Kembali & Tab Mode Switcher */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1.5">
            <Link href="/hr_admin/certificate-setting">
              <ArrowLeft className="size-3.5" />
              <span>Kembali</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Pencil className="size-3.5 text-violet-500" />
              <span>Editor Tata Letak</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('preview');
                setSelectedFieldId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="size-3.5 text-primary" />
              <span>Pratinjau Hasil</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {activeTab === 'editor' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
              className="h-8 gap-1.5 text-xs border-dashed"
            >
              <Plus className="size-3.5 text-primary" />
              <span>Tambah Teks</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen((f) => !f)}
            className="h-8 gap-1 text-xs"
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            </span>
          </Button>

          {activeTab === 'editor' && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasChanges}
                onClick={handleUndo}
                className="h-8 gap-1 text-xs"
              >
                <Undo2 className="size-3.5" />
                <span className="hidden sm:inline">Batalkan</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 gap-1 text-xs"
              >
                <RefreshCw className="size-3.5" />
                <span className="hidden sm:inline">Reset Default</span>
              </Button>
            </>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className={`h-8 gap-1.5 text-xs transition-all ${
              isSaved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
            }`}
          >
            {isSaved ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
            <span>{isSaved ? 'Tersimpan ✓' : 'Simpan Layout'}</span>
          </Button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Canvas Area (Width stays 100% constant in both Editor and Preview) */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/60 flex flex-col items-center">
          {/* Top Info Banner */}
          {activeTab === 'editor' ? (
            <div className="w-full max-w-4xl mb-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/80 border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <GripVertical className="size-3.5 text-violet-500" />
                <span>
                  Seret label pada elemen untuk mengubah posisi • Klik elemen untuk mengatur teks,
                  ukuran, warna, bold, &amp; italic di panel samping.
                </span>
              </div>
              <span className="font-mono text-[10px] hidden sm:inline">A4 (29,7 cm × 21 cm)</span>
            </div>
          ) : (
            <div className="w-full max-w-4xl mb-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
              <div className="flex items-center gap-1.5 font-medium">
                <Eye className="size-3.5" />
                <span>
                  Mode Pratinjau Bersih — Menampilkan hasil sertifikat cetak final sesuai dengan
                  posisi dan ukuran di editor.
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('editor')}
                className="h-6 text-[11px] text-primary hover:text-primary px-2"
              >
                <Pencil className="size-3 mr-1" />
                Kembali ke Editor
              </Button>
            </div>
          )}

          {/* A4 Landscape Canvas — Fixed Aspect Ratio 297/210 & Responsive Font Size */}
          <div className="w-full max-w-4xl">
            <div
              ref={canvasRef}
              className="relative w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl bg-white select-none"
              style={{
                aspectRatio: '297 / 210',
                fontSize: `${Math.max(10, canvasWidth * 0.0175)}px`,
              }}
              onClick={() => activeTab === 'editor' && setSelectedFieldId(null)}
              onKeyDown={(e) => e.key === 'Escape' && setSelectedFieldId(null)}
              role="presentation"
            >
              {/* Background Template */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={templateUrl && !isPdf ? templateUrl : '/images/FORMAT.png'}
                alt="Template Sertifikat"
                className="absolute inset-0 size-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* ── MODE 1: Interactive Draggable Editor ── */}
              {activeTab === 'editor' &&
                fields.map((f) => (
                  <DraggableField
                    key={f.id}
                    field={f}
                    canvasRef={canvasRef}
                    isSelected={selectedFieldId === f.id}
                    onSelect={setSelectedFieldId}
                    onPositionChange={handlePositionChange}
                    sampleData={sampleData}
                  />
                ))}

              {/* ── MODE 2: Clean Photorealistic Preview (100% IDENTICAL SIZING & POSITIONS) ── */}
              {activeTab === 'preview' &&
                fields.map((f) => {
                  const displayText = getFieldDisplayText(f, sampleData);
                  const baseEm = f.baseEm ?? 0.85;

                  return (
                    <div
                      key={f.id}
                      className="absolute select-none pointer-events-none"
                      style={{
                        left: `${f.xPct}%`,
                        top: `${f.yPct}%`,
                        transform: 'translate(-50%, -50%)',
                        textAlign: f.align || 'center',
                      }}
                    >
                      {f.type === 'signature' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={sampleData.signatureUrl || '/images/sample-signature.png'}
                          alt="Tanda Tangan"
                          style={{
                            height: `${5 * f.scale}em`,
                            objectFit: 'contain',
                            pointerEvents: 'none',
                          }}
                          draggable={false}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: `${baseEm * f.scale}em`,
                            fontWeight: f.bold ? 700 : 400,
                            fontStyle: f.italic ? 'italic' : 'normal',
                            textTransform: f.uppercase ? 'uppercase' : 'none',
                            letterSpacing: f.letterSpacing || 'normal',
                            color: f.color || '#000000',
                            textAlign: f.align || 'center',
                            maxWidth: f.id === 'body' ? '54ch' : undefined,
                            lineHeight: 1.3,
                            display: 'block',
                            pointerEvents: 'none',
                          }}
                        >
                          {displayText}
                        </span>
                      )}
                    </div>
                  );
                })}

              {/* Footer PLN Branding (AKHLAK & Website) */}
              <div className="absolute inset-x-0 bottom-0 pointer-events-none flex items-end justify-between px-[5%] pb-[3%]">
                <div className="text-left flex flex-col">
                  <span className="text-[0.45em] font-bold text-slate-800 tracking-wider">
                    CORE VALUES PLN
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[0.6em] font-black text-[#0ba1b9] tracking-tight">
                      AKHLAK
                    </span>
                    <span className="text-[0.42em] text-slate-600 font-medium">
                      | Amanah Kompeten Harmonis Loyal Adaptif Kolaboratif
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[0.5em] font-semibold text-white tracking-wider">
                    www.pln.co.id
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground mt-2.5">
              Standar Dimensi Resmi A4 Landscape: 29,7 cm × 21,0 cm • Rasio 297:210
            </p>
          </div>
        </div>

        {/* ── Right Sidebar: Constant Width (w-80) in both Editor & Preview to ensure 100% stable canvas size ── */}
        <aside className="w-80 shrink-0 border-l bg-card flex flex-col overflow-hidden">
          {activeTab === 'editor' ? (
            <FieldSidebar
              field={selectedField}
              fields={fields}
              sampleData={sampleData}
              onUpdateField={handleUpdateField}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
              onSelectField={setSelectedFieldId}
              onClose={() => setSelectedFieldId(null)}
            />
          ) : (
            <PreviewSidebar
              sampleData={sampleData}
              onUpdateSampleData={setSampleData}
              onBackToEditor={() => setActiveTab('editor')}
              onSave={handleSave}
              isSaved={isSaved}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
