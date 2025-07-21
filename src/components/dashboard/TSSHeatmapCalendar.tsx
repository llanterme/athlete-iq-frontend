"use client";

import React, { useState } from 'react';

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

interface TSSHeatmapCalendarProps {
  tssData: TSSData[];
}

export function TSSHeatmapCalendar({ tssData }: TSSHeatmapCalendarProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Group TSS data by date
  const groupTSSByDate = () => {
    const grouped: { [date: string]: number } = {};
    
    tssData.forEach(item => {
      const date = item.activity_date;
      if (date) {
        grouped[date] = (grouped[date] || 0) + item.tss_value;
      }
    });
    
    return grouped;
  };

  const dailyTSS = groupTSSByDate();

  // Get TSS color based on value
  const getTSSColor = (tss: number) => {
    if (tss === 0) return '#1f2937'; // Dark gray for no activity
    if (tss < 50) return '#065f46'; // Dark green
    if (tss < 100) return '#047857'; // Medium green
    if (tss < 150) return '#059669'; // Bright green
    if (tss < 200) return '#10b981'; // Light green
    if (tss < 300) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red for high TSS
  };

  // Get intensity description
  const getIntensityLabel = (tss: number) => {
    if (tss === 0) return 'Rest';
    if (tss < 50) return 'Easy';
    if (tss < 100) return 'Moderate';
    if (tss < 150) return 'Hard';
    if (tss < 200) return 'Very Hard';
    if (tss < 300) return 'Extreme';
    return 'Overload';
  };

  // Generate calendar days for the selected month
  const generateCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const current = new Date(startDate);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const tss = dailyTSS[dateStr] || 0;
      const isCurrentMonth = current.getMonth() === selectedMonth;
      
      days.push({
        date: new Date(current),
        dateStr,
        tss,
        isCurrentMonth,
        day: current.getDate()
      });
      
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get available years from data
  const getAvailableYears = () => {
    const years = new Set<number>();
    tssData.forEach(item => {
      if (item.activity_date) {
        const year = new Date(item.activity_date).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const availableYears = getAvailableYears();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-sm">📅</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Training Calendar</h3>
            <p className="text-white/60 text-sm">Daily TSS heatmap</p>
          </div>
        </div>
        
        {/* Month/Year Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {months.map((month, index) => (
              <option key={index} value={index} className="bg-gray-800">
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {availableYears.map(year => (
              <option key={year} value={year} className="bg-gray-800">
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-white/60 text-xs font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                relative aspect-square rounded-lg border border-white/10 p-1 cursor-pointer
                transition-all duration-200 hover:border-white/30
                ${day.isCurrentMonth ? 'opacity-100' : 'opacity-40'}
              `}
              style={{ backgroundColor: getTSSColor(day.tss) }}
              title={`${day.date.toLocaleDateString()}: ${day.tss.toFixed(0)} TSS (${getIntensityLabel(day.tss)})`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-white text-xs font-medium">
                  {day.day}
                </div>
                {day.tss > 0 && (
                  <div className="text-white/80 text-xs">
                    {day.tss.toFixed(0)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-sm">TSS Intensity</span>
          <span className="text-white/60 text-sm">Less</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {[0, 25, 50, 75, 100, 150, 200, 300].map((tss, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-sm border border-white/20"
              style={{ backgroundColor: getTSSColor(tss) }}
              title={`${tss} TSS - ${getIntensityLabel(tss)}`}
            />
          ))}
          <span className="text-white/60 text-sm ml-2">More</span>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-white/40">
          <span>Rest</span>
          <span>Easy</span>
          <span>Moderate</span>
          <span>Hard</span>
          <span>Very Hard</span>
          <span>Extreme</span>
          <span>Overload</span>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {calendarDays.filter(day => day.isCurrentMonth && day.tss > 0).length}
            </div>
            <div className="text-white/60 text-sm">Active Days</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {calendarDays
                .filter(day => day.isCurrentMonth)
                .reduce((sum, day) => sum + day.tss, 0)
                .toFixed(0)}
            </div>
            <div className="text-white/60 text-sm">Total TSS</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {(calendarDays
                .filter(day => day.isCurrentMonth)
                .reduce((sum, day) => sum + day.tss, 0) / 
                Math.max(1, calendarDays.filter(day => day.isCurrentMonth && day.tss > 0).length)
              ).toFixed(0)}
            </div>
            <div className="text-white/60 text-sm">Avg TSS</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {Math.max(...calendarDays.filter(day => day.isCurrentMonth).map(day => day.tss)).toFixed(0)}
            </div>
            <div className="text-white/60 text-sm">Max TSS</div>
          </div>
        </div>
      </div>
    </div>
  );
}