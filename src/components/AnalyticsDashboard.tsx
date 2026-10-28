import React, { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  Calendar,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import citationsRaw from '../data/citations.txt?raw';
import { PUBLICATIONS } from '../constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Types
type Tab = 'citations' | 'publications';

const AnalyticsDashboard = () => {
  const reducedMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<Tab>('citations');
  const [yearRange, setYearRange] = useState<[number, number]>([2013, 2026]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Parse raw citation and publication data
  const allData = useMemo(() => {
    // Parse publications per year
    const pubCounts: Record<number, number> = {};
    PUBLICATIONS.forEach(pub => {
      pubCounts[pub.year] = (pubCounts[pub.year] || 0) + 1;
    });

    const parsed = citationsRaw
      .split('\n')
      .filter(line => line.trim() !== '' && line.includes(':'))
      .map(line => {
        const [year, count] = line.split(':').map(s => s.trim());
        const y = parseInt(year, 10);
        return {
          year: y,
          citations: parseInt(count, 10),
          publications: pubCounts[y] || 0,
        };
      })
      .sort((a, b) => a.year - b.year);
    
    return parsed;
  }, []);

  // Sync year range with available data on mount
  useEffect(() => {
    if (allData.length > 0) {
      const minYear = allData[0].year;
      const maxYear = allData[allData.length - 1].year;
      setYearRange([minYear, maxYear]);
    }
  }, [allData]);

  const filteredData = useMemo(() => {
    return allData.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
  }, [allData, yearRange]);

  // Derived Metrics for header section
  const metrics = useMemo(() => {
    if (filteredData.length === 0) return { peakYear: '-', total: '0', avgAnnual: '0' };

    // Every figure follows the active tab, so the header always describes the chart below it.
    const total = filteredData.reduce((acc, curr) => acc + curr[activeTab], 0);
    const avgAnnual = (total / filteredData.length).toFixed(1);

    // Find peak year based on active tab
    const peakData = [...filteredData].sort((a, b) => {
      if (activeTab === 'citations') return b.citations - a.citations;
      return b.publications - a.publications;
    })[0];

    return {
      peakYear: peakData?.year.toString() || '-',
      total: total.toLocaleString('en-US'),
      avgAnnual,
    };
  }, [filteredData, activeTab]);

  // Chart Data with multi-colors
  const chartData: ChartData<'bar'> = {
    labels: filteredData.map(d => d.year.toString()),
    datasets: [
      {
        label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
        data: filteredData.map(d => {
          if (activeTab === 'citations') return d.citations;
          return d.publications;
        }),
        // One colour for every year; the current, still incomplete year is drawn lighter.
        backgroundColor: filteredData.map((d) => (d.year === currentYear ? 'rgba(129, 140, 248, 0.3)' : 'rgba(129, 140, 248, 0.75)')),
        borderColor: 'rgba(129, 140, 248, 1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(255, 255, 255, 0.8)',
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          title: (items) => (Number(items[0]?.label) === currentYear ? `${items[0].label} (year to date)` : items[0]?.label ?? ''),
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
    },
    animation: reducedMotion ? false : {
      duration: 1500,
      easing: 'easeOutQuart',
    },
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tighter text-white">Research & Citation Insights</h2>
          </div>
          
          {/* Metrics & Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6 border-t border-white/5">
            {/* Analytics on the Left */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <TrendingUp size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Peak Year</p>
                  <p className="text-xl font-bold text-white leading-none mt-1">{metrics.peakYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <BookOpen size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total {activeTab}</p>
                  <p className="text-xl font-bold text-white leading-none mt-1 tabular-nums">{metrics.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Award size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Average per year</p>
                  <p className="text-xl font-bold text-white leading-none mt-1 tabular-nums">{metrics.avgAnnual}</p>
                </div>
              </div>
            </div>

            {/* Tabs & Filter on the Right */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl">
                {(['citations', 'publications'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    aria-pressed={activeTab === tab}
                    className={`min-h-10 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeTab === tab 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  aria-expanded={isFilterOpen}
                  aria-controls="analytics-range"
                  className="flex items-center gap-2 min-h-10 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-colors"
                >
                  <Filter size={14} aria-hidden="true" />
                  Range
                  <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      id="analytics-range"
                      onKeyDown={(e) => e.key === 'Escape' && setIsFilterOpen(false)}
                      className="absolute right-0 mt-2 w-48 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50"
                    >
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="analytics-start" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Start Year</label>
                          <select
                            id="analytics-start"
                            value={yearRange[0]} 
                            onChange={(e) => {
                              const newStart = parseInt(e.target.value);
                              setYearRange([newStart, Math.max(newStart, yearRange[1])]);
                            }}
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-indigo-500"
                          >
                            {allData.map(d => <option key={d.year} value={d.year}>{d.year}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="analytics-end" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">End Year</label>
                          <select
                            id="analytics-end"
                            value={yearRange[1]} 
                            onChange={(e) => {
                              const newEnd = parseInt(e.target.value);
                              setYearRange([Math.min(newEnd, yearRange[0]), newEnd]);
                            }}
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-indigo-500"
                          >
                            {allData.map(d => <option key={d.year} value={d.year}>{d.year}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="p-4 sm:p-8 bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          {/* Chart Controls */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="text-sm font-medium text-white">{activeTab === 'citations' ? 'Citations per year' : 'Publications per year'}</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} aria-hidden="true" />
                <span>{yearRange[0]}–{yearRange[1]}</span>
              </div>
            </div>
          </div>

          {/* The Chart */}
          <div
            className="h-[300px] sm:h-[400px] w-full relative z-10"
            role="img"
            aria-label={`Bar chart of ${activeTab} per year, ${yearRange[0]}–${yearRange[1]}: ${filteredData
              .map((d) => `${d.year}: ${d[activeTab]}`)
              .join(', ')}.`}
          >
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
