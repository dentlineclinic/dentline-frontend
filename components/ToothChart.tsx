"use client";

import { useState } from "react";

// ── FDI layout ────────────────────────────────────────────────────────────────
// Each tooth: code, abbreviated label, width (relative), and tooth-type hint
// for shape rendering (incisor | canine | premolar | molar)

type ToothKind = "incisor" | "canine" | "premolar" | "molar";

interface ToothDef {
  code: string;
  label: string;
  short: string;
  kind: ToothKind;
}

// Upper arch — left-to-right from patient's right to patient's left
// (viewer sees: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28)
const UPPER_PERMANENT: ToothDef[] = [
  { code: "18", label: "3rd Molar",       short: "M3",  kind: "molar" },
  { code: "17", label: "2nd Molar",       short: "M2",  kind: "molar" },
  { code: "16", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "15", label: "2nd Premolar",    short: "P2",  kind: "premolar" },
  { code: "14", label: "1st Premolar",    short: "P1",  kind: "premolar" },
  { code: "13", label: "Canine",          short: "C",   kind: "canine" },
  { code: "12", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "11", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "21", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "22", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "23", label: "Canine",          short: "C",   kind: "canine" },
  { code: "24", label: "1st Premolar",    short: "P1",  kind: "premolar" },
  { code: "25", label: "2nd Premolar",    short: "P2",  kind: "premolar" },
  { code: "26", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "27", label: "2nd Molar",       short: "M2",  kind: "molar" },
  { code: "28", label: "3rd Molar",       short: "M3",  kind: "molar" },
];

// Lower arch — left-to-right from patient's right to patient's left
// (viewer sees: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38)
const LOWER_PERMANENT: ToothDef[] = [
  { code: "48", label: "3rd Molar",       short: "M3",  kind: "molar" },
  { code: "47", label: "2nd Molar",       short: "M2",  kind: "molar" },
  { code: "46", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "45", label: "2nd Premolar",    short: "P2",  kind: "premolar" },
  { code: "44", label: "1st Premolar",    short: "P1",  kind: "premolar" },
  { code: "43", label: "Canine",          short: "C",   kind: "canine" },
  { code: "42", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "41", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "31", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "32", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "33", label: "Canine",          short: "C",   kind: "canine" },
  { code: "34", label: "1st Premolar",    short: "P1",  kind: "premolar" },
  { code: "35", label: "2nd Premolar",    short: "P2",  kind: "premolar" },
  { code: "36", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "37", label: "2nd Molar",       short: "M2",  kind: "molar" },
  { code: "38", label: "3rd Molar",       short: "M3",  kind: "molar" },
];

const UPPER_PRIMARY: ToothDef[] = [
  { code: "55", label: "2nd Molar",       short: "M2",  kind: "molar" },
  { code: "54", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "53", label: "Canine",          short: "C",   kind: "canine" },
  { code: "52", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "51", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "61", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "62", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "63", label: "Canine",          short: "C",   kind: "canine" },
  { code: "64", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "65", label: "2nd Molar",       short: "M2",  kind: "molar" },
];

const LOWER_PRIMARY: ToothDef[] = [
  { code: "85", label: "2nd Molar",       short: "M2",  kind: "molar" },
  { code: "84", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "83", label: "Canine",          short: "C",   kind: "canine" },
  { code: "82", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "81", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "71", label: "Central Incisor", short: "CI",  kind: "incisor" },
  { code: "72", label: "Lateral Incisor", short: "LI",  kind: "incisor" },
  { code: "73", label: "Canine",          short: "C",   kind: "canine" },
  { code: "74", label: "1st Molar",       short: "M1",  kind: "molar" },
  { code: "75", label: "2nd Molar",       short: "M2",  kind: "molar" },
];

// Width & height by tooth kind (pixels)
const TOOTH_SIZE: Record<ToothKind, { w: number; h: number }> = {
  incisor:  { w: 28, h: 38 },
  canine:   { w: 30, h: 44 },
  premolar: { w: 34, h: 42 },
  molar:    { w: 42, h: 40 },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface ToothChartProps {
  selectedTooth: string | null;
  onToothSelect: (fdiCode: string, toothType: "PERMANENT" | "PRIMARY") => void;
  toothType: "PERMANENT" | "PRIMARY";
  existingObservations?: string[];
  isReadOnly?: boolean;
}

// ── Single tooth cell (SVG-based shape) ──────────────────────────────────────
interface ToothCellProps {
  tooth: ToothDef;
  isUpper: boolean;
  isSelected: boolean;
  isExisting: boolean;
  isHovered: boolean;
  isReadOnly: boolean;
  onHover: (code: string | null) => void;
  onClick: () => void;
}

function ToothCell({ tooth, isUpper, isSelected, isExisting, isHovered, isReadOnly, onHover, onClick }: ToothCellProps) {
  const { w, h } = TOOTH_SIZE[tooth.kind];

  // Colour scheme
  let fill = "#FFFFFF";
  let stroke = "#94A3B8";
  let labelColor = "#0B1C30";

  if (isSelected) {
    fill = "#00685C";
    stroke = "#00685C";
    labelColor = "#FFFFFF";
  } else if (isExisting) {
    fill = "#DCFCE7";
    stroke = "#166534";
    labelColor = "#166534";
  } else if (isHovered && !isReadOnly) {
    fill = "#F0FDFA";
    stroke = "#00685C";
  }

  // Tooth SVG path — upper teeth point UP (root up, crown down toward gap)
  // Lower teeth point DOWN (root down, crown up toward gap)
  // We draw a rounded rectangle with a pointed crown direction
  const rx = tooth.kind === "molar" ? 6 : tooth.kind === "premolar" ? 5 : 4;

  // Upper: crown at bottom (close to midline), root at top
  // Lower: crown at top (close to midline), root at bottom
  const crownH = isUpper ? h * 0.55 : h * 0.55;
  const rootH  = h - crownH;

  const upperPath = `
    M ${rx} 0
    H ${w - rx}
    Q ${w} 0 ${w} ${rx}
    V ${rootH}
    Q ${w * 0.75} ${rootH + 4} ${w / 2} ${h}
    Q ${w * 0.25} ${rootH + 4} 0 ${rootH}
    V ${rx}
    Q 0 0 ${rx} 0
    Z
  `;

  const lowerPath = `
    M 0 ${rootH}
    Q ${w * 0.25} ${rootH - 4} ${w / 2} 0
    Q ${w * 0.75} ${rootH - 4} ${w} ${rootH}
    V ${h - rx}
    Q ${w} ${h} ${w - rx} ${h}
    H ${rx}
    Q 0 ${h} 0 ${h - rx}
    Z
  `;

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: 2 }}
      onMouseEnter={() => !isReadOnly && onHover(tooth.code)}
      onMouseLeave={() => !isReadOnly && onHover(null)}
      onClick={() => { if (!isReadOnly && !isExisting) onClick(); }}
      title={`${tooth.code} – ${tooth.label}${isExisting ? " (Already observed)" : ""}`}
    >
      {/* FDI code above upper teeth, below lower teeth */}
      {isUpper && (
        <span style={{ fontSize: 9, fontWeight: 700, color: labelColor === "#FFFFFF" ? "#00685C" : "#94A3B8", lineHeight: 1 }}>
          {tooth.code}
        </span>
      )}

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{
          cursor: isReadOnly ? "default" : isExisting ? "not-allowed" : "pointer",
          filter: isHovered && !isReadOnly && !isExisting ? "drop-shadow(0 2px 4px rgba(0,104,92,0.3))" : "none",
          transition: "filter 0.15s",
        }}
      >
        <path
          d={isUpper ? upperPath : lowerPath}
          fill={fill}
          stroke={stroke}
          strokeWidth={isSelected || isExisting ? 2 : 1.5}
        />
        {/* Short label inside crown area */}
        <text
          x={w / 2}
          y={isUpper ? h * 0.72 : h * 0.36}
          textAnchor="middle"
          fontSize={tooth.kind === "molar" ? 8 : 7}
          fontWeight="700"
          fill={labelColor}
        >
          {tooth.short}
        </text>
      </svg>

      {!isUpper && (
        <span style={{ fontSize: 9, fontWeight: 700, color: labelColor === "#FFFFFF" ? "#00685C" : "#94A3B8", lineHeight: 1 }}>
          {tooth.code}
        </span>
      )}
    </div>
  );
}

// ── Arch row ─────────────────────────────────────────────────────────────────
interface ArchProps {
  teeth: ToothDef[];
  isUpper: boolean;
  selectedTooth: string | null;
  existingObservations: string[];
  isReadOnly: boolean;
  hoveredTooth: string | null;
  toothType: "PERMANENT" | "PRIMARY";
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
}

function Arch({ teeth, isUpper, selectedTooth, existingObservations, isReadOnly, hoveredTooth, toothType, onHover, onSelect }: ArchProps) {
  // Split into left half and right half for midline marker
  const midpoint = Math.floor(teeth.length / 2);
  const rightHalf = teeth.slice(0, midpoint);   // patient's right
  const leftHalf  = teeth.slice(midpoint);       // patient's left

  return (
    <div className="flex flex-col items-center w-full">
      {/* Arch label */}
      <div className={`text-xs font-bold tracking-widest text-[#94A3B8] mb-${isUpper ? 1 : 0} mt-${isUpper ? 0 : 1}`}>
        {isUpper ? "UPPER ARCH" : "LOWER ARCH"}
      </div>

      <div className="flex items-end justify-center gap-0.5 w-full flex-wrap">
        {/* Right quadrant */}
        <div className="flex items-end gap-0.5">
          {rightHalf.map(tooth => (
            <ToothCell
              key={tooth.code}
              tooth={tooth}
              isUpper={isUpper}
              isSelected={selectedTooth === tooth.code}
              isExisting={existingObservations.includes(tooth.code)}
              isHovered={hoveredTooth === tooth.code}
              isReadOnly={isReadOnly}
              onHover={onHover}
              onClick={() => onSelect(tooth.code)}
            />
          ))}
        </div>

        {/* Midline marker */}
        <div style={{ width: 2, height: 56, background: "#E2E8F0", borderRadius: 1, margin: "0 4px", alignSelf: "center" }} />

        {/* Left quadrant */}
        <div className="flex items-end gap-0.5">
          {leftHalf.map(tooth => (
            <ToothCell
              key={tooth.code}
              tooth={tooth}
              isUpper={isUpper}
              isSelected={selectedTooth === tooth.code}
              isExisting={existingObservations.includes(tooth.code)}
              isHovered={hoveredTooth === tooth.code}
              isReadOnly={isReadOnly}
              onHover={onHover}
              onClick={() => onSelect(tooth.code)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tooltip for hovered tooth ─────────────────────────────────────────────────
function HoverTooltip({ code, teeth }: { code: string | null; teeth: ToothDef[] }) {
  if (!code) return null;
  const tooth = teeth.find(t => t.code === code);
  if (!tooth) return null;
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0B1C30] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-10">
      <span className="font-bold">{tooth.code}</span> — {tooth.label}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ToothChart({
  selectedTooth,
  onToothSelect,
  toothType,
  existingObservations = [],
  isReadOnly = false,
}: ToothChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  const upperTeeth = toothType === "PERMANENT" ? UPPER_PERMANENT : UPPER_PRIMARY;
  const lowerTeeth = toothType === "PERMANENT" ? LOWER_PERMANENT : LOWER_PRIMARY;
  const allTeeth   = [...upperTeeth, ...lowerTeeth];

  return (
    <div className="w-full bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 select-none">

      {/* Quadrant labels */}
      <div className="grid grid-cols-2 text-[10px] font-bold text-[#94A3B8] tracking-widest mb-1 px-10">
        <span className="text-right pr-3">PATIENT'S RIGHT</span>
        <span className="text-left pl-3">PATIENT'S LEFT</span>
      </div>

      {/* Mouth container */}
      <div className="relative flex flex-col items-center gap-1">

        {/* Upper arch */}
        <Arch
          teeth={upperTeeth}
          isUpper={true}
          selectedTooth={selectedTooth}
          existingObservations={existingObservations}
          isReadOnly={isReadOnly}
          hoveredTooth={hoveredTooth}
          toothType={toothType}
          onHover={setHoveredTooth}
          onSelect={(code) => onToothSelect(code, toothType)}
        />

        {/* Occlusal gap */}
        <div className="flex items-center w-full gap-2 my-1">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <div className="relative">
            <span className="text-[10px] font-bold text-[#94A3B8] tracking-widest px-2">MIDLINE</span>
            <HoverTooltip code={hoveredTooth} teeth={allTeeth} />
          </div>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Lower arch */}
        <Arch
          teeth={lowerTeeth}
          isUpper={false}
          selectedTooth={selectedTooth}
          existingObservations={existingObservations}
          isReadOnly={isReadOnly}
          hoveredTooth={hoveredTooth}
          toothType={toothType}
          onHover={setHoveredTooth}
          onSelect={(code) => onToothSelect(code, toothType)}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-5 pt-4 border-t border-[#E2E8F0]">
        {[
          { fill: "#FFFFFF", stroke: "#94A3B8", label: "Available" },
          { fill: "#F0FDFA", stroke: "#00685C", label: "Hover" },
          { fill: "#00685C", stroke: "#00685C", label: "Selected" },
          { fill: "#DCFCE7", stroke: "#166534", label: "Already Observed" },
        ].map(({ fill, stroke, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width={14} height={18} viewBox="0 0 14 18">
              <path
                d="M3 0 H11 Q14 0 14 3 V10 Q10.5 14 7 18 Q3.5 14 0 10 V3 Q0 0 3 0 Z"
                fill={fill}
                stroke={stroke}
                strokeWidth={1.5}
              />
            </svg>
            <span className="text-xs text-[#3D4946]">{label}</span>
          </div>
        ))}
      </div>

      {/* Selected tooth info */}
      {selectedTooth && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#F0FDFA] border border-[#00685C]/30 text-[#00685C] text-xs font-semibold px-3 py-1.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Tooth {selectedTooth} selected — {allTeeth.find(t => t.code === selectedTooth)?.label}
          </span>
        </div>
      )}
    </div>
  );
}
