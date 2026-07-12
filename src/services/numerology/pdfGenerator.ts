import { NumerologyReport } from './reportGenerator';

export function printReport(
  result: NumerologyReport,
  loadedReportId: string | undefined,
  customRemedies: string,
  customYantra: string,
  customCrystals: string
): void {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups for printing.');
    return;
  }

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

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 13px;">
            <p style="color: #0F766E; margin: 0 0 6px 0; font-size: 14px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">🪐 Planetary Compatibility (Moolank & Bhagyank)</p>
            <p style="margin: 4px 0;"><strong>Moolank (Personality Number):</strong> ${result.compatibilityAnalysis.driverNum} | <strong>Bhagyank (Destiny Number):</strong> ${result.compatibilityAnalysis.conductorNum}</p>
            <p style="margin: 4px 0;"><strong>Vibrational Relationship:</strong> <span style="color: ${result.compatibilityAnalysis.status === 'Friendly' ? '#10b981' : result.compatibilityAnalysis.status === 'Enemy' ? '#ef4444' : '#b45309'}; font-weight: bold;">${result.compatibilityAnalysis.status}</span></p>
            <p style="margin: 6px 0 0 0; color: #555; font-style: italic;">${result.compatibilityAnalysis.description}</p>
            <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 11px; text-align: center;">
              <div style="background: #ecfdf5; padding: 6px; border-radius: 4px; border: 1px solid #d1fae5;"><strong>Friends:</strong> ${result.compatibilityAnalysis.friendlyList.join(', ') || 'None'}</div>
              <div style="background: #fef2f2; padding: 6px; border-radius: 4px; border: 1px solid #fee2e2;"><strong>Enemies:</strong> ${result.compatibilityAnalysis.enemyList.join(', ') || 'Nil'}</div>
              <div style="background: #fffbeb; padding: 6px; border-radius: 4px; border: 1px solid #fef3c7;"><strong>Neutrals:</strong> ${result.compatibilityAnalysis.neutralList.slice(0, 4).join(', ')}${result.compatibilityAnalysis.neutralList.length > 4 ? '...' : ''}</div>
            </div>
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
}
