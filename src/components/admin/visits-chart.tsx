"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VisitPoint } from "@/lib/admin/demo";
import { formatNumber } from "./ui";

const H = 260;
const PAD = { top: 16, right: 12, bottom: 30, left: 44 };

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** Courbe des visiteurs : une seule série, réticule et infobulle au survol / au toucher. */
export function VisitsChart({ data, unit = "visiteurs" }: { data: VisitPoint[]; unit?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const g = useMemo(() => {
    const max = niceMax(Math.max(4, Math.max(...data.map((d) => d.visitors)) * 1.08));
    const iw = w - PAD.left - PAD.right;
    const ih = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
    const y = (v: number) => PAD.top + ih - (v / max) * ih;
    const pts = data.map((d, i) => [x(i), y(d.visitors)] as const);
    // courbe lissée (monotone simple)
    let line = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      line += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    const area = `${line} L${pts[pts.length - 1][0]},${PAD.top + ih} L${pts[0][0]},${PAD.top + ih} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ v: Math.round(max * t), y: y(max * t) }));
    const every = Math.ceil(data.length / Math.max(2, Math.floor(iw / 64)));
    return { pts, line, area, ticks, every, ih, x };
  }, [data, w]);

  const pick = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const px = clientX - r.left;
    let best = 0;
    for (let i = 1; i < g.pts.length; i++) if (Math.abs(g.pts[i][0] - px) < Math.abs(g.pts[best][0] - px)) best = i;
    setHover(best);
  };

  const h = hover !== null ? data[hover] : null;
  const hp = hover !== null ? g.pts[hover] : null;

  return (
    <div ref={box} className="relative select-none">
      <svg
        width={w}
        height={H}
        viewBox={`0 0 ${w} ${H}`}
        role="img"
        aria-label={`${unit} : de ${formatNumber(data[0].visitors)} à ${formatNumber(data[data.length - 1].visitors)} sur la période`}
        className="block max-w-full touch-pan-y"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="akua-visits" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--akua-blue)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--akua-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {g.ticks.map((t) => (
          <g key={t.v}>
            <line x1={PAD.left} x2={w - PAD.right} y1={t.y} y2={t.y} stroke="var(--akua-gray-200)" strokeDasharray={t.v === 0 ? undefined : "3 4"} />
            <text x={PAD.left - 10} y={t.y + 4} textAnchor="end" className="fill-akua-gray-500 text-[11px] tabular-nums">
              {t.v >= 1000 ? `${formatNumber(t.v / 1000)} k` : t.v}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          (i % g.every === 0 && data.length - 1 - i >= g.every * 0.7) || i === data.length - 1 ? (
            <text key={i} x={g.x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} className="fill-akua-gray-500 text-[11px]">
              {d.label}
            </text>
          ) : null,
        )}
        <path d={g.area} fill="url(#akua-visits)" />
        <path d={g.line} fill="none" stroke="var(--akua-blue)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {hp && (
          <g>
            <line x1={hp[0]} x2={hp[0]} y1={PAD.top} y2={PAD.top + g.ih} stroke="var(--akua-ink)" strokeOpacity={0.25} />
            <circle cx={hp[0]} cy={hp[1]} r={5} fill="var(--akua-blue)" stroke="var(--akua-white)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {h && hp && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-[14px] bg-akua-ink px-3 py-2 text-akua-white shadow-[0_12px_30px_-12px_rgb(7_8_12/0.6)]"
          style={{ left: Math.min(Math.max(hp[0] - 70, 0), w - 140), width: 140 }}
        >
          <p className="text-[11.5px] text-akua-white/70 first-letter:uppercase">{h.full}</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums">
            {formatNumber(h.visitors)} <span className="text-[12px] font-medium text-akua-white/70">{unit}</span>
          </p>
        </div>
      )}
    </div>
  );
}
