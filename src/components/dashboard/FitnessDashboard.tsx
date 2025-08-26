"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api';
import { FitnessMetricsChart } from './FitnessMetricsChart';
import { TSSHeatmapCalendar } from './TSSHeatmapCalendar';
import { FitnessStatusGauge } from './FitnessStatusGauge';
import { SportContributionChart } from './SportContributionChart';
import { ThresholdEstimates } from './ThresholdEstimates';

interface TSSData {
  activity_id: string;
  tss_value: number;
  calculation_method: string;
  sport_type: string;
  intensity_factor: number;
  duration_hours: number;
  activity_date: string;
  notes?: string;
}

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

interface ThresholdData {
  ftp: number;
  running_threshold_pace: number;
  swimming_threshold_pace: number;
  lthr: number;
  confidence: {
    ftp: string;
    running_threshold_pace: string;
    swimming_threshold_pace: string;
    lthr: string;
  };
}

export function FitnessDashboard() {
  const { data: session } = useSession();
  const [tssData, setTssData] = useState<TSSData[]>([]);
  const [fitnessMetrics, setFitnessMetrics] = useState<FitnessMetrics[]>([]);
  const [fitnessStatus, setFitnessStatus] = useState<FitnessStatus | null>(null);
  const [thresholds, setThresholds] = useState<ThresholdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'calendar' | 'thresholds'>('overview');
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFitnessData();
    }
  }, [session?.user?.id]);

  const fetchFitnessData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);
    setHasAttemptedFetch(true);

    try {
      const userId = session.user.id;

      // Fetch all fitness data in parallel
      const [tssResponse, metricsResponse, statusResponse, thresholdsResponse] = await Promise.allSettled([
        apiClient.getUserTSSData(userId),
        apiClient.getUserFitnessMetrics(userId),
        apiClient.getUserFitnessStatus(userId),
        apiClient.getUserThresholds(userId)
      ]);

      // Handle TSS data
      if (tssResponse.status === 'fulfilled') {
        const tssResult = tssResponse.value;
        setTssData(tssResult.tss_data || []);
      }

      // Handle fitness metrics
      if (metricsResponse.status === 'fulfilled') {
        const metricsResult = metricsResponse.value;
        setFitnessMetrics(metricsResult.fitness_data || []);
      }

      // Handle fitness status
      if (statusResponse.status === 'fulfilled') {
        const statusResult = statusResponse.value;
        setFitnessStatus(statusResult.fitness_status);
      }

      // Handle thresholds
      if (thresholdsResponse.status === 'fulfilled') {
        const thresholdsResult = thresholdsResponse.value;
        setThresholds(thresholdsResult.thresholds);
      }

    } catch (err) {
      console.error('Error fetching fitness data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fitness data');
    } finally {
      setLoading(false);
    }
  };

  const getTabButtonClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-fitness-orange-500 to-fitness-blue-500 text-white shadow-glow-orange' 
        : 'text-fitness-navy-200 hover:text-white hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 border border-transparent hover:border-white/10'
    }`;
  };

  if (loading) {
    return (
      <div className="fitness-card p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="relative">
            <div className="animate-spin w-8 h-8 border-3 border-fitness-navy-600 border-t-fitness-orange-500 rounded-full"></div>
            <div className="absolute inset-0 animate-spin w-8 h-8 border-3 border-transparent border-t-fitness-blue-400 rounded-full" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div>
            <p className="text-white font-medium">Loading fitness analytics...</p>
            <p className="text-fitness-navy-300 text-sm">Analyzing your training data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fitness-card p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-fitness-red-500 to-fitness-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Analytics Error</h3>
          <p className="text-fitness-navy-300 mb-6 text-sm leading-relaxed max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchFitnessData}
            className="px-6 py-3 bg-gradient-to-r from-fitness-orange-500 to-fitness-orange-600 text-white rounded-xl font-semibold hover:from-fitness-orange-400 hover:to-fitness-orange-500 transition-all duration-200 shadow-fitness hover:shadow-glow-orange"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (hasAttemptedFetch && !tssData.length && !fitnessMetrics.length) {
    return (
      <div className="fitness-card p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-fitness-navy-600 to-fitness-navy-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-fitness-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Analytics Data</h3>
          <p className="text-fitness-navy-300 mb-4 text-sm leading-relaxed max-w-lg mx-auto">
            Complete a Full Sync to unlock advanced training stress analysis and fitness metrics.
          </p>
          <div className="bg-gradient-to-r from-fitness-navy-800/50 to-fitness-navy-700/50 rounded-xl p-4 text-left max-w-md mx-auto">
            <h4 className="text-white font-medium mb-2 text-sm">What you'll get:</h4>
            <ul className="text-xs text-fitness-navy-300 space-y-1">
              <li>• TSS (Training Stress Score) tracking</li>
              <li>• CTL/ATL/TSB fitness trends</li>
              <li>• Power curve analysis</li>
              <li>• Performance threshold estimates</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fitness-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-fitness-orange-500 to-fitness-blue-500 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Training Analytics</h2>
              <p className="text-fitness-navy-300 text-sm">Advanced performance metrics and insights</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl px-4 py-2 border border-white/10">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-fitness-green-400 rounded-full animate-pulse"></div>
                <span className="text-fitness-navy-200 font-medium">{tssData.length} activities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={getTabButtonClass('overview')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={getTabButtonClass('trends')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
            Trends
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={getTabButtonClass('calendar')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={getTabButtonClass('thresholds')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Thresholds
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fitness Status */}
            {fitnessStatus && (
              <FitnessStatusGauge fitnessStatus={fitnessStatus} />
            )}

            {/* Sport Contribution */}
            {fitnessStatus && (
              <SportContributionChart sportBreakdown={fitnessStatus.sport_breakdown} />
            )}
          </div>
        )}

        {activeTab === 'trends' && fitnessMetrics.length > 0 && (
          <FitnessMetricsChart fitnessMetrics={fitnessMetrics} />
        )}

        {activeTab === 'calendar' && tssData.length > 0 && (
          <TSSHeatmapCalendar tssData={tssData} />
        )}

        {activeTab === 'thresholds' && thresholds && (
          <ThresholdEstimates thresholds={thresholds} />
        )}
      </div>
    </div>
  );
}