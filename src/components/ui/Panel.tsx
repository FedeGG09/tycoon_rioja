import React from 'react';
import clsx from 'clsx';

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('rounded-3xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-md', className)}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.35em] text-yellow-300/70">{eyebrow}</div>
      <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-white/60">{subtitle}</p> : null}
    </div>
  );
}

export function Metric({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className={`mt-1 text-base font-semibold ${tone}`}>{value}</div>
    </div>
  );
}
