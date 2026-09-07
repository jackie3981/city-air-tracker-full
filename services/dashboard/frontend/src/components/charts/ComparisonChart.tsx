// src/components/charts/ComparisonChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CityTrend } from "../../api/client";

// 20 distinct colors to support comparing up to 20 cities at once.
// If the city list grows beyond this, either expand the palette further
// or cap how many cities can be selected for comparison at once.
const LINE_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#d97706", // amber
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#db2777", // pink
  "#65a30d", // lime
  "#ea580c", // orange
  "#4f46e5", // indigo
  "#0d9488", // teal
  "#c026d3", // fuchsia
  "#ca8a04", // yellow-dark
  "#059669", // emerald
  "#e11d48", // rose
  "#7c2d12", // brown
  "#1d4ed8", // blue-dark
  "#9333ea", // purple
  "#0369a1", // sky-dark
  "#4d7c0f", // olive
];

type ComparisonChartProps = {
  cities: CityTrend[];
  /** Full, stable list of city ids (e.g. from the city selector), used to
   * assign each city a fixed color that doesn't shift when the selection
   * changes. Colors cycle if there are more cities than LINE_COLORS. */
  allCityIds: string[];
};

function mergeByTime(cities: CityTrend[]) {
  const timeMap = new Map<string, Record<string, number | string>>();

  for (const city of cities) {
    for (const point of city.trend) {
      const existing = timeMap.get(point.observedAt) ?? { observedAt: point.observedAt };
      existing[city.cityName] = point.aqi;
      timeMap.set(point.observedAt, existing);
    }
  }

  return Array.from(timeMap.values()).sort((left, right) =>
    String(left.observedAt).localeCompare(String(right.observedAt))
  );
}

function colorForCity(cityId: string, allCityIds: string[]): string {
  const index = allCityIds.indexOf(cityId);
  const safeIndex = index === -1 ? 0 : index;
  return LINE_COLORS[safeIndex % LINE_COLORS.length];
}

export default function ComparisonChart({ cities, allCityIds }: ComparisonChartProps) {
  if (cities.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center text-sm text-gray-400">
        Select one or more cities to compare
      </div>
    );
  }

  const data = mergeByTime(cities);

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <p className="text-sm text-gray-500 mb-4">AQI comparison</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="observedAt" tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: "numeric" })} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e5e7eb" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {cities.map((city) => (
            <Line
              key={city.id}
              type="monotone"
              dataKey={city.cityName}
              stroke={colorForCity(city.id, allCityIds)}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}