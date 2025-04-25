"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Granularity options
type Granularity = 'second' | 'minute' | 'hour' | 'day';

export default function UsageGraph({ requestCounts }: { requestCounts: number[] }) {
  const [granularity, setGranularity] = useState<Granularity>('hour');
  const [chartData, setChartData] = useState<any[]>([]);

  // Process data when timestamps or granularity changes
  useEffect(() => {
    if (!requestCounts || requestCounts.length === 0) {
      setChartData([]);
      return;
    }

    // Sort timestamps ascending
    const sortedTimestamps = [...requestCounts].sort((a, b) => a - b);
    
    // Group counts by the selected time granularity
    const groupedData = groupByTimeGranularity(sortedTimestamps, granularity);
    
    setChartData(groupedData);
  }, [requestCounts, granularity]);

  // Group timestamps by the selected granularity
  const groupByTimeGranularity = (timestamps: number[], granularity: Granularity) => {
    const timeGroups: Record<string, number> = {};
    
    timestamps.forEach(timestamp => {
      const date = new Date(timestamp * 1000);
      let timeKey: string;
      
      switch (granularity) {
        case 'second':
          timeKey = `${date.toISOString().slice(0, 19)}`;
          break;
        case 'minute':
          timeKey = `${date.toISOString().slice(0, 16)}:00`;
          break;
        case 'hour':
          timeKey = `${date.toISOString().slice(0, 13)}:00:00`;
          break;
        case 'day':
          timeKey = `${date.toISOString().slice(0, 10)}T00:00:00`;
          break;
        default:
          timeKey = `${date.toISOString().slice(0, 13)}:00:00`;
      }
      
      if (timeGroups[timeKey]) {
        timeGroups[timeKey]++;
      } else {
        timeGroups[timeKey] = 1;
      }
    });
    
    // Convert to array for chart
    return Object.entries(timeGroups).map(([timeKey, count]) => {
      const date = new Date(timeKey);
      let formattedTime: string;
      
      switch (granularity) {
        case 'second':
          formattedTime = date.toLocaleTimeString();
          break;
        case 'minute':
          formattedTime = `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          break;
        case 'hour':
          formattedTime = `${date.toLocaleTimeString([], { hour: '2-digit' })}`;
          break;
        case 'day':
          formattedTime = date.toLocaleDateString();
          break;
        default:
          formattedTime = date.toLocaleTimeString([], { hour: '2-digit' });
      }
      
      return {
        time: formattedTime,
        timestamp: date.getTime(),
        count,
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Calculate statistics
  const totalRequests = requestCounts.length;
  const oldestRequest = requestCounts.length > 0 
    ? new Date(Math.min(...requestCounts) * 1000).toLocaleString() 
    : 'N/A';
  const newestRequest = requestCounts.length > 0 
    ? new Date(Math.max(...requestCounts) * 1000).toLocaleString() 
    : 'N/A';

  return (
    <div className="w-full bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-md font-medium text-white/85">API Usage</h3>
        <select
          value={granularity}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGranularity(e.target.value as Granularity)}
          className="bg-white/10 text-white/85 rounded-md px-2 py-1 text-sm border border-white/20"
        >
          <option value="second">By Second</option>
          <option value="minute">By Minute</option>
          <option value="hour">By Hour</option>
          <option value="day">By Day</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium text-white/60">Total Requests</div>
          <div className="text-2xl font-bold text-white/85">{totalRequests}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white/60">First Request</div>
          <div className="text-md text-white/85">{oldestRequest}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white/60">Latest Request</div>
          <div className="text-md text-white/85">{newestRequest}</div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
              />
              <YAxis tick={{ fill: 'rgba(255, 255, 255, 0.6)' }} />
              <Tooltip 
                labelFormatter={(value) => `Time: ${value}`}
                formatter={(value) => [value, 'Requests']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' }}
              />
              <Bar 
                dataKey="count"
                name="API Requests" 
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-white/60">No data available</p>
        </div>
      )}
    </div>
  );
}