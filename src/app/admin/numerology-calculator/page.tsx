'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search, Save, Printer, FileText, RotateCcw, ChevronDown, ChevronUp,
  Heart, Home, Car, Smartphone, Sparkles, CheckCircle2, AlertCircle,
  HelpCircle, Trash2, Calendar, User, Mail, Phone, MapPin, Clock, X, Edit
} from 'lucide-react';

import {
  calculateNumerology,
  calculateCompatibility,
  reduceToSingleDigit,
  NumerologyReport,
  CompatibilityResult
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
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gender, setGender] = useState('male');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  // Special calculations inputs
  const [partnerName, setPartnerName] = useState('');
  const [partnerDob, setPartnerDob] = useState('');
  const [mobileToCheck, setMobileToCheck] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [houseNo, setHouseNo] = useState('');

  // Loaded report id (if we loaded an existing report)
  const [loadedReportId, setLoadedReportId] = useState<string | undefined>(undefined);

  // Search reports state
  const [searchQuery, setSearchQuery] = useState('');
  const [savedReports, setSavedReports] = useState<SavedNumerologyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<SavedNumerologyReport[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Calculation results
  const [result, setResult] = useState<NumerologyReport | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);

  // Custom Print/Edit States
  const [showEditRemediesModal, setShowEditRemediesModal] = useState(false);
  const [customRemedies, setCustomRemedies] = useState('');
  const [customYantra, setCustomYantra] = useState('');
  const [customCrystals, setCustomCrystals] = useState('');

  // Expandable cards state (Section collapse states)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    loshu: true,
    vedic: false,
    pythagorean: false,
    planets: false,
    name: false,
    mobile: false,
    vehicle: false,
    house: false,
    compatibility: false,
    predictions: false,
    lucky: false,
    remedies: false,
    ai: false,
  });

  // Load saved reports for search autocomplete
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
            qPhone ? decodeURIComponent(qPhone) : '',
            '',
            ''
          );
          setResult(report);
          toast.success(`Automatically computed audit for ${decodeURIComponent(qName)}!`);
        } catch (e) {
          console.error('Auto-calculation error:', e);
        }
      }
    }
  }, []);

  // Filter reports on query change
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

  // Expand / Collapse all
  const setAllSections = (val: boolean) => {
    const updated = { ...expandedSections };
    Object.keys(updated).forEach(k => {
      updated[k] = val;
    });
    setExpandedSections(updated);
  };

  // Toggle single section
  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sec]: !prev[sec],
    }));
  };

  // Calculation trigger
  const handleCalculate = () => {
    if (!name.trim()) {
      toast.error('Please enter the client\'s full name');
      return;
    }
    if (!dob) {
      toast.error('Please select the client\'s date of birth');
      return;
    }

    try {
      const report = calculateNumerology(
        name,
        dob,
        gender,
        mobile,
        email,
        mobileToCheck || mobile, // Default check mobile to mobile if empty
        vehicleNo,
        houseNo
      );
      setResult(report);
      setCustomRemedies(report.remedies.lifestyle.join('\n'));
      setCustomYantra(report.driverNum === 1 ? 'Shree Surya Yantra' : report.driverNum === 3 ? 'Guru Yantra' : report.driverNum === 6 ? 'Shree Shukra Yantra' : 'Shree Yantra');
      setCustomCrystals(report.luckySuggestions.gemstones.join(', '));

      // Partner compatibility calculation if partner details provided
      if (partnerName.trim() && partnerDob) {
        const pReport = calculateNumerology(partnerName, partnerDob, 'female', '', '');
        const comp = calculateCompatibility(
          report.driverNum,
          report.conductorNum,
          pReport.driverNum,
          pReport.conductorNum
        );
        setCompatibility(comp);
      } else {
        setCompatibility(null);
      }

      toast.success('Numerology Audit calculated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error during calculations. Please verify input data.');
    }
  };

  // Clear inputs
  const handleClear = () => {
    setName('');
    setDob('');
    setTimeOfBirth('');
    setPlaceOfBirth('');
    setGender('male');
    setMobile('');
    setEmail('');
    setPartnerName('');
    setPartnerDob('');
    setMobileToCheck('');
    setVehicleNo('');
    setHouseNo('');
    setResult(null);
    setCompatibility(null);
    setLoadedReportId(undefined);
    setCustomRemedies('');
    setCustomYantra('');
    setCustomCrystals('');
    toast.success('Calculator inputs reset');
  };

  // Save report to firestore
  const handleSaveReport = async () => {
    if (!name.trim() || !dob) {
      toast.error('Calculate a report first before saving');
      return;
    }

    // Run calculation first to ensure we save latest states
    const reportToSave = {
      ...calculateNumerology(
        name,
        dob,
        gender,
        mobile,
        email,
        mobileToCheck || mobile,
        vehicleNo,
        houseNo
      ),
      customRemedies,
      customYantra,
      customCrystals
    };

    try {
      const docId = await saveNumerologyReport(loadedReportId, reportToSave);
      setLoadedReportId(docId);
      toast.success(loadedReportId ? 'Client report updated successfully!' : 'Client report saved successfully!');
      fetchReports(); // Refresh local list
    } catch (err) {
      console.error(err);
      toast.error('Failed to save report to database.');
    }
  };

  // Load a report from search
  const handleLoadReport = (rep: SavedNumerologyReport) => {
    setName(rep.name || '');
    setDob(rep.dob || '');
    setGender(rep.gender || 'male');
    setMobile(rep.mobile || '');
    setEmail(rep.email || '');
    setMobileToCheck(rep.mobileAnalysis?.value ? rep.mobile : '');
    setVehicleNo(rep.vehicleAnalysis?.value ? rep.mobile : ''); // Load vehicle if present
    setHouseNo(rep.houseAnalysis?.value ? rep.mobile : '');

    setResult(rep);
    setCustomRemedies(rep.customRemedies || rep.remedies?.lifestyle?.join('\n') || '');
    setCustomYantra(rep.customYantra || (rep.driverNum === 1 ? 'Shree Surya Yantra' : rep.driverNum === 3 ? 'Guru Yantra' : rep.driverNum === 6 ? 'Shree Shukra Yantra' : 'Shree Yantra'));
    setCustomCrystals(rep.customCrystals || rep.luckySuggestions?.gemstones?.join(', ') || '');
    setLoadedReportId(rep.id);
    setShowSearchDropdown(false);
    setSearchQuery('');
    toast.success(`Loaded profile for ${rep.name}`);
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
        handleClear();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report.');
    }
  };

  // Copy report summary to clipboard
  const handleCopyReport = () => {
    if (!result) {
      toast.error('No report available to copy. Run calculations first.');
      return;
    }
    navigator.clipboard.writeText(result.aiReport);
    toast.success('AI Audit interpretation copied to clipboard!');
  };

  // Export PDF & Print Functionality via secondary window styling
  const handlePrint = () => {
    if (!result) {
      toast.error('No report available. Run calculations first.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for printing.');
      return;
    }

    // Build print HTML content
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const loShuGridHtml = result.loShuGrid
      .map(row =>
        `<tr>` +
        row.map(val => `<td class="grid-cell">${val || '&nbsp;'}</td>`).join('') +
        `</tr>`
      )
      .join('');

    const vedicGridHtml = result.vedicGrid
      .map(row =>
        `<tr>` +
        row.map(val => `<td class="grid-cell">${val || '&nbsp;'}</td>`).join('') +
        `</tr>`
      )
      .join('');

    const pythagoreanGridHtml = result.pythagoreanGrid
      .map(row =>
        `<tr>` +
        row.map(val => `<td class="grid-cell">${val || '&nbsp;'}</td>`).join('') +
        `</tr>`
      )
      .join('');

    const planetsHtml = result.planetsAnalysis
      .filter(p => p.strengthPct > 0)
      .map(p => `
        <div class="planet-card">
          <h4>${p.name} - Strength ${p.strengthPct}%</h4>
          <p><strong>Influence:</strong> ${p.details.influence}</p>
          <p><strong>Remedies:</strong> ${p.details.remedies}</p>
          <p><strong>Lucky Day:</strong> ${p.details.day} | <strong>Lucky Color:</strong> ${p.details.color}</p>
        </div>
      `)
      .join('');

    const arrowsHtml = result.loShuArrows
      .map(a => `
        <div class="arrow-item ${a.type === 'strength' ? 'arrow-strength' : a.type === 'weakness' ? 'arrow-weakness' : ''}">
          <strong>${a.name} (${a.numbers.join('-')}):</strong> ${a.status} - <em>${a.meaning}</em>
        </div>
      `)
      .join('');

    const remediesHtml = result.remedies.lifestyle
      .map(l => `<li>${l}</li>`)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Numerology Audit - ${result.name}</title>
          <style>
            @media print {
              body { padding: 0; margin: 0; background: #fff; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
              .card { page-break-inside: avoid; }
            }
            body {
              font-family: 'Poppins', system-ui, -apple-system, sans-serif;
              color: #1f2937;
              margin: 0;
              padding: 40px;
              background-color: #fff;
              line-height: 1.6;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #f3f4f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-area h1 {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 28px;
              color: #0F766E;
              margin: 0 0 5px 0;
              font-weight: bold;
            }
            .logo-area p {
              margin: 2px 0;
              font-size: 12px;
              color: #666;
            }
            .report-details {
              text-align: right;
            }
            .report-details h2 {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 22px;
              margin: 0 0 10px 0;
              color: #111;
              letter-spacing: 0.5px;
              font-weight: bold;
            }
            .report-details p {
              margin: 3px 0;
              font-size: 12px;
              color: #555;
            }
            .client-info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              background: #f9fafb;
            }
            .client-info-table td {
              padding: 10px 15px;
              border: 1px solid #e5e7eb;
              font-size: 13px;
            }
            .client-info-table td.label {
              font-weight: bold;
              color: #0F766E;
              width: 25%;
            }
            .section-title {
              font-family: 'Playfair Display', Georgia, serif;
              color: #0F766E;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-top: 40px;
              margin-bottom: 20px;
              font-size: 20px;
              font-weight: bold;
            }
            .grid-container {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              margin-bottom: 30px;
            }
            .grid-box {
              flex: 1;
              text-align: center;
              background: #fafaf9;
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .grid-box h3 {
              margin: 0 0 12px 0;
              color: #0F766E;
              font-size: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 6px;
            }
            .calc-grid {
              margin: 0 auto;
              border-collapse: collapse;
            }
            .grid-cell {
              width: 50px;
              height: 50px;
              border: 2px solid #0F766E;
              text-align: center;
              font-weight: bold;
              font-size: 18px;
              color: #1f2937;
              background: #fff;
            }
            .core-list {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .core-item {
              border-bottom: 1px dashed #e5e7eb;
              padding-bottom: 8px;
              font-size: 13px;
            }
            .core-item span.lbl {
              font-weight: bold;
              color: #4b5563;
            }
            .core-item span.val {
              float: right;
              font-weight: bold;
              color: #0F766E;
            }
            .ai-text {
              white-space: pre-line;
              font-size: 13px;
              color: #374151;
              background: #fdfdfd;
              border-left: 4px solid #D4AF37;
              padding: 15px;
              margin-top: 15px;
            }
            .planet-card {
              border: 1px solid #f3f4f6;
              padding: 12px;
              margin-bottom: 15px;
              border-radius: 6px;
              background: #fafaf9;
              page-break-inside: avoid;
            }
            .planet-card h4 {
              margin: 0 0 8px 0;
              color: #0F766E;
              font-size: 14px;
            }
            .planet-card p {
              margin: 4px 0;
              font-size: 12px;
            }
            .arrow-item {
              padding: 6px 10px;
              font-size: 12px;
              border-left: 3px solid #e5e7eb;
              margin-bottom: 6px;
            }
            .arrow-strength {
              border-left-color: #10b981;
              background-color: #ecfdf5;
            }
            .arrow-weakness {
              border-left-color: #ef4444;
              background-color: #fef2f2;
            }
            .footer-note {
              margin-top: 60px;
              text-align: center;
              font-size: 11px;
              color: #9ca3af;
              border-top: 1px dashed #e5e7eb;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-area">
                <h1>DIVYA URJA</h1>
                <p>Ancient Sciences & Spiritual Guidance</p>
                <p>Pune, Maharashtra, India</p>
                <p>Phone: +91 98224 92488</p>
                <p>Email: info@divyaurja.com</p>
              </div>
              <div class="report-details">
                <h2>NUMEROLOGY AUDIT</h2>
                <p><strong>Report ID:</strong> #RP-${(loadedReportId || 'draft').substring(0, 8).toUpperCase()}</p>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Status:</strong> FINAL REPORT</p>
              </div>
            </div>

            <table class="client-info-table">
              <tr>
                <td class="label">Full Name</td>
                <td>${result.name}</td>
                <td class="label">Report Date</td>
                <td>${dateStr}</td>
              </tr>
              <tr>
                <td class="label">Date of Birth</td>
                <td>${result.dob}</td>
                <td class="label">Gender</td>
                <td>${result.gender.toUpperCase()}</td>
              </tr>
              <tr>
                <td class="label">Mobile Number</td>
                <td>${result.mobile}</td>
                <td class="label">Email Address</td>
                <td>${result.email || 'N/A'}</td>
              </tr>
            </table>

            <h2 class="section-title">1. Core Numerology Vibration</h2>
            <div class="core-list">
              <div class="core-item"><span class="lbl">Life Path Number</span><span class="val">${result.lifePath}</span></div>
              <div class="core-item" style="font-weight: bold; background-color: #f0fdfa; border-radius: 6px; padding: 6px 12px; border: 1px solid #ccfbf1;"><span class="lbl" style="color: #0F766E;">Destiny Number *</span><span class="val" style="color: #0F766E; font-size: 16px;">${result.destiny}</span></div>
              <div class="core-item"><span class="lbl">Soul Urge Number</span><span class="val">${result.soulUrge}</span></div>
              <div class="core-item" style="font-weight: bold; background-color: #f0fdfa; border-radius: 6px; padding: 6px 12px; border: 1px solid #ccfbf1;"><span class="lbl" style="color: #0F766E;">Personality Number *</span><span class="val" style="color: #0F766E; font-size: 16px;">${result.personality}</span></div>
              <div class="core-item"><span class="lbl">Driver (Moolank)</span><span class="val">${result.driverNum}</span></div>
              <div class="core-item"><span class="lbl">Conductor (Bhagyank)</span><span class="val">${result.conductorNum}</span></div>
              <div class="core-item"><span class="lbl">Maturity Number</span><span class="val">${result.maturityNum}</span></div>
              <div class="core-item"><span class="lbl">Attitude Number</span><span class="val">${result.attitudeNum}</span></div>
              <div class="core-item"><span class="lbl">Balance Number</span><span class="val">${result.balanceNum}</span></div>
              <div class="core-item"><span class="lbl">Bridge Number</span><span class="val">${result.bridgeNum}</span></div>
            </div>

            <h2 class="section-title">2. Core Numerological Grids</h2>
            <div class="grid-container">
              <div class="grid-box">
                <h3>Lo Shu Grid</h3>
                <table class="calc-grid">${loShuGridHtml}</table>
              </div>
              <div class="grid-box">
                <h3>Vedic Grid</h3>
                <table class="calc-grid">${vedicGridHtml}</table>
              </div>
              <div class="grid-box">
                <h3>Pythagorean Square</h3>
                <table class="calc-grid">${pythagoreanGridHtml}</table>
              </div>
            </div>

            <div class="page-break"></div>

            <h2 class="section-title">3. Lo Shu Arrow Analysis</h2>
            <div>${arrowsHtml}</div>

            <h2 class="section-title">4. Name & Phone Vibration Audit</h2>
            <div class="core-list" style="margin-bottom: 20px;">
              <div class="core-item"><span class="lbl">Name Compound Sum</span><span class="val">${result.nameAnalysis.compoundNumber}</span></div>
              <div class="core-item"><span class="lbl">Suggested Spelling</span><span class="val">${result.nameAnalysis.suggestedSpellings[0] || 'Spelling is Optimal'}</span></div>
              <div class="core-item"><span class="lbl">Mobile Vibration Number</span><span class="val">${result.mobileAnalysis.value || 'N/A'}</span></div>
              <div class="core-item"><span class="lbl">Mobile Harmony Score</span><span class="val">${result.mobileAnalysis.luckyPercentage ? result.mobileAnalysis.luckyPercentage + '%' : 'N/A'}</span></div>
            </div>

            <h2 class="section-title">5. Planet Analysis</h2>
            <div>${planetsHtml}</div>

            <div class="page-break"></div>

            <h2 class="section-title">6. Remedies & Suggestions</h2>
            <p><strong>Suitable Colors:</strong> ${result.remedies.colors.join(', ')}</p>
            <p><strong>Suitable Days:</strong> ${result.remedies.days.join(', ')}</p>
            <p><strong>Chant Mantra Daily:</strong> ${result.remedies.mantras.join(' or ')}</p>
            <p><strong>Suggested Donations:</strong> ${result.remedies.donations.join(', ')}</p>

            <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 15px; border-radius: 8px; margin-top: 15px; margin-bottom: 15px; font-size: 13px; color: #111;">
              <p style="color: #0F766E; margin: 0 0 6px 0; font-size: 14px; border-bottom: 1px solid #ccfbf1; padding-bottom: 6px; font-weight: bold;">🔮 Core Remedies & Daily Habits (Customized)</p>
              <div style="white-space: pre-line; line-height: 1.6; font-weight: bold;">${customRemedies}</div>
            </div>

            <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-size: 13px; color: #111;">
              <p style="color: #b45309; margin: 0 0 6px 0; font-size: 14px; border-bottom: 1px solid #fde68a; padding-bottom: 6px; font-weight: bold;">🔱 Extra Suggested Yantras (Customized)</p>
              <div style="white-space: pre-line; line-height: 1.6; font-weight: bold;">${customYantra}</div>
            </div>

            <div style="background-color: #eff6ff; border: 1px solid #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-size: 13px; color: #111;">
              <p style="color: #1d4ed8; margin: 0 0 6px 0; font-size: 14px; border-bottom: 1px solid #dbeafe; padding-bottom: 6px; font-weight: bold;">💎 Crystals & Gemstones (Customized)</p>
              <div style="white-space: pre-line; line-height: 1.6; font-weight: bold;">${customCrystals}</div>
            </div>

            <h2 class="section-title">7. AI Spiritual Interpretation</h2>
            <div class="ai-text">${result.aiReport}</div>

            <div class="footer-note">
              <p>Thank you for consulting Divya Urja!</p>
              <p>This is a computer generated calculations summary report compiled by Divya Urja Admin.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F4] text-text font-sans pb-10">
      
      {/* Top Header/Action Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-10 py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-playfair text-text">Numerology Calculator</h1>
            <p className="text-xs text-text/40 font-medium">Divya Urja Spiritual Audit Module</p>
          </div>
        </div>

        {/* Client Query Search Bar */}
        <div className="relative w-full md:w-80 z-20">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search saved profiles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
          />

          {/* Search Dropdown Panel */}
          {showSearchDropdown && filteredReports.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleLoadReport(report)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 text-sm transition-all"
                >
                  <div>
                    <p className="font-semibold text-text">{report.name}</p>
                    <p className="text-xs text-text/50">DOB: {report.dob} | Phone: {report.mobile}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteReport(report.id, e)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty Search Dropdown State */}
          {showSearchDropdown && searchQuery && filteredReports.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4 text-center text-xs text-text/40">
              No matching profiles found.
            </div>
          )}

          {/* Dismiss search backdrop */}
          {showSearchDropdown && (
            <div className="fixed inset-0 z-10" onClick={() => setShowSearchDropdown(false)} />
          )}
        </div>

        {/* Global Control Button actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-primary/10"
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
              <Edit className="w-3.5 h-3.5" /> Edit print details
            </button>
          )}
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-text/75 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" /> Copy AI Summary
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-text/60 rounded-xl text-xs font-semibold transition-all"
            title="Reset calculator inputs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Input Sidebar Panel */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5 sticky top-24">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text/60">Client Details</h2>
            <p className="text-[10px] text-text/40">Provide birth coordinates and contact info</p>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-text/70 block mb-1.5">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text/40"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text/70 block mb-1.5">Date of Birth *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text/40"><Calendar className="w-4 h-4" /></span>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text/70 block mb-1.5">Time of Birth (Opt)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text/40"><Clock className="w-4 h-4" /></span>
                  <input
                    type="time"
                    value={timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text/70 block mb-1.5">Place of Birth (Opt)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text/40"><MapPin className="w-4 h-4" /></span>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text/70 block mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text/70 block mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text/40"><Phone className="w-4 h-4" /></span>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text/70 block mb-1.5">Email Address (Opt)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text/40"><Mail className="w-4 h-4" /></span>
                <input
                  type="email"
                  placeholder="e.g. client@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Special Integrations Section */}
          <div className="border-t border-gray-100 pt-4 mt-1 flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-text/40">Additional Analysis Fields</span>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text/50">Mobile Audit</label>
                <input
                  type="text"
                  placeholder="Mobile"
                  value={mobileToCheck}
                  onChange={(e) => setMobileToCheck(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text/50">Vehicle No</label>
                <input
                  type="text"
                  placeholder="MH12XY1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text/50">House No</label>
                <input
                  type="text"
                  placeholder="B-302"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Partner Details */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <label className="text-[10px] font-bold text-text/50">Partner Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text/50">Partner DOB</label>
                <input
                  type="date"
                  value={partnerDob}
                  onChange={(e) => setPartnerDob(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
            <button
              onClick={handleClear}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-text/80 font-bold rounded-xl text-xs transition-colors"
            >
              Clear inputs
            </button>
            <button
              onClick={handleCalculate}
              className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-primary/10"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Right Dashboard Results View */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Expanded / Collapse Dashboard controller */}
          {result && (
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="text-xs font-semibold text-text/50">Audit calculated for: <strong className="text-primary">{result.name}</strong> ({result.dob})</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAllSections(true)}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Expand All
                </button>
                <span className="text-text/20">|</span>
                <button
                  onClick={() => setAllSections(false)}
                  className="text-[10px] font-bold text-text/40 hover:underline"
                >
                  Collapse All
                </button>
              </div>
            </div>
          )}

          {/* Empty state when no calculation is triggered */}
          {!result && (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-playfair">Calculations Dashboard</h3>
                <p className="text-sm text-text/50 max-w-sm mt-1 mx-auto">
                  Provide name and date of birth in the input panel and click "Calculate" to generate the numerology audit grid reports.
                </p>
              </div>
            </div>
          )}

          {/* Report Cards wrapper */}
          {result && (
            <div className="flex flex-col gap-4">

              {/* 1. Basic Numerology Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('basic')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">1</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Basic Numerology</h3>
                      <p className="text-[10px] text-text/40">Core numeric parameters and challenge numbers</p>
                    </div>
                  </div>
                  {expandedSections.basic ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.basic && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic properties grid */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Life Path Number</span>
                        <span className="text-sm font-bold text-primary">{result.lifePath}</span>
                      </div>
                      <div className="flex items-center justify-between border border-teal-100 bg-teal-50/70 p-2 rounded-xl">
                        <span className="text-xs font-bold text-teal-800">Destiny Number *</span>
                        <span className="text-base font-extrabold text-teal-800">{result.destiny}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Expression Number</span>
                        <span className="text-sm font-bold text-primary">{result.expression}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Soul Urge Number</span>
                        <span className="text-sm font-bold text-primary">{result.soulUrge}</span>
                      </div>
                      <div className="flex items-center justify-between border border-teal-100 bg-teal-50/70 p-2 rounded-xl">
                        <span className="text-xs font-bold text-teal-800">Personality Number *</span>
                        <span className="text-base font-extrabold text-teal-800">{result.personality}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Birthday Number</span>
                        <span className="text-sm font-bold text-primary">{result.birthdayNum}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Maturity Number</span>
                        <span className="text-sm font-bold text-primary">{result.maturityNum}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Attitude Number</span>
                        <span className="text-sm font-bold text-primary">{result.attitudeNum}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Balance Number</span>
                        <span className="text-sm font-bold text-primary">{result.balanceNum}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-xs text-text/60">Bridge Number</span>
                        <span className="text-sm font-bold text-primary">{result.bridgeNum}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Secondary metrics */}
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold text-text/40 tracking-wider">Lessons & Debt Nodes</span>
                        <div className="flex justify-between text-xs">
                          <span>Hidden Passion:</span>
                          <strong className="text-primary">{result.hiddenPassion}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Subconscious Self:</span>
                          <strong className="text-primary">{result.subconsciousSelf}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Karmic Lessons:</span>
                          <strong className="text-red-500">{result.karmicLessons.join(', ') || 'None'}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Missing DOB Numbers:</span>
                          <strong className="text-red-500">{result.missingNumbers.join(', ') || 'None'}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Karmic Debt:</span>
                          <strong className="text-red-600">{result.karmicDebts.join(', ') || 'None'}</strong>
                        </div>
                      </div>

                      {/* Pinnacles and Challenges */}
                      <div className="bg-primary/5 rounded-xl p-4 flex flex-col gap-2.5 border border-primary/10">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Challenges & Pinnacles</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="block text-[10px] text-text/50">Pinnacles (1-4)</span>
                            <strong className="text-primary">{result.pinnacles.join(' ➔ ')}</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-text/50">Challenges (1-4)</span>
                            <strong className="text-red-600">{result.challenges.join(' ➔ ')}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Lo Shu Grid Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('loshu')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">2</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Lo Shu Grid</h3>
                      <p className="text-[10px] text-text/40">3x3 magic square and arrow planes</p>
                    </div>
                  </div>
                  {expandedSections.loshu ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.loshu && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* The 3x3 Grid rendering */}
                    <div className="md:col-span-5 flex justify-center">
                      <div className="grid grid-cols-3 gap-2 bg-[#F8F7F4] p-3 rounded-2xl border border-gray-100 shadow-inner">
                        {result.loShuGrid.map((row, rIdx) =>
                          row.map((val, cIdx) => (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className="w-16 h-16 bg-white border-2 border-primary rounded-xl flex items-center justify-center font-bold text-lg text-primary shadow-sm hover:scale-105 transition-transform"
                            >
                              {val || <span className="text-gray-100 text-xs">·</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Metadata & Arrow lines */}
                    <div className="md:col-span-7 flex flex-col gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                        <div>Repeated: <strong className="text-primary">{result.loShuRepeated.join(', ') || 'None'}</strong></div>
                        <div>Missing: <strong className="text-red-500">{result.missingNumbers.join(', ') || 'None'}</strong></div>
                        <div>Dominant: <strong className="text-gold font-bold">{result.loShuDominant.join(', ')}</strong></div>
                      </div>

                      {/* Expanded Arrow details list */}
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {result.loShuArrows.map((a, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start justify-between border-l-4 p-2 text-xs rounded-r-lg ${
                              a.type === 'strength'
                                ? 'border-green-500 bg-green-50/50'
                                : a.type === 'weakness'
                                ? 'border-red-400 bg-red-50/30'
                                : 'border-gray-200 bg-gray-50/30'
                            }`}
                          >
                            <div>
                              <span className="font-semibold block text-text/80">{a.name}</span>
                              <span className="text-[10px] text-text/50">{a.meaning}</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              a.type === 'strength'
                                ? 'bg-green-100 text-green-700'
                                : a.type === 'weakness'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-text/50'
                            }`}>
                              {a.status.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* 3. Vedic Grid Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('vedic')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">3</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Vedic Grid</h3>
                      <p className="text-[10px] text-text/40">Planetary placements (Navagraha) and compatibility</p>
                    </div>
                  </div>
                  {expandedSections.vedic ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.vedic && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Grid rendering */}
                    <div className="md:col-span-5 flex justify-center">
                      <div className="grid grid-cols-3 gap-2 bg-[#F8F7F4] p-3 rounded-2xl border border-gray-100 shadow-inner">
                        {result.vedicGrid.map((row, rIdx) =>
                          row.map((val, cIdx) => (
                            <div
                              key={`vedic-${rIdx}-${cIdx}`}
                              className="w-16 h-16 bg-white border-2 border-primary rounded-xl flex flex-col items-center justify-center font-bold text-lg text-primary shadow-sm hover:scale-105 transition-transform"
                            >
                              {val || <span className="text-gray-100 text-xs">·</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Metadata & Strengths */}
                    <div className="md:col-span-7 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                          <span className="text-[9px] uppercase font-bold text-text/40">Strong Planets</span>
                          <span className="font-semibold text-green-600">{result.vedicStrongPlanets.join(', ') || 'None'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                          <span className="text-[9px] uppercase font-bold text-text/40">Weak Planets</span>
                          <span className="font-semibold text-red-500">{result.vedicWeakPlanets.join(', ') || 'None'}</span>
                        </div>
                      </div>

                      <div className="bg-primary/5 rounded-xl p-4 flex flex-col gap-2.5 border border-primary/10 text-xs">
                        <div className="flex justify-between">
                          <span>Driver / Conductor:</span>
                          <strong className="text-primary">{result.driverNum} / {result.conductorNum}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Friendly/Lucky numbers:</span>
                          <strong className="text-green-600">{result.luckyNumbers.join(', ')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Unlucky numbers:</span>
                          <strong className="text-red-500">{result.unluckyNumbers.join(', ') || 'None'}</strong>
                        </div>
                        <div className="flex justify-between items-center mt-1 border-t border-primary/10 pt-2">
                          <span>Planetary Strength Index:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: `${result.vedicPlanetStrengthPct}%` }} />
                            </div>
                            <strong className="text-primary">{result.vedicPlanetStrengthPct}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* 4. Pythagorean Grid Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('pythagorean')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">4</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Pythagorean Grid</h3>
                      <p className="text-[10px] text-text/40">Working numbers and physical/mental plane matrix</p>
                    </div>
                  </div>
                  {expandedSections.pythagorean ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.pythagorean && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Pythagorean Grid Rendering */}
                    <div className="md:col-span-5 flex justify-center">
                      <div className="grid grid-cols-3 gap-2 bg-[#F8F7F4] p-3 rounded-2xl border border-gray-100 shadow-inner">
                        {result.pythagoreanGrid.map((row, rIdx) =>
                          row.map((val, cIdx) => (
                            <div
                              key={`pyth-${rIdx}-${cIdx}`}
                              className="w-16 h-16 bg-white border-2 border-primary rounded-xl flex items-center justify-center font-bold text-lg text-primary shadow-sm hover:scale-105 transition-transform"
                            >
                              {val || <span className="text-gray-100 text-xs">·</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Planes and working numbers */}
                    <div className="md:col-span-7 flex flex-col gap-4">
                      <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                        <span className="text-[9px] uppercase font-bold text-text/40 tracking-wider">Psychomatrix Working Numbers</span>
                        <div className="flex gap-4">
                          {result.workingNumbers.map((n, idx) => (
                            <div key={idx} className="flex-1 text-center bg-white border border-gray-100 rounded-lg py-1.5">
                              <span className="block text-[8px] text-text/40">W{idx + 1}</span>
                              <strong className="text-primary">{n}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Planes status */}
                      <div className="flex flex-col gap-2">
                        {result.pythagoreanPlanes.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                            <div>
                              <span className="font-semibold text-text">{p.name}</span>
                              <span className="block text-[10px] text-text/40 mt-0.5">{p.description}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-primary block">{p.score} pts</span>
                              <span className="text-[9px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{p.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* 5. Planet Analysis Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('planets')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">5</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Planet Analysis</h3>
                      <p className="text-[10px] text-text/40">Vibrational strengths, influence, remedies and lucky attributes</p>
                    </div>
                  </div>
                  {expandedSections.planets ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.planets && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto">
                    {result.planetsAnalysis.filter(p => p.strengthPct > 0).map((p, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                          <span className="font-bold text-primary text-xs">{p.details.ruler}</span>
                          <span className="text-[10px] font-bold text-white bg-primary px-2.5 py-0.5 rounded-full">
                            Strength {p.strengthPct}%
                          </span>
                        </div>
                        <p className="text-xs"><strong className="text-text/70">Influence:</strong> {p.details.influence}</p>
                        <p className="text-xs"><strong className="text-text/70">Remedies:</strong> {p.details.remedies}</p>
                        <div className="grid grid-cols-2 gap-2 mt-1 border-t border-gray-100 pt-2 text-[10px]">
                          <div>Lucky Color: <strong className="text-primary">{p.details.color}</strong></div>
                          <div>Lucky Day: <strong className="text-primary">{p.details.day}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Name Numerology Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('name')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">6</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Name Numerology</h3>
                      <p className="text-[10px] text-text/40">Suggested spellings, missing letters and name vibration alignment</p>
                    </div>
                  </div>
                  {expandedSections.name ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.name && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Expression / Soul Urge:</span>
                        <strong className="text-primary">{result.nameAnalysis.expression} / {result.nameAnalysis.soulUrge}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Personality Number:</span>
                        <strong className="text-primary">{result.nameAnalysis.personality}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Name Number:</span>
                        <strong className="text-primary">{result.nameAnalysis.nameNumber}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Compound Name Sum:</span>
                        <strong className="text-gold font-bold">{result.nameAnalysis.compoundNumber}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Lucky Alphabets:</span>
                        <strong className="text-green-600">{result.nameAnalysis.luckyAlphabets.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Missing Letters:</span>
                        <strong className="text-red-500">{result.nameAnalysis.missingAlphabets.join(', ') || 'None'}</strong>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex flex-col gap-3">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Suggested Spelling Modifications</span>
                      <p className="text-xs text-text/60">
                        Adjusting the name letters can bring your compound vibration into harmony with your Conductor/Driver:
                      </p>
                      <div className="flex flex-col gap-2">
                        {result.nameAnalysis.suggestedSpellings.map((sp, idx) => (
                          <div key={idx} className="bg-white border border-primary/20 px-3 py-2 rounded-lg text-xs font-semibold text-primary shadow-sm">
                            {sp}
                          </div>
                        ))}
                        {result.nameAnalysis.suggestedSpellings.length === 0 && (
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded text-center">Spelling is already highly compatible.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Mobile Number Analysis Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('mobile')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">7</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Mobile Number Analysis</h3>
                      <p className="text-[10px] text-text/40">Planetary influence, positive/negative charges, and lucky score</p>
                    </div>
                  </div>
                  {expandedSections.mobile ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.mobile && (
                  <div className="p-6">
                    {mobileToCheck ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        
                        <div className="text-center bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-center items-center">
                          <Smartphone className="w-8 h-8 text-primary mb-2" />
                          <span className="text-[10px] text-text/40">Vibration Value</span>
                          <strong className="text-xl text-primary font-bold">{result.mobileAnalysis.value}</strong>
                          <span className="text-[9px] font-semibold text-text/60 mt-1">{result.mobileAnalysis.planetInfluence}</span>
                        </div>

                        <div className="flex flex-col gap-3 text-xs">
                          <div className="flex justify-between items-center">
                            <span>Compatibility Score:</span>
                            <strong className="text-green-600">{result.mobileAnalysis.luckyPercentage}%</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${result.mobileAnalysis.luckyPercentage}%` }} />
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-text/40">Energy Distribution</span>
                          <div className="flex justify-between">
                            <span>Positive / Fortunate:</span>
                            <strong className="text-green-600">{result.mobileAnalysis.positiveEnergyPct}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Negative / Struggle:</span>
                            <strong className="text-red-500">{result.mobileAnalysis.negativeEnergyPct}%</strong>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center p-4 text-xs text-text/40">
                        Provide a mobile number in the inputs sidebar to calculate vibration analysis.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 8. Vehicle Number Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('vehicle')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">8</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Vehicle Number Analysis</h3>
                      <p className="text-[10px] text-text/40">Vehicle vibration, luck rating, and owner compatibility status</p>
                    </div>
                  </div>
                  {expandedSections.vehicle ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.vehicle && (
                  <div className="p-6">
                    {vehicleNo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                          <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-primary shadow-sm">
                            <Car className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-text/40 block">Vibration Value</span>
                            <strong className="text-lg text-primary">{result.vehicleAnalysis.value}</strong>
                            <p className="text-[10px] text-text/50">{result.vehicleAnalysis.vibration}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Compatibility Status:</span>
                            <span className="font-semibold text-green-600">{result.vehicleAnalysis.compatibility}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lucky Compatibility Score:</span>
                            <span className="font-bold text-primary">{result.vehicleAnalysis.luckyScore}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-xs text-text/40">
                        Provide a vehicle registration number in the sidebar inputs to audit.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 9. House Number Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('house')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">9</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">House Number</h3>
                      <p className="text-[10px] text-text/40">House vibration tone and planetary governor</p>
                    </div>
                  </div>
                  {expandedSections.house ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.house && (
                  <div className="p-6">
                    {houseNo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                          <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-primary shadow-sm">
                            <Home className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-text/40 block">House Vibration</span>
                            <strong className="text-lg text-primary">{result.houseAnalysis.value}</strong>
                            <p className="text-[10px] text-text/50">Planet: {result.houseAnalysis.planet}</p>
                          </div>
                        </div>

                        <div className="text-xs flex flex-col gap-2">
                          <p><strong className="text-text/70">Vibe Tone:</strong> {result.houseAnalysis.vibration}</p>
                          <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                            <span>Vibe Alignment:</span>
                            <span className="font-bold text-green-600">{result.houseAnalysis.luckyScore}% Harmony</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-xs text-text/40">
                        Provide a house number / building name to audit vibration.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 10. Compatibility Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('compatibility')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">10</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Compatibility Comparison</h3>
                      <p className="text-[10px] text-text/40">Compare charts across Love, Marriage, Friendship and Business</p>
                    </div>
                  </div>
                  {expandedSections.compatibility ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.compatibility && (
                  <div className="p-6">
                    {compatibility ? (
                      <div className="flex flex-col gap-5">
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[9px] uppercase font-bold text-text/40">Marriage</span>
                            <strong className="block text-lg text-primary">{compatibility.marriagePct}%</strong>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[9px] uppercase font-bold text-text/40">Love</span>
                            <strong className="block text-lg text-primary">{compatibility.lovePct}%</strong>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[9px] uppercase font-bold text-text/40">Friendship</span>
                            <strong className="block text-lg text-primary">{compatibility.friendshipPct}%</strong>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[9px] uppercase font-bold text-text/40">Business</span>
                            <strong className="block text-lg text-primary">{compatibility.businessPct}%</strong>
                          </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-start gap-3">
                          <Heart className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <strong className="text-primary block mb-1">Overall Compatibility: {compatibility.overallPct}%</strong>
                            <p className="text-text/70">{compatibility.explanation}</p>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center p-4 text-xs text-text/40">
                        Provide Partner Name and Date of Birth in the inputs sidebar to perform compatibility matches.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 11. Personal Year Prediction Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('predictions')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">11</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Personal Year Prediction</h3>
                      <p className="text-[10px] text-text/40">Personalized timeline forecast (Year, Month, Day) and sectors</p>
                    </div>
                  </div>
                  {expandedSections.predictions ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.predictions && (
                  <div className="p-6 flex flex-col gap-5">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <span className="text-[9px] uppercase font-bold text-text/40">Personal Year</span>
                        <strong className="block text-lg text-primary">{result.personalYear}</strong>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <span className="text-[9px] uppercase font-bold text-text/40">Personal Month</span>
                        <strong className="block text-lg text-primary">{result.personalMonth}</strong>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <span className="text-[9px] uppercase font-bold text-text/40">Personal Day</span>
                        <strong className="block text-lg text-primary">{result.personalDay}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="font-bold text-primary block mb-1">Career & Finance Forecast</span>
                        <p className="text-text/60">
                          {result.personalYear === 1 || result.personalYear === 8
                            ? 'Highly favorable year for business expansion, promotions, and wealth generation. Hard work is rewarded.'
                            : result.personalYear === 5
                            ? 'Dynamic travel-filled year. High opportunities in new marketing campaigns or switching jobs.'
                            : 'Stable year. Good for building foundational savings; avoid high risk speculations.'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="font-bold text-primary block mb-1">Health & Relationships</span>
                        <p className="text-text/60">
                          {result.personalYear === 2 || result.personalYear === 6
                            ? 'Excellent focus on family bonds, love, and domestic harmony. Minor emotional dependencies need check.'
                            : result.personalYear === 9
                            ? 'A year of endings, cleansing and detachment. Focus on spiritual meditations to prevent anxiety issues.'
                            : 'Focus on regular exercise routines. Maintain structural balance and regular medical checkups.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 12. Lucky Suggestions Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('lucky')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">12</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Lucky Suggestions</h3>
                      <p className="text-[10px] text-text/40">Gemstones, suitable colors, dates, directions, and career domains</p>
                    </div>
                  </div>
                  {expandedSections.lucky ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.lucky && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Lucky Colors:</span>
                        <strong className="text-primary">{result.luckySuggestions.colors.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Suggested Gemstone:</span>
                        <strong className="text-primary">{result.luckySuggestions.gemstones.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Rudraksha Option:</span>
                        <strong className="text-primary">{result.luckySuggestions.rudraksha.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Vastu Directions:</span>
                        <strong className="text-primary">{result.luckySuggestions.directions.join(', ')}</strong>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Lucky Dates:</span>
                        <strong className="text-primary">{result.luckySuggestions.dates.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Lucky Numbers:</span>
                        <strong className="text-primary">{result.luckySuggestions.numbers.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span>Suitable Professions:</span>
                        <strong className="text-primary">{result.luckySuggestions.careers.slice(0, 3).join(', ')}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 13. Remedies Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('remedies')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">13</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">Remedies</h3>
                      <p className="text-[10px] text-text/40">Mantras, lifestyle adjustments, and suitable habits</p>
                    </div>
                  </div>
                  {expandedSections.remedies ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.remedies && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="flex flex-col gap-3">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="font-bold text-primary block mb-1">Chant Mantra Daily</span>
                        <strong className="text-xs font-serif text-text/75">{result.remedies.mantras[0]}</strong>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="font-bold text-primary block mb-1">Suggested Donations</span>
                        <p className="text-text/60">{result.remedies.donations[0]}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="font-bold text-primary block mb-1">Remedial Habits</span>
                        <ul className="list-disc pl-4 text-text/60 space-y-1.5 mt-1">
                          {result.remedies.habits.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="font-bold text-primary block mb-1">Lifestyle Suggestions</span>
                        <ul className="list-disc pl-4 text-text/60 space-y-1.5 mt-1">
                          {result.remedies.lifestyle.slice(0, 2).map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 14. AI Interpretation Card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection('ai')}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs">14</div>
                    <div>
                      <h3 className="font-bold text-sm font-playfair">AI Spiritual Audit Report</h3>
                      <p className="text-[10px] text-text/40">Complete textual explanation and holistic consultation summary</p>
                    </div>
                  </div>
                  {expandedSections.ai ? <ChevronUp className="w-4 h-4 text-text/40" /> : <ChevronDown className="w-4 h-4 text-text/40" />}
                </button>

                {expandedSections.ai && (
                  <div className="p-6">
                    <div className="prose prose-sm max-w-none text-text bg-gray-50/50 border border-gray-100 rounded-2xl p-6 shadow-inner text-xs leading-relaxed whitespace-pre-line">
                      {result.aiReport}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Edit print details modal */}
      {showEditRemediesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-playfair text-lg font-bold text-text flex items-center gap-2">
                <span>🔮 Edit Recommendations & Remedies</span>
              </h3>
              <button
                onClick={() => setShowEditRemediesModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-text/40 hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-text/50">
                Customize the remedies, extra suggested Yantras, and crystals that will be printed in the PDF report. Changes will print instantly and can be saved to this client's profile.
              </p>

              <div>
                <label className="block font-bold text-text/70 mb-1.5 uppercase tracking-wider text-[10px]">
                  Core Remedies & Habits (One per line)
                </label>
                <textarea
                  value={customRemedies}
                  onChange={(e) => setCustomRemedies(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium leading-relaxed text-text"
                  placeholder="e.g. Wear red clothes on Sundays&#10;Feed wheat to birds daily"
                />
              </div>

              <div>
                <label className="block font-bold text-text/70 mb-1.5 uppercase tracking-wider text-[10px]">
                  Extra Suggested Yantras
                </label>
                <textarea
                  value={customYantra}
                  onChange={(e) => setCustomYantra(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-text"
                  placeholder="e.g. Shree Surya Yantra, Shree Yantra"
                />
              </div>

              <div>
                <label className="block font-bold text-text/70 mb-1.5 uppercase tracking-wider text-[10px]">
                  Crystals & Gemstones
                </label>
                <textarea
                  value={customCrystals}
                  onChange={(e) => setCustomCrystals(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-text"
                  placeholder="e.g. Red Coral, Ruby"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setShowEditRemediesModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text/60 rounded-xl font-semibold transition-all"
              >
                Close & Use
              </button>
              <button
                onClick={() => {
                  handleSaveReport();
                  setShowEditRemediesModal(false);
                }}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-xl font-semibold transition-all shadow-md shadow-primary/10"
              >
                Save to Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
