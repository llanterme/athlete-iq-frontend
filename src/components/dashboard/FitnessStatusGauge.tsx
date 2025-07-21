"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface FitnessStatus {
  status: string;
  status_color: string;
  recommendation: string;
  fitness_level: string;
  ctl: number;
  atl: number;
  tsb: number;
  sport_breakdown: {
    cycling: number;
    running: number;
    swimming: number;
    other: number;
  };
}

interface FitnessStatusGaugeProps {
  fitnessStatus: FitnessStatus;
}

export function FitnessStatusGauge({ fitnessStatus }: FitnessStatusGaugeProps) {
  const { status, status_color, recommendation, fitness_level, ctl, atl, tsb } = fitnessStatus;

  // Create gauge data based on TSB
  const getGaugeData = () => {
    // Normalize TSB to 0-100 scale for visual representation
    const normalizedTSB = Math.max(0, Math.min(100, ((tsb + 50) / 100) * 100));
    
    return [
      { name: 'Current', value: normalizedTSB, color: status_color },
      { name: 'Remaining', value: 100 - normalizedTSB, color: '#374151' }
    ];
  };

  const gaugeData = getGaugeData();

  // Get status icon based on current status
  const getStatusIcon = () => {
    switch (status) {
      case 'peaked': return '🏆';
      case 'fresh': return '✨';
      case 'neutral': return '🎯';
      case 'optimal': return '🎯'; // Keep for backward compatibility
      case 'productive': return '💪';
      case 'overreached': return '⚠️';
      default: return '📊';
    }
  };

  // Get fitness level color
  const getFitnessLevelColor = () => {
    switch (fitness_level) {
      case 'high': return '#10b981';
      case 'moderate': return '#3b82f6';
      case 'developing': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-sm">⚡</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Fitness Status</h3>
          <p className="text-white/60 text-sm">Current training state</p>
        </div>
      </div>

      {/* Status Gauge */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
                dataKey="value"
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Status */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl mb-1">{getStatusIcon()}</div>
            <div className="text-white font-bold text-lg capitalize">{status}</div>
            <div className="text-white/60 text-sm">TSB: {tsb.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{ctl.toFixed(0)}</div>
          <div className="text-white/60 text-sm">CTL</div>
          <div className="text-white/40 text-xs">Fitness</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{atl.toFixed(0)}</div>
          <div className="text-white/60 text-sm">ATL</div>
          <div className="text-white/40 text-xs">Fatigue</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold" style={{ color: status_color }}>
            {tsb > 0 ? '+' : ''}{tsb.toFixed(0)}
          </div>
          <div className="text-white/60 text-sm">TSB</div>
          <div className="text-white/40 text-xs">Form</div>
        </div>
      </div>

      {/* Fitness Level */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Fitness Level</span>
          <span 
            className="text-sm font-medium capitalize"
            style={{ color: getFitnessLevelColor() }}
          >
            {fitness_level}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (ctl / 100) * 100)}%`,
              backgroundColor: getFitnessLevelColor()
            }}
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-lg">💡</div>
          <div>
            <h4 className="text-white font-medium text-sm mb-1">Recommendation</h4>
            <p className="text-white/80 text-sm leading-relaxed">{recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}