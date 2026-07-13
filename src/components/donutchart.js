"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DonutChart = ({ data, colors, labels }) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const getPercent = (value) =>
    total === 0 ? 0 : Math.round((value / total) * 100);

  const renderSliceLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${getPercent(value)}%`}
      </text>
    );
  };

  // Custom tooltip showing value + percent
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;
    return (
      <div className="rounded-md bg-[#1e293b] px-3 py-2 text-[13px] text-[#dae5f4] shadow-lg">
        {labels[entry.name]}: {entry.value} ({getPercent(entry.value)}%)
      </div>
    );
  };

  return (
    <div className="w-full max-w-[600px] flex flex-col md:flex-row items-center justify-center gap-4 
      md:gap-8 self-center mx-auto md:mx-0 md:ml-auto">
      <ul className="flex flex-row flex-wrap md:flex-col gap-3 md:gap-2.5 justify-center order-2 md:order-1">
        {data.map((entry, index) => (
          <li
            key={entry.name}
            className="flex items-center gap-2 text-[13px] text-[#dae5f4]"
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            {labels[entry.name]} ({entry.value})
          </li>
        ))}
      </ul>

      <div className="w-full max-w-[260px] order-1 md:order-2">
        <ResponsiveContainer width="100%" height={260} minWidth={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
              label={renderSliceLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonutChart;