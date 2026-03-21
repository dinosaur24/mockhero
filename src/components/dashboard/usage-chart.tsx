"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface DayUsage {
  date: string;
  records: number;
}

interface UsageChartProps {
  dailyUsage: DayUsage[];
  todayUsed: number;
  dailyLimit: number;
}

export function UsageChart({ dailyUsage, todayUsed, dailyLimit }: UsageChartProps) {
  const percentage = Math.min(100, Math.round((todayUsed / dailyLimit) * 100));

  // Progress bar color based on usage
  const barColor =
    percentage >= 90
      ? "bg-destructive"
      : percentage >= 75
        ? "bg-yellow-500"
        : "bg-green-500";

  // Find max for chart scaling
  const maxRecords = Math.max(...dailyUsage.map((d) => d.records), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>

      {/* Today's progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-muted-foreground">Today</span>
          <span className="text-sm font-medium text-foreground">
            {todayUsed.toLocaleString()} / {dailyLimit.toLocaleString()} records
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 7-day chart (SVG) */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">Last 7 days</p>
        <svg viewBox="0 0 280 80" className="w-full h-20" aria-label="Usage chart">
          {dailyUsage.map((day, i) => {
            const barHeight = Math.max(2, (day.records / maxRecords) * 60);
            const x = i * 40 + 4;
            const y = 60 - barHeight;
            const label = new Date(day.date).toLocaleDateString("en", { weekday: "short" });

            return (
              <g key={day.date}>
                <rect
                  x={x}
                  y={y}
                  width={32}
                  height={barHeight}
                  rx={4}
                  className="fill-primary/70"
                />
                <text
                  x={x + 16}
                  y={75}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
