'use client'

interface StatCardProps {
  label: string
  value: string
  unit: string
  alert: string
  alertColor: string
  lineColor: string
  trend: 'up' | 'down'
}

export function StatCard({ label, value, unit, alert, alertColor, lineColor, trend }: StatCardProps) {
  const points = trend === 'up'
    ? '0,38 50,34 100,28 150,22 200,14 250,8 300,3'
    : '0,5 50,10 100,16 150,24 200,30 250,35 300,40'

  return (
    <div className="flex-1 px-5 py-4 bg-[#1a1a1a] border-b border-stone-800 flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
          {label}
        </span>
        <div className="w-3.5 h-3.5 opacity-60" style={{ color: lineColor }}>↗</div>
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-3xl font-black text-orange-200 font-mono tracking-tight">
          {value}
        </span>
        <span className="text-xs text-stone-500 font-mono uppercase">{unit}</span>
      </div>

      <svg
        viewBox="0 0 300 44"
        className="w-full mt-1"
        preserveAspectRatio="none"
        style={{ height: 44 }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${alertColor} flex items-center gap-1`}>
        <span>▲</span>
        <span>{alert}</span>
      </div>
    </div>
  )
}