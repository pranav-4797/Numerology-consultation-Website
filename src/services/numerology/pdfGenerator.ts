import { NumerologyReport } from './reportGenerator';
import { toast } from 'sonner';

function loadHtml2Pdf(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }
    if ((window as any).html2pdf) {
      resolve((window as any).html2pdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    script.onload = () => {
      resolve((window as any).html2pdf);
    };
    script.onerror = () => {
      reject(new Error('Failed to load html2pdf library from CDN.'));
    };
    document.head.appendChild(script);
  });
}

export function generateReportHtml(
  result: NumerologyReport,
  loadedReportId: string | undefined,
  customRemedies: string,
  customYantra: string,
  customCrystals: string
): string {
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

  return `
    <style>
      .report-pdf-root {
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        color: #1f2937;
        margin: 0;
        padding: 40px;
        background-color: #fff;
        line-height: 1.6;
        width: 800px;
        box-sizing: border-box;
      }
      .no-print { display: none; }
      .page-break { page-break-before: always; }
      .card { page-break-inside: avoid; }
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
    <div class="report-pdf-root">
      <div class="container">
        <div class="header">
          <div class="logo-area">
            <h1>Divya Urja</h1>
            <p>Energy, Vibrations & Remedies Consultation</p>
            <p>Email: contact@divyaurja.com | Web: www.divyaurja.com</p>
          </div>
          <div class="report-details">
            <h2>Numerology Audit Report</h2>
            <p><strong>Report ID:</strong> ${loadedReportId || 'TEMP-AUDIT'}</p>
            <p><strong>Date Compiled:</strong> ${dateStr}</p>
          </div>
        </div>

        <table class="client-info-table">
          <tr>
            <td class="label">Client Name</td>
            <td><strong>${result.name}</strong></td>
            <td class="label">Date of Birth</td>
            <td><strong>${result.dob}</strong></td>
          </tr>
          <tr>
            <td class="label">Gender</td>
            <td>${result.gender.toUpperCase()}</td>
            <td class="label">Mobile Number</td>
            <td>${result.mobile || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Email Address</td>
            <td>${result.email || 'N/A'}</td>
            <td class="label">Driver & Conductor</td>
            <td>Driver: <strong>${result.driverNum}</strong> | Conductor: <strong>${result.conductorNum}</strong></td>
          </tr>
        </table>

        <h2 class="section-title">1. Core Numbers</h2>
        <div class="core-list">
          <div class="core-item"><span class="lbl">Driver (Birth) Number</span><span class="val">${result.driverNum}</span></div>
          <div class="core-item"><span class="lbl">Conductor (Destiny) Number</span><span class="val">${result.conductorNum}</span></div>
          <div class="core-item"><span class="lbl">Life Path Number</span><span class="val">${result.lifePath}</span></div>
          <div class="core-item"><span class="lbl">Expression (Name) Number</span><span class="val">${result.expression}</span></div>
          <div class="core-item"><span class="lbl">Soul Urge (Heart) Number</span><span class="val">${result.soulUrge}</span></div>
          <div class="core-item"><span class="lbl">Personality Number</span><span class="val">${result.personality}</span></div>
          <div class="core-item"><span class="lbl">Birthday Number</span><span class="val">${result.birthdayNum}</span></div>
          <div class="core-item"><span class="lbl">Maturity Number</span><span class="val">${result.maturityNum}</span></div>
          <div class="core-item"><span class="lbl">Attitude Number</span><span class="val">${result.attitudeNum}</span></div>
          <div class="core-item"><span class="lbl">Balance Number</span><span class="val">${result.balanceNum}</span></div>
        </div>

        <h2 class="section-title">2. Numerology Grids</h2>
        <div class="grid-container">
          <div class="grid-box">
            <h3>Lo Shu Grid</h3>
            <table class="calc-grid">${loShuGridHtml}</table>
          </div>
          <div class="grid-box">
            <h3>Vedic Grid</h3>
            <table class="calc-grid">${vedicGridHtml}</table>
          </div>
        </div>

        <h2 class="section-title">3. Lo Shu Arrows Analysis</h2>
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
    </div>
  `;
}

export async function printReport(
  result: NumerologyReport,
  loadedReportId: string | undefined,
  customRemedies: string,
  customYantra: string,
  customCrystals: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  const toastId = toast.loading('Generating PDF report, please wait...');

  try {
    const html2pdf = await loadHtml2Pdf();
    
    // Create temporary wrapper positioned underneath the application
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.zIndex = '-9999';
    wrapper.style.width = '800px';
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.innerHTML = generateReportHtml(
      result,
      loadedReportId,
      customRemedies,
      customYantra,
      customCrystals
    );
    document.body.appendChild(wrapper);

    // Options for html2pdf
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Numerology_Audit_${result.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css'] }
    };

    // Generate and save
    await html2pdf().from(wrapper).set(opt).save();

    // Clean up
    document.body.removeChild(wrapper);
    toast.success('PDF report downloaded successfully!', { id: toastId });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    toast.error('Failed to generate PDF report. Please try again.', { id: toastId });
  }
}
