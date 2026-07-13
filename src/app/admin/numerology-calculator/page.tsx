'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Save, Printer, FileText, RotateCcw, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, Trash2, Calendar, User, Mail, Phone, Edit,
  ArrowRight, BookOpen, Layers, Check, HelpCircle
} from 'lucide-react';

import {
  calculateNumerology,
  printReport,
  NumerologyReport
} from '@/services/numerology';
import {
  saveNumerologyReport,
  getNumerologyReports,
  deleteNumerologyReport,
  SavedNumerologyReport
} from '@/services/numerologyFirestore';

export default function NumerologyCalculatorPage() {
  // Input states
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Loaded report id
  const [loadedReportId, setLoadedReportId] = useState<string | undefined>(undefined);

  // Search reports state
  const [searchQuery, setSearchQuery] = useState('');
  const [savedReports, setSavedReports] = useState<SavedNumerologyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<SavedNumerologyReport[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Calculation results
  const [result, setResult] = useState<NumerologyReport | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'loshu' | 'vedic' | 'summary'>('overview');

  // Grid manual editing state
  const [isEditingGrids, setIsEditingGrids] = useState(false);

  // Custom Print States
  const [showEditRemediesModal, setShowEditRemediesModal] = useState(false);
  const [customRemedies, setCustomRemedies] = useState('');
  const [customYantra, setCustomYantra] = useState('');
  const [customCrystals, setCustomCrystals] = useState('');

  // Load saved reports
  const fetchReports = async () => {
    try {
      const data = await getNumerologyReports();
      setSavedReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    fetchReports();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qName = params.get('name');
      const qDob = params.get('dob');
      const qPhone = params.get('phone');
      const qEmail = params.get('email');

      if (qName) setName(decodeURIComponent(qName));
      if (qDob) setDob(qDob);
      if (qPhone) setMobile(decodeURIComponent(qPhone));
      if (qEmail) setEmail(decodeURIComponent(qEmail));

      if (qName && qDob) {
        try {
          const report = calculateNumerology(
            decodeURIComponent(qName),
            qDob,
            'male',
            qPhone ? decodeURIComponent(qPhone) : '',
            qEmail ? decodeURIComponent(qEmail) : '',
            '',
            '',
            ''
          );
          setResult(report);
          setCustomRemedies(report.remedies?.lifestyle?.join('\n') || '');
          setCustomYantra(report.driverNum === 1 ? 'Shree Surya Yantra' : report.driverNum === 3 ? 'Guru Yantra' : report.driverNum === 6 ? 'Shree Shukra Yantra' : 'Shree Yantra');
          setCustomCrystals(report.luckySuggestions?.gemstones?.join(', ') || '');
          toast.success(`Computed report for ${decodeURIComponent(qName)}!`);
        } catch (e) {
          console.error('Auto-calculation error:', e);
        }
      }
    }
  }, []);

  // Filter reports
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports([]);
      return;
    }
    const lower = searchQuery.toLowerCase();
    const filtered = savedReports.filter(
      r =>
        r.name?.toLowerCase().includes(lower) ||
        r.mobile?.includes(lower) ||
        r.dob?.includes(lower)
    );
    setFilteredReports(filtered);
  }, [searchQuery, savedReports]);


  // Calculation handler
  const handleCalculate = () => {
    if (!name.trim()) {
      toast.error("Please enter the client's full name");
      return;
    }
    if (!dob) {
      toast.error("Please select the client's date of birth");
      return;
    }

    try {
      const report = calculateNumerology(
        name.trim(),
        dob,
        gender || 'male',
        mobile || '',
        email || '',
        '', // mobileToCheck
        '', // vehicleNo
        ''  // houseNo
      );
      setResult(report);
      setCustomRemedies(report.remedies?.lifestyle?.join('\n') || '');
      setCustomYantra(
        report.driverNum === 1 ? 'Shree Surya Yantra'
        : report.driverNum === 3 ? 'Guru Yantra'
        : report.driverNum === 6 ? 'Shree Shukra Yantra'
        : 'Shree Yantra'
      );
      setCustomCrystals(report.luckySuggestions?.gemstones?.join(', ') || '');
      toast.success('Calculation completed successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Calculation failed');
    }
  };

  // Reset inputs
  const handleReset = () => {
    setName('');
    setDob('');
    setGender('male');
    setMobile('');
    setEmail('');
    setNotes('');
    setResult(null);
    setLoadedReportId(undefined);
    setCustomRemedies('');
    setCustomYantra('');
    setCustomCrystals('');
    toast.success('Calculator inputs reset');
  };

  // Save report to database
  const handleSaveReport = async () => {
    if (!name.trim() || !dob || !result) {
      toast.error('Run calculations first before saving the report');
      return;
    }

    try {
      const reportToSave = {
        ...result,
        notes,
        customRemedies,
        customYantra,
        customCrystals
      };
      const docId = await saveNumerologyReport(loadedReportId, reportToSave);
      setLoadedReportId(docId);
      toast.success(loadedReportId ? 'Report updated successfully!' : 'Report saved to database!');
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save report to database');
    }
  };

  // Load a report
  const handleLoadReport = (rep: SavedNumerologyReport) => {
    setName(rep.name || '');
    setDob(rep.dob || '');
    setGender(rep.gender || 'male');
    setMobile(rep.mobile || '');
    setEmail(rep.email || '');
    setNotes(rep.notes || '');
    setResult(rep);
    setCustomRemedies(rep.customRemedies || rep.remedies?.lifestyle?.join('\n') || '');
    setCustomYantra(rep.customYantra || (rep.driverNum === 1 ? 'Shree Surya Yantra' : rep.driverNum === 3 ? 'Guru Yantra' : rep.driverNum === 6 ? 'Shree Shukra Yantra' : 'Shree Yantra'));
    setCustomCrystals(rep.customCrystals || rep.luckySuggestions?.gemstones?.join(', ') || '');
    setLoadedReportId(rep.id);
    setShowSearchDropdown(false);
    setSearchQuery('');
    toast.success(`Loaded report for ${rep.name}`);
  };

  // Delete saved report
  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteNumerologyReport(id);
      toast.success('Report deleted successfully');
      fetchReports();
      if (loadedReportId === id) {
        handleReset();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report');
    }
  };

  // Lo Shu cell manual edit handler
  const handleEditLoShuCell = (rIdx: number, cIdx: number, newVal: string) => {
    if (!result) return;
    
    const newGrid = result.loShuGrid.map(row => [...row]);
    const baseVal = [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6]
    ][rIdx][cIdx];
    
    const cleanVal = newVal.replace(new RegExp(`[^${baseVal}]`, 'g'), '');
    newGrid[rIdx][cIdx] = cleanVal || '';

    const loShuFrequencies: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) loShuFrequencies[i] = 0;
    
    newGrid.forEach((row, ri) => {
      row.forEach((cellVal, ci) => {
        const num = [
          [4, 9, 2],
          [3, 5, 7],
          [8, 1, 6]
        ][ri][ci];
        if (cellVal) {
          loShuFrequencies[num] = cellVal.length;
        }
      });
    });

    const checkArrowStatus = (nums: number[]): 'strength' | 'weakness' | 'none' => {
      const presentCount = nums.filter(n => loShuFrequencies[n] > 0).length;
      if (presentCount === 3) return 'strength';
      if (presentCount === 0) return 'weakness';
      return 'none';
    };

    const newArrows = result.loShuArrows.map(arrow => {
      if (arrow.name === 'Arrow of Frustration') {
        const frustrationStatus = checkArrowStatus([4, 5, 6]);
        return {
          ...arrow,
          type: frustrationStatus === 'weakness' ? ('weakness' as const) : ('none' as const),
          status: frustrationStatus === 'weakness' ? 'Active (Frustration)' : 'Inactive',
          meaning: frustrationStatus === 'weakness' ? 'Prone to high expectations leading to disappointment, feel stuck in career.' : 'Emotional resilience and steady progression.',
        };
      }
      const type = checkArrowStatus(arrow.numbers);
      const status = type === 'strength' ? 'Active (Strength)' : type === 'weakness' ? 'Active (Weakness)' : 'Inactive';
      return {
        ...arrow,
        type,
        status,
      };
    });

    const loShuRepeated = Object.keys(loShuFrequencies)
      .map(Number)
      .filter(k => loShuFrequencies[k] > 1);

    let maxFreq = 0;
    Object.values(loShuFrequencies).forEach(f => {
      if (f > maxFreq) maxFreq = f;
    });
    const loShuDominant = maxFreq > 0
      ? Object.keys(loShuFrequencies).map(Number).filter(k => loShuFrequencies[k] === maxFreq)
      : [];

    const missingNumbers = Object.keys(loShuFrequencies)
      .map(Number)
      .filter(k => loShuFrequencies[k] === 0);

    setResult({
      ...result,
      loShuGrid: newGrid,
      loShuFrequencies,
      loShuRepeated,
      loShuDominant,
      loShuArrows: newArrows,
      missingNumbers,
    });
  };

  // Vedic cell manual edit handler
  const handleEditVedicCell = (rIdx: number, cIdx: number, newVal: string) => {
    if (!result) return;
    
    const newGrid = result.vedicGrid.map(row => [...row]);
    const baseVal = [
      [3, 1, 9],
      [6, 7, 5],
      [2, 8, 4]
    ][rIdx][cIdx];
    
    const cleanVal = newVal.replace(new RegExp(`[^${baseVal}]`, 'g'), '');
    newGrid[rIdx][cIdx] = cleanVal || '';

    const vedicFrequencies: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) vedicFrequencies[i] = 0;
    
    newGrid.forEach((row, ri) => {
      row.forEach((cellVal, ci) => {
        const num = [
          [3, 1, 9],
          [6, 7, 5],
          [2, 8, 4]
        ][ri][ci];
        if (cellVal) {
          vedicFrequencies[num] = cellVal.length;
        }
      });
    });

    const strongList: string[] = [];
    const weakList: string[] = [];
    let totalScore = 0;
    const maxScore = 90;

    const PLANET_NAMES: Record<number, string> = {
      1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu',
      5: 'Mercury', 6: 'Venus', 7: 'Ketu', 8: 'Saturn', 9: 'Mars'
    };

    const newPlanetsAnalysis = result.planetsAnalysis.map(planet => {
      const num = Object.keys(PLANET_NAMES).find(k => PLANET_NAMES[Number(k)] === planet.name);
      if (!num) return planet;
      const freq = vedicFrequencies[Number(num)] || 0;
      const strengthPct = freq === 0 ? 0 : freq === 1 ? 60 : freq === 2 ? 85 : 100;
      
      if (strengthPct >= 85) strongList.push(planet.name);
      if (strengthPct === 0) weakList.push(planet.name);
      totalScore += strengthPct;

      return {
        ...planet,
        strengthPct,
      };
    });

    const vedicPlanetStrengthPct = Math.round((totalScore / maxScore) * 100);

    setResult({
      ...result,
      vedicGrid: newGrid,
      vedicFrequencies,
      vedicStrongPlanets: strongList,
      vedicWeakPlanets: weakList,
      vedicPlanetStrengthPct,
      planetsAnalysis: newPlanetsAnalysis,
    });
  };

  // Copy AI Report summary
  const handleCopySummary = () => {
    if (!result) {
      toast.error('Run calculation first');
      return;
    }
    navigator.clipboard.writeText(result.aiReport);
    toast.success('Spiritual report copied to clipboard!');
  };

  // Trigger print
  const handlePrint = () => {
    if (!result) {
      toast.error('Run calculation first before printing');
      return;
    }
    printReport(result, loadedReportId, customRemedies, customYantra, customCrystals);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F4] text-text font-sans pb-10">
      
      {/* Search Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-10 py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text/40" />
          </div>
          <input
            type="text"
            placeholder="Search saved client profiles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />

          {/* Autocomplete dropdown */}
          {showSearchDropdown && filteredReports.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-72 overflow-y-auto z-50 py-1.5">
              {filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => handleLoadReport(rep)}
                  className="px-4 py-2.5 hover:bg-teal-50/50 cursor-pointer flex justify-between items-center transition-colors group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-text group-hover:text-primary transition-colors">{rep.name}</h4>
                    <p className="text-[10px] text-text/50">{rep.dob} | {rep.mobile || 'No Phone'}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteReport(rep.id, e)}
                    className="p-1 hover:bg-red-50 text-text/30 hover:text-red-500 rounded transition-colors"
                    title="Delete profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showSearchDropdown && searchQuery && filteredReports.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4 text-center text-xs text-text/40">
              No matching profiles found.
            </div>
          )}

          {showSearchDropdown && (
            <div className="fixed inset-0 z-0" onClick={() => setShowSearchDropdown(false)} />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-colors shadow-md shadow-primary/10"
          >
            <Save className="w-3.5 h-3.5" /> Save Report
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-text/75 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Export PDF / Print
          </button>
          {result && (
            <button
              onClick={() => setShowEditRemediesModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Print Details
            </button>
          )}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-text/75 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" /> Copy Summary
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-text/60 rounded-xl text-xs font-semibold transition-all"
            title="Reset calculator inputs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Client Information Form */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text/60">Client Details</h2>
            <p className="text-[10px] text-text/40">Provide birth coordinates and contact info</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-text/70 mb-1.5">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. PRANAV CHOPADE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text/70 mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text/70 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text/70 mb-1.5">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text/70 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text/70 mb-1.5">Consultation Notes</label>
              <textarea
                rows={3}
                placeholder="Specific remedies, custom yantra notes, crystal therapy requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <button
              onClick={handleCalculate}
              className="w-full flex items-center justify-center gap-1.5 py-3 mt-2 bg-gradient-to-r from-primary to-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] transition-all text-xs"
            >
              <Sparkles className="w-4 h-4 animate-pulse" /> Calculate Audit
            </button>
          </div>
        </div>

        {/* Right Side: Tabbed Results */}
        <div id="results-dashboard" className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Tabs bar */}
          <div className="bg-white border border-gray-100 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'loshu', label: 'Lo Shu Grid' },
              { id: 'vedic', label: 'Vedic Grid' },
              { id: 'summary', label: 'Report Summary' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text/60 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Result view container */}
          <div className="min-h-[500px]">
            {!result ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center h-full min-h-[500px]">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-primary mb-4 border border-teal-100/50">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-text mb-1">Awaiting Client Calculations</h3>
                <p className="text-xs text-text/50 max-w-sm">Provide a name and DOB on the left sidebar, then click &quot;Calculate Audit&quot; to compile planetary grids and remedy interpretations.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { label: 'Birth Number', value: result.driverNum, desc: 'Personality vibration (Moolank)' },
                          { label: 'Destiny Number', value: result.conductorNum, desc: 'Conductor / Destiny (Bhagyank)' },
                          { label: 'Name Number', value: result.nameAnalysis.nameNumber, desc: 'Vibration of spelling expression' },
                          { label: 'Soul Urge Number', value: result.soulUrge, desc: 'Inner desire & spiritual motivation' },
                          { label: 'Personality Number', value: result.personality, desc: 'Social persona & outer projection' },
                          { label: 'Expression Number', value: result.expression, desc: 'Overall expression vibration' },
                          { label: 'Maturity Number', value: result.maturityNum, desc: 'Attained power in second half of life' },
                          { label: 'Balance Number', value: result.balanceNum, desc: 'Guidance under crisis situations' },
                          { label: 'Birthday Number', value: result.birthdayNum, desc: 'Natural talents & birth gifts' },
                          { label: 'Personal Year', value: result.personalYear, desc: 'Current calendar year energy cycle' },
                          { label: 'Personal Month', value: result.personalMonth, desc: 'Current month energy cycle' },
                          { label: 'Personal Day', value: result.personalDay, desc: 'Current day energy cycle' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                            <div>
                              <span className="block text-[10px] font-bold text-text/40 uppercase tracking-wider mb-1">{item.label}</span>
                              <p className="text-[10px] text-text/50 leading-tight">{item.desc}</p>
                            </div>
                            <span className="text-3xl font-extrabold text-primary my-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm leading-none pt-2">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Compatibility Section */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <div>
                            <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider">Planetary Compatibility</h3>
                            <p className="text-[10px] text-text/40">Relationship between Moolank (Personality) and Bhagyank (Destiny) numbers</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            result.compatibilityAnalysis.status === 'Friendly'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : result.compatibilityAnalysis.status === 'Enemy'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {result.compatibilityAnalysis.status} Relation
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-text/70">
                              Moolank (Personality): <span className="text-primary font-bold">{result.compatibilityAnalysis.driverNum}</span>
                            </p>
                            <p className="text-xs font-semibold text-text/70">
                              Bhagyank (Destiny): <span className="text-primary font-bold">{result.compatibilityAnalysis.conductorNum}</span>
                            </p>
                            <p className="text-xs text-text/65 mt-1 leading-relaxed">
                              {result.compatibilityAnalysis.description}
                            </p>
                          </div>

                          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2.5">
                            <h4 className="text-[10px] font-bold text-text/50 uppercase tracking-wider border-b border-gray-100 pb-1.5">
                              Planetary Relationship Chart for Number {result.compatibilityAnalysis.driverNum}
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-green-50/30 border border-green-100/50 p-2 rounded-lg">
                                <span className="block text-[8px] font-bold text-green-700 uppercase mb-0.5">Friends</span>
                                <span className="text-xs font-bold text-green-800">
                                  {result.compatibilityAnalysis.friendlyList.join(', ') || 'None'}
                                </span>
                              </div>
                              <div className="bg-red-50/30 border border-red-100/50 p-2 rounded-lg">
                                <span className="block text-[8px] font-bold text-red-700 uppercase mb-0.5">Enemies</span>
                                <span className="text-xs font-bold text-red-800">
                                  {result.compatibilityAnalysis.enemyList.join(', ') || 'Nil'}
                                </span>
                              </div>
                              <div className="bg-amber-50/30 border border-amber-100/50 p-2 rounded-lg">
                                <span className="block text-[8px] font-bold text-amber-700 uppercase mb-0.5">Neutrals</span>
                                <span className="text-xs font-bold text-amber-800 mb-0.5">
                                  {result.compatibilityAnalysis.neutralList.slice(0, 4).join(', ')}
                                  {result.compatibilityAnalysis.neutralList.length > 4 && '...'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LO SHU GRID TAB */}
                  {activeTab === 'loshu' && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Lo Shu Visual Grid */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center relative">
                          <div className="flex justify-between items-center w-full mb-4 border-b border-gray-100 pb-2">
                            <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider text-left">Visual Lo Shu Grid</h3>
                            <button
                              onClick={() => setIsEditingGrids(!isEditingGrids)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                isEditingGrids 
                                  ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-text/60 shadow-xs'
                              }`}
                            >
                              {isEditingGrids ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Save Cells
                                </>
                              ) : (
                                <>
                                  <Edit className="w-3 h-3" /> Edit Cells
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                            {result.loShuGrid.map((row, rIdx) =>
                              row.map((val, cIdx) => {
                                const baseVal = [
                                  [4, 9, 2],
                                  [3, 5, 7],
                                  [8, 1, 6]
                                ][rIdx][cIdx];
                                const isMissing = !val;
                                return (
                                  <div
                                    key={`${rIdx}-${cIdx}`}
                                    className={`aspect-square flex flex-col items-center justify-center border-2 rounded-xl transition-all relative ${
                                      isMissing
                                        ? 'border-gray-100 bg-gray-50/50 text-text/20'
                                        : 'border-primary bg-primary/5 text-primary'
                                    }`}
                                  >
                                    {isEditingGrids ? (
                                      <input
                                        type="text"
                                        value={val || ''}
                                        onChange={(e) => handleEditLoShuCell(rIdx, cIdx, e.target.value)}
                                        placeholder={baseVal.toString()}
                                        className="w-full h-full text-center bg-transparent focus:outline-none text-base font-extrabold text-primary placeholder-text/15"
                                      />
                                    ) : (
                                      <>
                                        <span className="text-base font-extrabold">{val || baseVal}</span>
                                        {isMissing && <span className="text-[8px] uppercase font-bold text-text/25">Missing</span>}
                                        {!isMissing && val.length > 1 && <span className="text-[8px] uppercase font-bold text-teal-600">Rep</span>}
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Lo Shu Arrow Summary */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Active Arrows / planes</h3>
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                            {result.loShuArrows.map((arrow, idx) => (
                              <div
                                key={idx}
                                className={`p-3 border-l-3 rounded-r-xl text-xs flex justify-between items-start transition-all ${
                                  arrow.type === 'strength'
                                    ? 'bg-green-50/50 border-green-500'
                                    : arrow.type === 'weakness'
                                    ? 'bg-red-50/50 border-red-500'
                                    : 'bg-gray-50/30 border-gray-200'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-text">{arrow.name}</span>
                                    <span className="text-[9px] font-semibold text-text/40 font-mono">({arrow.numbers.join('-')})</span>
                                  </div>
                                  <p className="text-[10px] text-text/60 mt-1 leading-normal">{arrow.meaning}</p>
                                </div>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  arrow.type === 'strength' ? 'bg-green-100 text-green-700' : arrow.type === 'weakness' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-text/50'
                                }`}>
                                  {arrow.type === 'strength' ? 'Strength' : arrow.type === 'weakness' ? 'Missing' : 'Inactive'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Lo Shu Readings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider border-b border-gray-100 pb-2">Grid Readings</h3>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Strengths</span>
                            <p className="text-xs text-text/80 leading-relaxed">
                              {result.loShuArrows.filter(a => a.type === 'strength').length > 0
                                ? `Possesses strong grid lines: ${result.loShuArrows.filter(a => a.type === 'strength').map(a => a.name).join(', ')}. These indicate active execution of goals, structural planning, and determination.`
                                : 'No complete arrow lines detected. Focus on strengthening energy through remedies and lifestyle adjustments.'}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Weaknesses</span>
                            <p className="text-xs text-text/80 leading-relaxed">
                              {result.missingNumbers.length > 0
                                ? `Missing numbers ${result.missingNumbers.join(', ')} indicate potential gaps in practical focus, emotional grounding, or organizational foresight.${result.loShuArrows.filter(a => a.type === 'weakness').length > 0 ? ` Weak arrows: ${result.loShuArrows.filter(a => a.type === 'weakness').map(a => a.name).join(', ')}.` : ''}`
                                : 'No missing numbers detected. The grid shows a balanced energy profile.'}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Lucky Direction & colors</span>
                            <p className="text-xs text-text/80 leading-relaxed">
                              <strong>Lucky Direction:</strong> {result.luckySuggestions.directions.join(' or ')} | <strong>Lucky Colors:</strong> {result.luckySuggestions.colors.join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider border-b border-gray-100 pb-2">Life Path Guidance</h3>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Career Suggestions</span>
                            <p className="text-xs text-text/80 leading-relaxed">
                              Well suited for: {result.luckySuggestions.careers.join(', ')}. Excellent organizational skills support administration or freelance paths.
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Health Analysis</span>
                            <p className="text-xs text-text/80 leading-relaxed">
                              Pay attention to general energy levels. Refrain from over-exhaustion, practice morning meditation daily to balance internal pranic forces.
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Relationship Insights</span>
                            <p className="text-xs text-text/80 leading-relaxed">
                              Vibrates to number {result.conductorNum} Conductor, indicating high emotional capacity. Respect the opinions of your close ones and avoid rigid arguments.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VEDIC GRID TAB */}
                  {activeTab === 'vedic' && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vedic Square */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center relative">
                          <div className="flex justify-between items-center w-full mb-4 border-b border-gray-100 pb-2">
                            <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider text-left">Vedic Square Layout</h3>
                            <button
                              onClick={() => setIsEditingGrids(!isEditingGrids)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                isEditingGrids 
                                  ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-text/60 shadow-xs'
                              }`}
                            >
                              {isEditingGrids ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Save Cells
                                </>
                              ) : (
                                <>
                                  <Edit className="w-3 h-3" /> Edit Cells
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                            {result.vedicGrid.map((row, rIdx) =>
                              row.map((val, cIdx) => {
                                const baseVal = [
                                  [3, 1, 9],
                                  [6, 7, 5],
                                  [2, 8, 4]
                                ][rIdx][cIdx];
                                const isMissing = !val;
                                return (
                                  <div
                                    key={`${rIdx}-${cIdx}`}
                                    className={`aspect-square flex flex-col items-center justify-center border-2 rounded-xl transition-all relative ${
                                      isMissing
                                        ? 'border-gray-100 bg-gray-50/50 text-text/20'
                                        : 'border-teal-500 bg-teal-50/50 text-teal-700'
                                    }`}
                                  >
                                    {isEditingGrids ? (
                                      <input
                                        type="text"
                                        value={val || ''}
                                        onChange={(e) => handleEditVedicCell(rIdx, cIdx, e.target.value)}
                                        placeholder={baseVal.toString()}
                                        className="w-full h-full text-center bg-transparent focus:outline-none text-base font-extrabold text-teal-700 placeholder-text/15"
                                      />
                                    ) : (
                                      <>
                                        <span className="text-base font-extrabold">{val || baseVal}</span>
                                        {isMissing && <span className="text-[8px] uppercase font-bold text-text/20">Empty</span>}
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Vedic Core Planetary Stats */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider border-b border-gray-100 pb-2">Vedic Planetary Statistics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                              <span className="block text-[8px] font-bold text-text/40 uppercase">Strong Planets</span>
                              <p className="text-xs font-semibold text-teal-700 mt-1">{result.vedicStrongPlanets.join(', ') || 'None'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                              <span className="block text-[8px] font-bold text-text/40 uppercase">Weak Planets</span>
                              <p className="text-xs font-semibold text-red-600 mt-1">{result.vedicWeakPlanets.join(', ') || 'None'}</p>
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Planet Strength Charge</span>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${result.vedicPlanetStrengthPct}%` }} />
                              </div>
                              <span className="text-xs font-bold text-teal-700">{result.vedicPlanetStrengthPct}%</span>
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Planet Associations</span>
                            <p className="text-xs text-text/80 leading-relaxed">
                              Sun (1), Moon (2), Jupiter (3), Rahu (4), Mercury (5), Venus (6), Ketu (7), Saturn (8), Mars (9).
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vedic Guidance Card */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider border-b border-gray-100 pb-3 mb-4">Planetary Vedic Guidance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <span className="block text-[10px] font-bold text-text/40 uppercase">Positive Traits</span>
                              <p className="text-xs text-text/80">Courageous, highly intuitive, adaptive mind, logical reasoning.</p>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-text/40 uppercase">Negative Traits</span>
                              <p className="text-xs text-text/80">Restlessness, ego clashes, emotional blockages, sudden delays.</p>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-text/40 uppercase">Lucky Dates & numbers</span>
                              <p className="text-xs text-text/80">Dates: {result.luckySuggestions.dates.join(', ')} | Numbers: {result.luckySuggestions.numbers.join(', ')}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="block text-[10px] font-bold text-text/40 uppercase">Career Guidance</span>
                              <p className="text-xs text-text/80">Administrative, management, or counseling pathways. Good for self-employment.</p>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-text/40 uppercase">Relationship Guidance</span>
                              <p className="text-xs text-text/80">Avoid dominant arguments. Show empathy to partner, practice soft speech.</p>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-text/40 uppercase">Health & Financial Guidance</span>
                              <p className="text-xs text-text/80">Avoid speculative investments on Saturdays. Maintain stable digestive habits.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* REPORT SUMMARY TAB */}
                  {activeTab === 'summary' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider">Client Report Summary</h3>
                        <span className="text-[10px] font-bold text-primary font-mono bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">Finalised Audit</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="block text-[9px] font-bold text-text/30 uppercase">Full Name</span>
                          <span className="font-bold text-text">{result.name}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-text/30 uppercase">Date of Birth</span>
                          <span className="font-bold text-text">{result.dob}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-text/30 uppercase">Mobile Number</span>
                          <span className="font-bold text-text">{result.mobile || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-text/30 uppercase">Email</span>
                          <span className="font-bold text-text">{result.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-4">
                        <div>
                          <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Core Numbers</span>
                          <p className="text-xs text-text/80">
                            Psychic/Birth: <strong>{result.driverNum}</strong> | Conductor/Destiny: <strong>{result.conductorNum}</strong> | Name Vibration: <strong>{reportNameVibrationDesc(result)}</strong>
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Grid Highlights</span>
                          <p className="text-xs text-text/80">
                            Missing DOB numbers: <strong>{result.missingNumbers.join(', ') || 'None'}</strong> | Repeated numbers: <strong>{result.loShuRepeated.join(', ') || 'None'}</strong>
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-text/40 uppercase mb-1">Remedial Action Map</span>
                          <p className="text-xs text-text/80">
                            Suitable Colors: <strong>{result.remedies.colors.join(', ')}</strong> | Gemstone: <strong>{result.luckySuggestions.gemstones.join(', ')}</strong> | Direction: <strong>{result.luckySuggestions.directions.join(', ')}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <span className="block text-[10px] font-bold text-text/40 uppercase mb-2">AI Spiritual Interpretation</span>
                        <div className="bg-[#FAF9F5] border border-gray-100/80 rounded-xl p-4 text-xs text-text/75 leading-relaxed italic whitespace-pre-wrap">
                          {result.aiReport}
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}
          </div>

        </div>

      </div>

      {/* Edit Print details Modal */}
      {showEditRemediesModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowEditRemediesModal(false)} />
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xl relative w-full max-w-lg z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text mb-4 border-b border-gray-100 pb-2">Customise printable PDF details</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-text/70 mb-1.5">🔮 Customized Remedies & Daily Habits</label>
                <textarea
                  rows={4}
                  value={customRemedies}
                  onChange={(e) => setCustomRemedies(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text/70 mb-1.5">🔱 Customized Suggested Yantras</label>
                <input
                  type="text"
                  value={customYantra}
                  onChange={(e) => setCustomYantra(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text/70 mb-1.5">💎 Customized Crystals & Gemstones</label>
                <input
                  type="text"
                  value={customCrystals}
                  onChange={(e) => setCustomCrystals(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowEditRemediesModal(false)}
                className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl text-text/60 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditRemediesModal(false);
                  toast.success('Print details updated locally!');
                }}
                className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function reportNameVibrationDesc(report: NumerologyReport): string {
  return `${report.nameAnalysis.compoundNumber} reduces to ${report.nameAnalysis.nameNumber} (${report.nameAnalysis.nameNumber === report.conductorNum ? 'Highly Harmonious' : 'Neutral Vibration'})`;
}
