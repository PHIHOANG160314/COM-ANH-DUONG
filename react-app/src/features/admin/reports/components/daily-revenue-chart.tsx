import React from 'react';
import { Paper, Typography } from '@mui/material';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
  ComposedChart,
} from 'recharts';
import { formatCurrency } from '@/shared/lib/formatters';

interface DailyRevenueChartProps {
  data: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export const DailyRevenueChart: React.FC<DailyRevenueChartProps> = ({ data }) => {
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Doanh thu & Đơn hàng (7 ngày qua)
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) =>
              new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value)
            }
          />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => value.toString()} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              if (value === undefined) return ['0', name];
              const val = Number(value);
              if (isNaN(val)) return ['0', name];
              if (name === 'revenue') return [formatCurrency(val), 'Doanh thu'];
              return [val, 'Đơn hàng'];
            }}
            labelStyle={{ color: '#333' }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Doanh thu"
            fill="#1976d2"
            barSize={30}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Đơn hàng"
            stroke="#ff9800"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};
