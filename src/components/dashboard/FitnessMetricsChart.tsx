"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface FitnessMetrics {
  date: string;
  total_tss: number;
  cycling_tss: number;
  running_tss: number;
  swimming_tss: number;
  other_tss: number;
  ctl: number;
  atl: number;
  tsb: number;
}

interface FitnessMetricsChartProps {
  fitnessMetrics: FitnessMetrics[];
}

export function FitnessMetricsChart({ fitnessMetrics }: FitnessMetricsChartProps) {
  const [timeRange, setTimeRange] = useState<'30' | '90' | '365' | 'all'>('90');
  const [chartType, setChartType] = useState<'fitness' | 'tss'>('fitness');

  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all') return fitnessMetrics;
    
    const daysToShow = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
    
    return fitnessMetrics.filter(metric => {
      const metricDate = new Date(metric.date);
      return metricDate >= cutoffDate;
    });
  };

  const filteredData = getFilteredData();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format tooltip content
  const formatTooltip = (value: number, name: string) => {
    const formatters: { [key: string]: (val: number) => string } = {
      'ctl': (val) => `${val.toFixed(1)} CTL`,
      'atl': (val) => `${val.toFixed(1)} ATL`,
      'tsb': (val) => `${val.toFixed(1)} TSB`,
      'total_tss': (val) => `${val.toFixed(0)} TSS`,
      'cycling_tss': (val) => `${val.toFixed(0)} TSS`,
      'running_tss': (val) => `${val.toFixed(0)} TSS`,
      'swimming_tss': (val) => `${val.toFixed(0)} TSS`,
      'other_tss': (val) => `${val.toFixed(0)} TSS`,
    };

    return formatters[name] ? formatters[name](value) : `${value}`;
  };

  // Get TSB color based on value
  const getTSBColor = (tsb: number) => {
    if (tsb > 25) return '#10b981'; // green - peaked
    if (tsb > 5) return '#3b82f6'; // blue - fresh
    if (tsb > -10) return '#8b5cf6'; // purple - optimal
    if (tsb > -30) return '#f59e0b'; // yellow - productive
    return '#ef4444'; // red - overreached
  };

  const getButtonClass = (isActive: boolean) => {
    return `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-strava-orange to-primary-400 text-white' 
        : 'text-white/60 hover:text-white hover:bg-white/10'
    }`;
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-sm">📈</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Fitness Trends</h3>
            <p className="text-white/60 text-sm">CTL, ATL, and Training Stress Balance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setChartType('fitness')}
              className={getButtonClass(chartType === 'fitness')}
            >
              Fitness
            </button>
            <button
              onClick={() => setChartType('tss')}
              className={getButtonClass(chartType === 'tss')}
            >
              TSS
            </button>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('30')}
              className={getButtonClass(timeRange === '30')}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('90')}
              className={getButtonClass(timeRange === '90')}
            >
              90D
            </button>
            <button
              onClick={() => setTimeRange('365')}
              className={getButtonClass(timeRange === '365')}
            >
              1Y
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={getButtonClass(timeRange === 'all')}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'fitness' ? (
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="ctlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="atlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={12}
                tickFormatter={formatDate}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                formatter={formatTooltip}
                labelFormatter={(label) => `Date: ${formatDate(label)}`}
              />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="ctl"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ctlGradient)"
                name="CTL (Fitness)"
              />
              <Area
                type="monotone"
                dataKey="atl"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#atlGradient)"
                name="ATL (Fatigue)"
              />
              <Line
                type="monotone"
                dataKey="tsb"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="TSB (Form)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="cyclingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="runningGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ecdc4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="swimmingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#45b7d1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#45b7d1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="otherGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#96ceb4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#96ceb4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={12}
                tickFormatter={formatDate}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                formatter={formatTooltip}
                labelFormatter={(label) => `Date: ${formatDate(label)}`}
              />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="cycling_tss"
                stackId="1"
                stroke="#ff6b35"
                fill="url(#cyclingGradient)"
                name="Cycling TSS"
              />
              <Area
                type="monotone"
                dataKey="running_tss"
                stackId="1"
                stroke="#4ecdc4"
                fill="url(#runningGradient)"
                name="Running TSS"
              />
              <Area
                type="monotone"
                dataKey="swimming_tss"
                stackId="1"
                stroke="#45b7d1"
                fill="url(#swimmingGradient)"
                name="Swimming TSS"
              />
              <Area
                type="monotone"
                dataKey="other_tss"
                stackId="1"
                stroke="#96ceb4"
                fill="url(#otherGradient)"
                name="Other TSS"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-white font-medium">CTL (Fitness)</span>
          </div>
          <p className="text-white/60 text-xs">42-day training load average</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-white font-medium">ATL (Fatigue)</span>
          </div>
          <p className="text-white/60 text-xs">7-day training load average</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white font-medium">TSB (Form)</span>
          </div>
          <p className="text-white/60 text-xs">Training stress balance</p>
        </div>
      </div>
    </div>
  );
}