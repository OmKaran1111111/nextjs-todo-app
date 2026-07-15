"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./components.module.css";

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
    if (value === 0 || total === 0) return null;
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

  const CustomTooltip = ({ active, payload }) => {
    if (total === 0) return null;
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        {labels[entry.name]}: {entry.value} ({getPercent(entry.value)}%)
      </div>
    );
  };

  const chartData = total === 0 ? [{ name: "noData", value: 1 }] : data;
  const chartColors = total === 0 ? ["var(--color-faint)"] : colors;

  return (
    <div className={styles.chartContainer}>
      <ul className={styles.legendList}>
        {data.map((entry, index) => (
          <li key={entry.name} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            {labels[entry.name]} ({entry.value})
          </li>
        ))}
      </ul>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={260} minWidth={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="85%"
              paddingAngle={total === 0 ? 0 : 2}
              dataKey="value"
              label={renderSliceLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
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