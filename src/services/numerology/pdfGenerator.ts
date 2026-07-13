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
        <div class="planet-header">${p.name} — Strength ${p.strengthPct}%</div>
        <table class="planet-table">
          <tr><td class="pt-label">Influence</td><td>${p.details.influence}</td></tr>
          <tr><td class="pt-label">Remedies</td><td>${p.details.remedies}</td></tr>
          <tr><td class="pt-label">Lucky Day</td><td>${p.details.day}</td></tr>
          <tr><td class="pt-label">Lucky Color</td><td>${p.details.color}</td></tr>
        </table>
      </div>
    `)
    .join('');

  const arrowsHtml = result.loShuArrows
    .map(a => {
      const cls = a.type === 'strength' ? 'arrow-strength' : a.type === 'weakness' ? 'arrow-weakness' : 'arrow-neutral';
      const badge = a.type === 'strength' ? '<span class="badge badge-green">Strength</span>' : a.type === 'weakness' ? '<span class="badge badge-red">Missing</span>' : '<span class="badge badge-gray">Inactive</span>';
      return `
        <tr class="${cls}">
          <td class="arrow-name">${a.name} <span class="arrow-nums">(${a.numbers.join('-')})</span></td>
          <td class="arrow-meaning">${a.meaning}</td>
          <td class="arrow-badge">${badge}</td>
        </tr>
      `;
    })
    .join('');

  // Convert markdown-style AI report to basic HTML
  const formatAiReport = (text: string): string => {
    return text
      .replace(/####\s*(.+)/g, '<h4 class="ai-h4">$1</h4>')
      .replace(/###\s*(.+)/g, '<h3 class="ai-h3">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  const aiReportHtml = formatAiReport(result.aiReport || '');

  // Generate dynamic Grid Readings text
  const strengthArrows = result.loShuArrows.filter(a => a.type === 'strength').map(a => a.name);
  const weakArrows = result.loShuArrows.filter(a => a.type === 'weakness').map(a => a.name);
  const missingStr = result.missingNumbers.length > 0 ? result.missingNumbers.join(', ') : 'none';

  const strengthsText = strengthArrows.length > 0
    ? `Possesses strong grid lines: ${strengthArrows.join(', ')}. These indicate active execution of goals, structural planning, and determination.`
    : 'No complete arrow lines detected. Focus on strengthening energy through remedies and lifestyle adjustments.';

  const weaknessText = result.missingNumbers.length > 0
    ? `Missing numbers ${missingStr} indicate potential gaps in practical focus, emotional grounding, or organizational foresight.${weakArrows.length > 0 ? ' Weak arrows: ' + weakArrows.join(', ') + '.' : ''}`
    : 'No missing numbers detected. The grid shows a balanced energy profile.';

  const directionText = result.luckySuggestions.directions.join(' or ');
  const colorsText = result.luckySuggestions.colors.join(', ');
  const careersText = result.luckySuggestions.careers.join(', ');

  return `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      .pdf-root {
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #1f2937;
        padding: 28px 32px;
        background: #fff;
        line-height: 1.55;
        width: 700px;
        font-size: 11px;
      }

      /* ── Header ── */
      .pdf-header {
        border-bottom: 3px solid #0F766E;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      .pdf-header table { width: 100%; border-collapse: collapse; }
      .pdf-header td { vertical-align: top; padding: 0; border: none; }
      .brand-name {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 26px;
        font-weight: bold;
        color: #0F766E;
        margin: 0 0 2px 0;
      }
      .brand-tagline { font-size: 10px; color: #666; margin: 1px 0; }
      .report-title {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 16px;
        font-weight: bold;
        color: #111;
        text-align: right;
        margin: 0 0 6px 0;
      }
      .report-meta { text-align: right; font-size: 10px; color: #555; margin: 2px 0; }

      /* ── Client Info ── */
      .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 22px;
        font-size: 11px;
      }
      .info-table td {
        padding: 7px 10px;
        border: 1px solid #d1d5db;
        vertical-align: top;
      }
      .info-table .il {
        font-weight: 600;
        color: #0F766E;
        background: #f0fdfa;
        width: 130px;
        white-space: nowrap;
      }
      .info-table .iv { color: #111; }

      /* ── Section Titles ── */
      .sec-title {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 15px;
        font-weight: bold;
        color: #0F766E;
        border-bottom: 2px solid #d1d5db;
        padding-bottom: 5px;
        margin: 26px 0 14px 0;
      }

      /* ── Core Numbers Table ── */
      .core-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 6px;
        font-size: 11px;
      }
      .core-table td {
        padding: 6px 10px;
        border-bottom: 1px solid #e5e7eb;
      }
      .core-table .cl { color: #374151; font-weight: 500; width: 45%; }
      .core-table .cv {
        color: #0F766E;
        font-weight: 700;
        font-size: 13px;
        width: 5%;
        text-align: center;
      }

      /* ── Grids ── */
      .grids-row { margin-bottom: 20px; }
      .grids-row table.outer { width: 100%; border-collapse: collapse; }
      .grids-row td.grid-wrap {
        width: 50%;
        vertical-align: top;
        padding: 0 8px;
        text-align: center;
      }
      .grid-label {
        font-weight: 600;
        color: #0F766E;
        font-size: 12px;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid #e5e7eb;
      }
      .calc-grid { margin: 0 auto; border-collapse: collapse; }
      .grid-cell {
        width: 52px;
        height: 42px;
        border: 2px solid #0F766E;
        text-align: center;
        font-weight: 700;
        font-size: 15px;
        color: #111;
        background: #fff;
      }

      /* ── Arrows Table ── */
      .arrows-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 11px;
      }
      .arrows-table th {
        background: #f0fdfa;
        color: #0F766E;
        font-weight: 600;
        padding: 6px 8px;
        text-align: left;
        border-bottom: 2px solid #0F766E;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .arrows-table td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
      .arrow-name { font-weight: 600; color: #111; white-space: nowrap; }
      .arrow-nums { font-weight: 400; color: #888; font-size: 10px; }
      .arrow-meaning { color: #555; font-style: italic; }
      .arrow-badge { text-align: center; }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .badge-green { background: #dcfce7; color: #166534; }
      .badge-red { background: #fee2e2; color: #991b1b; }
      .badge-gray { background: #f3f4f6; color: #6b7280; }
      .arrow-strength td { background: #f0fdf4; }
      .arrow-weakness td { background: #fef2f2; }

      /* ── Planet Cards ── */
      .planet-card {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        margin-bottom: 12px;
        page-break-inside: avoid;
        overflow: hidden;
      }
      .planet-header {
        background: #f0fdfa;
        padding: 7px 10px;
        font-weight: 700;
        font-size: 12px;
        color: #0F766E;
        border-bottom: 1px solid #e5e7eb;
      }
      .planet-table { width: 100%; border-collapse: collapse; font-size: 10px; }
      .planet-table td { padding: 4px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; }
      .planet-table .pt-label { font-weight: 600; color: #555; width: 90px; }

      /* ── Remedy Boxes ── */
      .remedy-box {
        padding: 12px 14px;
        border-radius: 6px;
        margin-bottom: 12px;
        font-size: 11px;
        page-break-inside: avoid;
      }
      .remedy-box-title {
        font-weight: 700;
        font-size: 12px;
        margin: 0 0 6px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(0,0,0,0.08);
      }
      .remedy-content { white-space: pre-line; line-height: 1.6; }
      .rb-teal { background: #f0fdfa; border: 1px solid #99f6e4; }
      .rb-teal .remedy-box-title { color: #0F766E; }
      .rb-amber { background: #fffbeb; border: 1px solid #fde68a; }
      .rb-amber .remedy-box-title { color: #b45309; }
      .rb-blue { background: #eff6ff; border: 1px solid #bfdbfe; }
      .rb-blue .remedy-box-title { color: #1d4ed8; }

      /* ── Readings Row ── */
      .readings-row { margin-bottom: 20px; }
      .readings-row table.outer { width: 100%; border-collapse: collapse; }
      .readings-row td.readings-col {
        width: 50%;
        vertical-align: top;
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        background: #fafaf9;
      }
      .readings-row td.readings-col:first-child { border-right: none; }
      .readings-col-title {
        font-size: 10px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #e5e7eb;
      }
      .reading-block { margin-bottom: 8px; }
      .reading-label {
        font-size: 9px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
      }
      .reading-text {
        font-size: 10px;
        color: #374151;
        line-height: 1.5;
      }

      /* ── AI Report ── */
      .ai-report {
        font-size: 11px;
        color: #374151;
        line-height: 1.65;
        margin-top: 6px;
      }
      .ai-h3 {
        font-size: 13px;
        font-weight: 700;
        color: #0F766E;
        margin: 16px 0 6px 0;
        padding-bottom: 4px;
        border-bottom: 1px solid #e5e7eb;
      }
      .ai-h4 {
        font-size: 12px;
        font-weight: 700;
        color: #374151;
        margin: 10px 0 4px 0;
      }

      /* ── Footer ── */
      .pdf-footer {
        margin-top: 40px;
        text-align: center;
        font-size: 9px;
        color: #9ca3af;
        border-top: 1px dashed #d1d5db;
        padding-top: 14px;
      }
      .pdf-footer p { margin: 2px 0; }

      /* ── Utility ── */
      .page-break { page-break-before: always; }
      p { margin: 0 0 6px 0; font-size: 11px; }
    </style>

    <div class="pdf-root">

      <!-- Header -->
      <div class="pdf-header">
        <table><tr>
          <td style="width:55%;">
            <div class="brand-name">Divya Urja</div>
            <div class="brand-tagline">Energy, Vibrations & Remedies Consultation</div>
            <div class="brand-tagline">contact@divyaurja.com | www.divyaurja.com</div>
          </td>
          <td style="width:45%;">
            <div class="report-title">Numerology Audit Report</div>
            <div class="report-meta"><strong>Report ID:</strong> ${loadedReportId || 'TEMP-AUDIT'}</div>
            <div class="report-meta"><strong>Date:</strong> ${dateStr}</div>
          </td>
        </tr></table>
      </div>

      <!-- Client Info -->
      <table class="info-table">
        <tr>
          <td class="il">Client Name</td>
          <td class="iv"><strong>${result.name}</strong></td>
          <td class="il">Date of Birth</td>
          <td class="iv"><strong>${result.dob}</strong></td>
        </tr>
        <tr>
          <td class="il">Gender</td>
          <td class="iv">${result.gender.toUpperCase()}</td>
          <td class="il">Mobile</td>
          <td class="iv">${result.mobile || 'N/A'}</td>
        </tr>
        <tr>
          <td class="il">Email</td>
          <td class="iv" colspan="3">${result.email || 'N/A'}</td>
        </tr>
        <tr>
          <td class="il">Driver Number</td>
          <td class="iv"><strong>${result.driverNum}</strong></td>
          <td class="il">Conductor Number</td>
          <td class="iv"><strong>${result.conductorNum}</strong></td>
        </tr>
      </table>

      <!-- 1. Core Numbers -->
      <h2 class="sec-title">1. Core Numbers</h2>
      <table class="core-table">
        <tr><td class="cl">Driver (Birth) Number</td><td class="cv">${result.driverNum}</td><td class="cl">Conductor (Destiny) Number</td><td class="cv">${result.conductorNum}</td></tr>
        <tr><td class="cl">Life Path Number</td><td class="cv">${result.lifePath}</td><td class="cl">Expression (Name) Number</td><td class="cv">${result.expression}</td></tr>
        <tr><td class="cl">Soul Urge (Heart) Number</td><td class="cv">${result.soulUrge}</td><td class="cl">Personality Number</td><td class="cv">${result.personality}</td></tr>
        <tr><td class="cl">Birthday Number</td><td class="cv">${result.birthdayNum}</td><td class="cl">Maturity Number</td><td class="cv">${result.maturityNum}</td></tr>
        <tr><td class="cl">Attitude Number</td><td class="cv">${result.attitudeNum}</td><td class="cl">Balance Number</td><td class="cv">${result.balanceNum}</td></tr>
      </table>

      <!-- 2. Grids -->
      <h2 class="sec-title">2. Numerology Grids</h2>
      <div class="grids-row">
        <table class="outer"><tr>
          <td class="grid-wrap">
            <div class="grid-label">Lo Shu Grid</div>
            <table class="calc-grid">${loShuGridHtml}</table>
          </td>
          <td class="grid-wrap">
            <div class="grid-label">Vedic Grid</div>
            <table class="calc-grid">${vedicGridHtml}</table>
          </td>
        </tr></table>
      </div>

      <!-- 3. Arrows -->
      <h2 class="sec-title">3. Lo Shu Arrows Analysis</h2>
      <table class="arrows-table">
        <thead><tr><th>Arrow</th><th>Meaning</th><th>Status</th></tr></thead>
        <tbody>${arrowsHtml}</tbody>
      </table>

      <!-- 4. Grid Readings & Life Path Guidance -->
      <h2 class="sec-title">4. Grid Readings & Life Path Guidance</h2>
      <div class="readings-row">
        <table class="outer"><tr>
          <td class="readings-col">
            <div class="readings-col-title">Grid Readings</div>
            <div class="reading-block">
              <div class="reading-label">Strengths</div>
              <div class="reading-text">${strengthsText}</div>
            </div>
            <div class="reading-block">
              <div class="reading-label">Weaknesses</div>
              <div class="reading-text">${weaknessText}</div>
            </div>
            <div class="reading-block">
              <div class="reading-label">Lucky Direction & Colors</div>
              <div class="reading-text"><strong>Direction:</strong> ${directionText} | <strong>Colors:</strong> ${colorsText}</div>
            </div>
          </td>
          <td class="readings-col">
            <div class="readings-col-title">Life Path Guidance</div>
            <div class="reading-block">
              <div class="reading-label">Career Suggestions</div>
              <div class="reading-text">Well suited for: ${careersText}. Excellent organizational skills support administration or freelance paths.</div>
            </div>
            <div class="reading-block">
              <div class="reading-label">Health Analysis</div>
              <div class="reading-text">Pay attention to general energy levels. Refrain from over-exhaustion, practice morning meditation daily to balance internal pranic forces.</div>
            </div>
            <div class="reading-block">
              <div class="reading-label">Relationship Insights</div>
              <div class="reading-text">Vibrates to number ${result.conductorNum} Conductor, indicating high emotional capacity. Respect the opinions of your close ones and avoid rigid arguments.</div>
            </div>
          </td>
        </tr></table>
      </div>

      <!-- 5. Planets -->
      <h2 class="sec-title">5. Planet Analysis</h2>
      ${planetsHtml}

      <div class="page-break"></div>

      <!-- 6. Remedies -->
      <h2 class="sec-title">6. Remedies & Suggestions</h2>
      <table class="core-table" style="margin-bottom:14px;">
        <tr><td class="cl">Suitable Colors</td><td colspan="3" style="padding:6px 10px;">${result.remedies.colors.join(', ')}</td></tr>
        <tr><td class="cl">Suitable Days</td><td colspan="3" style="padding:6px 10px;">${result.remedies.days.join(', ')}</td></tr>
        <tr><td class="cl">Chant Mantra Daily</td><td colspan="3" style="padding:6px 10px;">${result.remedies.mantras.join(' or ')}</td></tr>
        <tr><td class="cl">Suggested Donations</td><td colspan="3" style="padding:6px 10px;">${result.remedies.donations.join(', ')}</td></tr>
      </table>

      <div class="remedy-box rb-teal">
        <div class="remedy-box-title">🔮 Core Remedies & Daily Habits</div>
        <div class="remedy-content">${customRemedies}</div>
      </div>
      <div class="remedy-box rb-amber">
        <div class="remedy-box-title">🔱 Suggested Yantras</div>
        <div class="remedy-content">${customYantra}</div>
      </div>
      <div class="remedy-box rb-blue">
        <div class="remedy-box-title">💎 Crystals & Gemstones</div>
        <div class="remedy-content">${customCrystals}</div>
      </div>

      <!-- 7. AI Report -->
      <h2 class="sec-title">7. Spiritual Interpretation</h2>
      <div class="ai-report">${aiReportHtml}</div>

      <!-- Footer -->
      <div class="pdf-footer">
        <p><strong>Thank you for consulting Divya Urja!</strong></p>
        <p>This is a computer-generated numerology audit report compiled by Divya Urja Admin.</p>
        <p>© ${new Date().getFullYear()} Divya Urja — Energy, Vibrations & Remedies</p>
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
    
    const htmlContent = generateReportHtml(
      result,
      loadedReportId,
      customRemedies,
      customYantra,
      customCrystals
    );

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

    // Generate and save directly from the HTML string
    await html2pdf().from(htmlContent).set(opt).save();

    toast.success('PDF report downloaded successfully!', { id: toastId });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    toast.error('Failed to generate PDF report. Please try again.', { id: toastId });
  }
}
