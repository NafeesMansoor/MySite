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
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
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
          impact: (Math.random() * 5 + 2).toFixed(1), // Mock data for impact
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
    if (filteredData.length === 0) return { peakYear: '-', avgAnnual: '0', avgImpact: '0', colleagues: '48' };
    
    const totalCitations = filteredData.reduce((acc, curr) => acc + curr.citations, 0);
    const avgAnnual = (totalCitations / filteredData.length).toFixed(1);
    const avgImpact = (filteredData.reduce((acc, curr) => acc + parseFloat(curr.impact), 0) / filteredData.length).toFixed(1);
    
    // Find peak year based on active tab
    const peakData = [...filteredData].sort((a, b) => {
      if (activeTab === 'citations') return b.citations - a.citations;
      return b.publications - a.publications;
    })[0];

    return {
      peakYear: peakData?.year.toString() || '-',
      avgAnnual,
      avgImpact,
      colleagues: '48'
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
        backgroundColor: filteredData.map((_, i) => {
          const colors = [
            'rgba(99, 102, 241, 0.6)', // Indigo
            'rgba(16, 185, 129, 0.6)', // Emerald
            'rgba(245, 158, 11, 0.6)', // Amber
            'rgba(139, 92, 246, 0.6)', // Violet
            'rgba(236, 72, 153, 0.6)', // Pink
            'rgba(20, 184, 166, 0.6)', // Teal
          ];
          return colors[i % colors.length];
        }),
        borderColor: filteredData.map((_, i) => {
          const colors = [
            'rgba(99, 102, 241, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(20, 184, 166, 1)',
          ];
          return colors[i % colors.length];
        }),
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
    animation: {
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
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Peak Year</p>
                  <p className="text-xl font-bold text-white leading-none mt-1">{metrics.peakYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Avg. Impact</p>
                  <p className="text-xl font-bold text-white leading-none mt-1">{metrics.avgImpact}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Colleagues</p>
                  <p className="text-xl font-bold text-white leading-none mt-1">{metrics.colleagues}</p>
                </div>
              </div>
            </div>

            {/* Tabs & Filter on the Right */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl">
                {(['citations', 'publications'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
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
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-colors"
                >
                  <Filter size={14} />
                  Range
                  <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Start Year</label>
                          <select 
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
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">End Year</label>
                          <select 
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
        <div className="p-8 bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-[2.5rem] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          {/* Chart Controls */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="text-sm font-medium text-white">Yearly Growth</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} />
                <span>{yearRange[0]} - {yearRange[1]}</span>
              </div>
            </div>
          </div>

          {/* The Chart */}
          <div className="h-[400px] w-full relative z-10">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
