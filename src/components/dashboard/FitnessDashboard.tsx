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
    return `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-strava-orange to-primary-400 text-white' 
        : 'text-white/60 hover:text-white hover:bg-white/10'
    }`;
  };

  if (loading) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full"></div>
          <span className="text-white/60">Loading fitness data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            ❌ Error loading fitness data
          </div>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={fetchFitnessData}
            className="px-4 py-2 bg-gradient-to-r from-strava-orange to-primary-400 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (hasAttemptedFetch && !tssData.length && !fitnessMetrics.length) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">No Fitness Data Yet</h3>
          <p className="text-white/60 mb-4">
            Complete a Full Sync to analyze your training stress and fitness metrics.
          </p>
          <div className="text-sm text-white/40">
            Your TSS, CTL, ATL, and power curves will appear here after syncing.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-strava-orange to-primary-400 rounded-xl flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Fitness Analytics</h2>
              <p className="text-white/60 text-sm">Multi-sport training stress analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <span>📊</span>
            <span>{tssData.length} activities analyzed</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={getTabButtonClass('overview')}
          >
            🎯 Overview
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={getTabButtonClass('trends')}
          >
            📈 Trends
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={getTabButtonClass('calendar')}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={getTabButtonClass('thresholds')}
          >
            ⚡ Thresholds
          </button>
        </div>
      </div>

      {/* Tab Content */}
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
  );
}