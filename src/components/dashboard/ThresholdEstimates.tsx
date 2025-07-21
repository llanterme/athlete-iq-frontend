"use client";

import React from 'react';

interface ThresholdData {
  ftp: number | null;
  running_threshold_pace: number | null;
  swimming_threshold_pace: number | null;
  lthr: number | null;
  confidence: {
    ftp: string;
    running_threshold_pace: string;
    swimming_threshold_pace: string;
    lthr: string;
  };
}

interface ThresholdEstimatesProps {
  thresholds: ThresholdData;
}

export function ThresholdEstimates({ thresholds }: ThresholdEstimatesProps) {
  const { ftp, running_threshold_pace, swimming_threshold_pace, lthr, confidence } = thresholds;

  // Get confidence color
  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return '#10b981';
      case 'medium': return '#3b82f6';
      case 'low': return '#f59e0b';
      case 'no_data': return '#6b7280';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get confidence description
  const getConfidenceDescription = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'Based on multiple high-quality efforts';
      case 'medium': return 'Based on several good efforts';
      case 'low': return 'Based on limited data';
      case 'no_data': return 'No activity data available';
      case 'error': return 'Error calculating threshold';
      default: return 'Insufficient data for estimation';
    }
  };

  // Format pace display
  const formatPace = (pace: number, unit: string) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} ${unit}`;
  };

  // Training zones for different metrics
  const getPowerZones = (ftp: number) => [
    { zone: 'Zone 1', name: 'Active Recovery', range: `< ${Math.round(ftp * 0.55)}W`, color: '#6b7280' },
    { zone: 'Zone 2', name: 'Endurance', range: `${Math.round(ftp * 0.56)}-${Math.round(ftp * 0.75)}W`, color: '#3b82f6' },
    { zone: 'Zone 3', name: 'Tempo', range: `${Math.round(ftp * 0.76)}-${Math.round(ftp * 0.90)}W`, color: '#10b981' },
    { zone: 'Zone 4', name: 'Threshold', range: `${Math.round(ftp * 0.91)}-${Math.round(ftp * 1.05)}W`, color: '#f59e0b' },
    { zone: 'Zone 5', name: 'VO2 Max', range: `${Math.round(ftp * 1.06)}-${Math.round(ftp * 1.20)}W`, color: '#ef4444' },
    { zone: 'Zone 6', name: 'Neuromuscular', range: `> ${Math.round(ftp * 1.21)}W`, color: '#8b5cf6' }
  ];

  const getHRZones = (lthr: number) => [
    { zone: 'Zone 1', name: 'Recovery', range: `< ${Math.round(lthr * 0.68)} bpm`, color: '#6b7280' },
    { zone: 'Zone 2', name: 'Aerobic', range: `${Math.round(lthr * 0.69)}-${Math.round(lthr * 0.83)} bpm`, color: '#3b82f6' },
    { zone: 'Zone 3', name: 'Tempo', range: `${Math.round(lthr * 0.84)}-${Math.round(lthr * 0.94)} bpm`, color: '#10b981' },
    { zone: 'Zone 4', name: 'Threshold', range: `${Math.round(lthr * 0.95)}-${Math.round(lthr * 1.05)} bpm`, color: '#f59e0b' },
    { zone: 'Zone 5', name: 'VO2 Max', range: `> ${Math.round(lthr * 1.06)} bpm`, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Threshold Values */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-sm">⚡</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Threshold Estimates</h3>
            <p className="text-white/60 text-sm">Estimated performance thresholds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FTP */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🚴</span>
                <span className="text-white font-medium">FTP</span>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getConfidenceColor(confidence.ftp)}20`,
                  color: getConfidenceColor(confidence.ftp)
                }}
              >
                {confidence.ftp}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {ftp ? `${ftp}W` : 'N/A'}
            </div>
            <div className="text-white/60 text-sm mb-2">Functional Threshold Power</div>
            <div className="text-white/40 text-xs">
              {getConfidenceDescription(confidence.ftp)}
            </div>
          </div>

          {/* Running Threshold Pace */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏃</span>
                <span className="text-white font-medium">Threshold Pace</span>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getConfidenceColor(confidence.running_threshold_pace)}20`,
                  color: getConfidenceColor(confidence.running_threshold_pace)
                }}
              >
                {confidence.running_threshold_pace}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {running_threshold_pace ? formatPace(running_threshold_pace, 'min/km') : 'N/A'}
            </div>
            <div className="text-white/60 text-sm mb-2">Running Critical Pace</div>
            <div className="text-white/40 text-xs">
              {getConfidenceDescription(confidence.running_threshold_pace)}
            </div>
          </div>

          {/* Swimming Threshold Pace */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏊</span>
                <span className="text-white font-medium">CSS Pace</span>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getConfidenceColor(confidence.swimming_threshold_pace)}20`,
                  color: getConfidenceColor(confidence.swimming_threshold_pace)
                }}
              >
                {confidence.swimming_threshold_pace}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {swimming_threshold_pace ? formatPace(swimming_threshold_pace, 'min/100m') : 'N/A'}
            </div>
            <div className="text-white/60 text-sm mb-2">Critical Swim Speed</div>
            <div className="text-white/40 text-xs">
              {getConfidenceDescription(confidence.swimming_threshold_pace)}
            </div>
          </div>

          {/* LTHR */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💓</span>
                <span className="text-white font-medium">LTHR</span>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getConfidenceColor(confidence.lthr)}20`,
                  color: getConfidenceColor(confidence.lthr)
                }}
              >
                {confidence.lthr}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {lthr ? `${lthr} bpm` : 'N/A'}
            </div>
            <div className="text-white/60 text-sm mb-2">Lactate Threshold HR</div>
            <div className="text-white/40 text-xs">
              {getConfidenceDescription(confidence.lthr)}
            </div>
          </div>
        </div>
      </div>

      {/* Power Zones */}
      {ftp && (
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">🚴</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Power Zones</h3>
              <p className="text-white/60 text-sm">Training zones based on FTP</p>
            </div>
          </div>

          <div className="space-y-2">
            {getPowerZones(ftp).map((zone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <div className="text-white font-medium">{zone.zone}</div>
                    <div className="text-white/60 text-sm">{zone.name}</div>
                  </div>
                </div>
                <div className="text-white/80 font-mono text-sm">{zone.range}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heart Rate Zones */}
      {lthr && (
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">💓</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Heart Rate Zones</h3>
              <p className="text-white/60 text-sm">Training zones based on LTHR</p>
            </div>
          </div>

          <div className="space-y-2">
            {getHRZones(lthr).map((zone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <div className="text-white font-medium">{zone.zone}</div>
                    <div className="text-white/60 text-sm">{zone.name}</div>
                  </div>
                </div>
                <div className="text-white/80 font-mono text-sm">{zone.range}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}