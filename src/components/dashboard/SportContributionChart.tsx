"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SportBreakdown {
  cycling: number;
  running: number;
  swimming: number;
  other: number;
}

interface SportContributionChartProps {
  sportBreakdown: SportBreakdown;
}

export function SportContributionChart({ sportBreakdown }: SportContributionChartProps) {
  // Transform data for the chart
  const chartData = [
    { name: 'Cycling', value: sportBreakdown.cycling, color: '#ff6b35', icon: '🚴' },
    { name: 'Running', value: sportBreakdown.running, color: '#4ecdc4', icon: '🏃' },
    { name: 'Swimming', value: sportBreakdown.swimming, color: '#45b7d1', icon: '🏊' },
    { name: 'Other', value: sportBreakdown.other, color: '#96ceb4', icon: '🏋️' }
  ].filter(item => item.value > 0); // Only show sports with data

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{data.icon}</span>
            <span className="text-white font-medium">{data.name}</span>
          </div>
          <div className="text-white/80 text-sm mt-1">
            TSS: {data.value.toFixed(1)} ({percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/80 text-sm">{entry.payload.icon} {entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (total === 0) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-sm">🏃</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sport Contribution</h3>
            <p className="text-white/60 text-sm">Training load by activity type</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-white/60">No sport data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-sm">🏃</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Sport Contribution</h3>
          <p className="text-white/60 text-sm">Training load by activity type</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-3">
        {chartData.map((sport, index) => {
          const percentage = total > 0 ? (sport.value / total) * 100 : 0;
          
          return (
            <div key={index} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{sport.icon}</span>
                  <span className="text-white font-medium">{sport.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{sport.value.toFixed(1)} TSS</div>
                  <div className="text-white/60 text-sm">{percentage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: sport.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Total Training Load</span>
          <span className="text-white font-bold text-lg">{total.toFixed(1)} TSS</span>
        </div>
      </div>
    </div>
  );
}