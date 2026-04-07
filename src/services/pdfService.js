/**
 * Professional PDF Export Service
 * White/light background — print-ready, Indian business standard
 * Fixes: ₹ symbol (uses "Rs." in PDF since helvetica lacks ₹ glyph),
 *        itemized feature table, payment section, proper hierarchy
 */
import jsPDF from 'jspdf';

// ─── Color palette (light theme for print) ────────────────────────────────────
const C = {
  // Backgrounds
  white:      [255, 255, 255],
  pageBg:     [250, 250, 252],   // very light grey page
  headerBg:   [26,  26,  46 ],   // deep navy header
  sectionBg:  [245, 245, 250],   // light section fill
  tableBg:    [248, 248, 252],   // alternating row
  totalBg:    [26,  26,  46 ],   // dark total row

  // Text
  textDark:   [15,  15,  30 ],   // near-black
  textMid:    [80,  80, 100 ],   // secondary
  textLight:  [140, 140, 160],   // muted
  textWhite:  [255, 255, 255],

  // Accents
  purple:     [108,  99, 255],
  orange:     [245, 158,  11],
  green:      [ 16, 185, 129],
  red:        [239,  68,  68],
  cyan:       [  0, 212, 255],
  border:     [220, 220, 235],   // light border
  borderDark: [180, 180, 200],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const W = 210, H = 297, M = 14; // A4, margin 14mm

/** jsPDF helvetica can't render ₹ — use Rs. for PDF output */
const rs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;

function hline(doc, x1, y, x2, color = C.border, thickness = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(thickness);
  doc.line(x1, y, x2, y);
}

function sectionLabel(doc, text, y) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textLight);
  doc.text(text.toUpperCase(), M, y);
  return y + 5;
}

function pill(doc, text, x, y, bgColor, textColor) {
  const tw = doc.getTextWidth(text);
  const pw = tw + 6, ph = 5;
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y - 3.5, pw, ph, 1.5, 1.5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(text, x + 3, y);
}

// ─── SHARED HEADER ────────────────────────────────────────────────────────────
function drawHeader(doc, docType, docNumber, date, validOrDue) {
  // Navy header band
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, W, 38, 'F');

  // Accent stripe
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, W, 2, 'F');

  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...C.purple);
  doc.text('RP.', M, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 210);
  doc.text('Rajat Poddar  —  Developer & Entrepreneur', M, 22);
  doc.text('solutionspoddar@gmail.com   |   +91 7250580175   |   rajatpoddar.in', M, 28);

  // Doc type + number (right)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 190);
  doc.text(docType, W - M, 13, { align: 'right' });

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textWhite);
  doc.text(docNumber, W - M, 22, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 190);
  doc.text(`Date: ${date}`, W - M, 29, { align: 'right' });
  if (validOrDue) doc.text(validOrDue, W - M, 34, { align: 'right' });

  return 44; // y after header
}

// ─── CLIENT + META BLOCK ──────────────────────────────────────────────────────
function drawClientBlock(doc, y, leftLabel, leftLines, rightLabel, rightLines) {
  const colW = (W - M * 2 - 5) / 2;

  // Left card
  doc.setFillColor(...C.sectionBg);
  doc.roundedRect(M, y, colW, 26, 2, 2, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textLight);
  doc.text(leftLabel, M + 4, y + 6);
  leftLines.forEach((line, i) => {
    if (!line) return;
    doc.setFontSize(i === 0 ? 9.5 : 7.5);
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
    const lc = i === 0 ? C.textDark : C.textMid;
    doc.setTextColor(...lc);
    doc.text(String(line), M + 4, y + 13 + i * 6);
  });

  // Right card
  const rx = M + colW + 5;
  doc.setFillColor(...C.sectionBg);
  doc.roundedRect(rx, y, colW, 26, 2, 2, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textLight);
  doc.text(rightLabel, rx + 4, y + 6);
  rightLines.forEach((line, i) => {
    if (!line) return;
    doc.setFontSize(i === 0 ? 9.5 : 7.5);
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
    const rc = i === 0 ? C.textDark : C.textMid;
    doc.setTextColor(...rc);
    doc.text(String(line), rx + 4, y + 13 + i * 6);
  });

  return y + 32;
}

// ─── QUOTATION PDF ────────────────────────────────────────────────────────────
export function exportQuotationPDF(quote, client, maintenancePlans, featurePrices = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // White background
  doc.setFillColor(...C.white);
  doc.rect(0, 0, W, H, 'F');

  const date = new Date(quote.created_at || Date.now())
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const validUntil = new Date(
    (quote.created_at ? new Date(quote.created_at) : new Date()).getTime() + 15 * 86400000
  ).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  let y = drawHeader(doc, 'QUOTATION', `#${quote.quote_number}`, date, `Valid until: ${validUntil}`);

  // ── Client + Project ──────────────────────────────────────────────────────
  y = drawClientBlock(
    doc, y,
    'PREPARED FOR',
    [client?.name || quote.client_name || '—', client?.business || '', client?.email || ''],
    'PROJECT TYPE',
    [quote.project_type || '—', `${(quote.features || []).length} features included`, '']
  );

  // ── Features Table ────────────────────────────────────────────────────────
  const features = quote.features || [];
  if (features.length > 0) {
    y = sectionLabel(doc, 'Scope of Work — Included Features', y);

    // Table header
    doc.setFillColor(...C.headerBg);
    doc.roundedRect(M, y, W - M * 2, 7, 1.5, 1.5, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.textWhite);
    doc.text('#', M + 3, y + 4.5);
    doc.text('Feature / Deliverable', M + 10, y + 4.5);
    doc.text('Price', W - M - 3, y + 4.5, { align: 'right' });
    y += 7;

    // Feature rows
    features.forEach((f, i) => {
      const price = featurePrices[f] ?? 0;
      const isAlt = i % 2 === 1;
      if (isAlt) {
        doc.setFillColor(...C.tableBg);
        doc.rect(M, y, W - M * 2, 6.5, 'F');
      }
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.textMid);
      doc.text(String(i + 1), M + 3, y + 4.5);
      doc.setTextColor(...C.textDark);
      doc.text(f, M + 10, y + 4.5);
      doc.setTextColor(...C.textMid);
      doc.text(price > 0 ? rs(price) : 'Included', W - M - 3, y + 4.5, { align: 'right' });
      y += 6.5;
    });

    // Bottom border
    hline(doc, M, y, W - M, C.borderDark);
    y += 5;
  }

  // ── Pricing Summary ───────────────────────────────────────────────────────
  y = sectionLabel(doc, 'Pricing Summary', y);

  const total = quote.total_amount || 0;
  const base = quote.base_amount || 0;
  const featTotal = quote.features_amount || 0;

  const summaryRows = [
    [`Base Project (${quote.project_type})`, base > 0 ? rs(base) : 'Included'],
    [`Features (${features.length} items)`, featTotal > 0 ? rs(featTotal) : 'Included'],
  ];

  if (quote.maintenance && maintenancePlans?.[quote.maintenance]) {
    const mp = maintenancePlans[quote.maintenance];
    summaryRows.push([`Monthly Maintenance — ${mp.label}`, `${rs(mp.price)}/mo`]);
  }

  summaryRows.forEach(([label, val], i) => {
    const isAlt = i % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...C.tableBg);
      doc.rect(M, y, W - M * 2, 6.5, 'F');
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textMid);
    doc.text(label, M + 4, y + 4.5);
    doc.text(val, W - M - 4, y + 4.5, { align: 'right' });
    y += 6.5;
  });

  // Total row — highlighted
  doc.setFillColor(...C.headerBg);
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textWhite);
  doc.text('Total Project Investment', M + 4, y + 6.5);
  doc.setFontSize(11);
  doc.setTextColor(180, 160, 255);
  doc.text(rs(total), W - M - 4, y + 6.5, { align: 'right' });
  y += 16;

  // ── Payment Terms ─────────────────────────────────────────────────────────
  y = sectionLabel(doc, 'Payment Terms', y);
  doc.setFillColor(...C.sectionBg);
  doc.roundedRect(M, y, W - M * 2, 22, 2, 2, 'F');

  const terms = [
    ['Advance (to start work)', '50%', rs(total * 0.5)],
    ['On Delivery / Completion', '50%', rs(total * 0.5)],
  ];
  terms.forEach(([label, pct, amt], i) => {
    const tx = M + 4, ty = y + 7 + i * 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textDark);
    doc.text(label, tx, ty);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.purple);
    doc.text(pct, tx + 80, ty);
    doc.setTextColor(...C.textMid);
    doc.text(amt, W - M - 4, ty, { align: 'right' });
  });
  y += 28;

  // ── Timeline ──────────────────────────────────────────────────────────────
  y = sectionLabel(doc, 'Estimated Timeline', y);
  doc.setFillColor(...C.sectionBg);
  doc.roundedRect(M, y, W - M * 2, 14, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.textDark);
  doc.text('Project kickoff within 2 business days of advance payment.', M + 4, y + 6);
  doc.text('Estimated delivery: 3–6 weeks depending on scope and revisions.', M + 4, y + 11);
  y += 20;

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (quote.notes) {
    y = sectionLabel(doc, 'Notes & Special Requirements', y);
    doc.setFillColor(...C.sectionBg);
    const noteLines = doc.splitTextToSize(quote.notes, W - M * 2 - 8);
    const noteH = noteLines.length * 5 + 8;
    doc.roundedRect(M, y, W - M * 2, noteH, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textMid);
    doc.text(noteLines, M + 4, y + 6);
    y += noteH + 6;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  hline(doc, M, H - 18, W - M, C.border);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.textLight);
  doc.text(
    'This quotation is valid for 15 days from the date of issue. Prices are subject to change after expiry.',
    W / 2, H - 13, { align: 'center' }
  );
  doc.text(
    'To accept this quotation, reply via WhatsApp or email with "I accept quotation #' + quote.quote_number + '"',
    W / 2, H - 8, { align: 'center' }
  );

  doc.save(`Quotation-${quote.quote_number}.pdf`);
}

// ─── INVOICE PDF ──────────────────────────────────────────────────────────────
export function exportInvoicePDF(invoice, client) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // White background
  doc.setFillColor(...C.white);
  doc.rect(0, 0, W, H, 'F');

  const statusMeta = {
    paid:    { label: 'PAID',    color: C.green  },
    pending: { label: 'PENDING', color: C.orange },
    overdue: { label: 'OVERDUE', color: C.red    },
    sent:    { label: 'SENT',    color: C.cyan   },
    draft:   { label: 'DRAFT',   color: [150, 150, 170] },
  };
  const sm = statusMeta[invoice.status] || statusMeta.draft;

  const date = new Date(invoice.created_at || Date.now())
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const dueStr = invoice.due_date
    ? `Due: ${new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`
    : null;

  let y = drawHeader(doc, 'INVOICE', invoice.invoice_number, date, dueStr);

  // ── Status badge ──────────────────────────────────────────────────────────
  pill(doc, sm.label, W - M - doc.getTextWidth(sm.label) - 9, y - 2, sm.color, C.textWhite);
  y += 2;

  // ── Client + Project ──────────────────────────────────────────────────────
  y = drawClientBlock(
    doc, y,
    'BILLED TO',
    [client?.name || '—', client?.business || '', client?.email || ''],
    'PROJECT DETAILS',
    [invoice.project_name || '—', `Invoice: ${invoice.invoice_number}`, '']
  );

  // ── Items Table ───────────────────────────────────────────────────────────
  y = sectionLabel(doc, 'Invoice Items', y);

  // Table header
  doc.setFillColor(...C.headerBg);
  doc.roundedRect(M, y, W - M * 2, 7, 1.5, 1.5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textWhite);
  doc.text('#', M + 3, y + 4.5);
  doc.text('Description', M + 10, y + 4.5);
  doc.text('Qty', W - M - 40, y + 4.5, { align: 'right' });
  doc.text('Rate', W - M - 22, y + 4.5, { align: 'right' });
  doc.text('Amount', W - M - 3, y + 4.5, { align: 'right' });
  y += 7;

  // Single line item (project)
  doc.setFillColor(...C.tableBg);
  doc.rect(M, y, W - M * 2, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.textMid);
  doc.text('1', M + 3, y + 4.8);
  doc.setTextColor(...C.textDark);
  doc.text(invoice.project_name || 'Project Development', M + 10, y + 4.8);
  doc.setTextColor(...C.textMid);
  doc.text('1', W - M - 40, y + 4.8, { align: 'right' });
  doc.text(rs(invoice.total_amount), W - M - 22, y + 4.8, { align: 'right' });
  doc.text(rs(invoice.total_amount), W - M - 3, y + 4.8, { align: 'right' });
  y += 7;

  hline(doc, M, y, W - M, C.borderDark);
  y += 5;

  // ── Amount Breakdown ──────────────────────────────────────────────────────
  const hasDiscount = (invoice.discount_amount || 0) > 0;
  const afterDiscount = (invoice.total_amount || 0) - (invoice.discount_amount || 0);
  const dueAmount = invoice.due_amount || 0;

  // Right-aligned summary block
  const bx = W / 2 + 5;
  const bw = W - M - bx;

  const summaryRows = [
    ['Subtotal', rs(invoice.total_amount)],
  ];
  if (hasDiscount) {
    const discLabel = invoice.discount_type === 'percent'
      ? `Discount (${invoice.discount_value}%)`
      : 'Discount';
    summaryRows.push([discLabel, `- ${rs(invoice.discount_amount)}`]);
    summaryRows.push(['After Discount', rs(afterDiscount)]);
  }
  summaryRows.push(['Amount Paid', rs(invoice.paid_amount || 0)]);

  summaryRows.forEach(([label, val]) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textMid);
    doc.text(label, bx, y);
    doc.setTextColor(...C.textDark);
    doc.text(val, W - M - 3, y, { align: 'right' });
    y += 6;
  });

  hline(doc, bx, y, W - M, C.borderDark, 0.5);
  y += 4;

  // Amount Due — BIG highlight
  const dueColor = dueAmount > 0 ? C.orange : C.green;
  doc.setFillColor(...dueColor);
  doc.roundedRect(bx - 2, y - 1, W - M - bx + 4, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textWhite);
  doc.text('AMOUNT DUE', bx + 2, y + 6);
  doc.setFontSize(11);
  doc.text(rs(dueAmount), W - M - 3, y + 6, { align: 'right' });
  y += 16;

  // ── Payment Section ───────────────────────────────────────────────────────
  if (dueAmount > 0) {
    y = sectionLabel(doc, 'Payment Options', y);

    doc.setFillColor(...C.sectionBg);
    doc.roundedRect(M, y, W - M * 2, 36, 2, 2, 'F');

    // UPI
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.purple);
    doc.text('UPI Payment (Instant)', M + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textDark);
    doc.text('UPI ID:', M + 4, y + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.textDark);
    doc.text('solutionspoddar@upi', M + 20, y + 13);

    // WhatsApp
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 211, 102);
    doc.text('WhatsApp after payment:', M + 4, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textMid);
    doc.text('+91 7250580175', M + 55, y + 20);

    // Bank
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.textMid);
    doc.text('Bank Transfer:', M + 4, y + 27);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textMid);
    doc.text('Account Name: Rajat Poddar  |  Add your bank details in Settings', M + 35, y + 27);

    // Reference note
    doc.setFontSize(7);
    doc.setTextColor(...C.textLight);
    doc.text(`Please mention invoice number ${invoice.invoice_number} in payment reference.`, M + 4, y + 33);

    y += 42;
  }

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    y = sectionLabel(doc, 'Notes', y);
    doc.setFillColor(...C.sectionBg);
    const noteLines = doc.splitTextToSize(invoice.notes, W - M * 2 - 8);
    const noteH = noteLines.length * 5 + 8;
    doc.roundedRect(M, y, W - M * 2, noteH, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textMid);
    doc.text(noteLines, M + 4, y + 6);
    y += noteH + 6;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  hline(doc, M, H - 18, W - M, C.border);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textMid);
  doc.text('Thank you for your business!', W / 2, H - 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.textLight);
  doc.text(
    'For any queries, contact: solutionspoddar@gmail.com  |  +91 7250580175',
    W / 2, H - 8, { align: 'center' }
  );

  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
}
