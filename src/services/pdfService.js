import jsPDF from 'jspdf';

const PURPLE = [108, 99, 255];
const CYAN   = [0, 212, 255];
const DARK   = [10, 10, 18];
const SURFACE = [18, 18, 28];
const BORDER = [40, 40, 60];
const WHITE  = [232, 232, 240];
const MUTED  = [100, 100, 128];

function hex(r, g, b) { return [r, g, b]; }

// Draw a rounded rect (jsPDF doesn't have native roundedRect in all versions)
function roundRect(doc, x, y, w, h, r = 4) {
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

/**
 * Export a quotation as a professional PDF
 */
export function exportQuotationPDF(quote, client, maintenancePlans) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const margin = 16;
  let y = 0;

  // ── Background ──────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, H, 'F');

  // ── Header gradient band ─────────────────────────────────────────────────────
  doc.setFillColor(20, 18, 40);
  doc.rect(0, 0, W, 42, 'F');

  // Purple accent line at top
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, W, 1.5, 'F');

  // Logo / Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...PURPLE);
  doc.text('RP.', margin, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Rajat Poddar — Developer & Entrepreneur', margin, 22);
  doc.text('solutionspoddar@gmail.com  ·  +91 7250580175', margin, 27);

  // Quotation label (right)
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('QUOTATION', W - margin, 14, { align: 'right' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(`#${quote.quote_number}`, W - margin, 22, { align: 'right' });

  const date = new Date(quote.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const validUntil = new Date((quote.created_at ? new Date(quote.created_at) : new Date()).getTime() + 15 * 86400000)
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(`Date: ${date}`, W - margin, 28, { align: 'right' });
  doc.text(`Valid until: ${validUntil}`, W - margin, 33, { align: 'right' });

  y = 50;

  // ── Client + Project info ────────────────────────────────────────────────────
  doc.setFillColor(...SURFACE);
  roundRect(doc, margin, y, (W - margin * 2 - 6) / 2, 28, 3);
  roundRect(doc, margin + (W - margin * 2 - 6) / 2 + 6, y, (W - margin * 2 - 6) / 2, 28, 3);

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text('PREPARED FOR', margin + 4, y + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(client?.name || quote.client_name || '—', margin + 4, y + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(client?.business || '—', margin + 4, y + 20);
  if (client?.email) doc.text(client.email, margin + 4, y + 25);

  const rx = margin + (W - margin * 2 - 6) / 2 + 10;
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text('PROJECT TYPE', rx, y + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PURPLE);
  doc.text(quote.project_type || '—', rx, y + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(`${(quote.features || []).length} features included`, rx, y + 20);

  y += 36;

  // ── Features ─────────────────────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('INCLUDED FEATURES', margin, y);
  y += 5;

  const features = quote.features || [];
  if (features.length === 0) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('No features selected', margin, y + 5);
    y += 12;
  } else {
    // Draw a proper features table
    const rowH = 7;
    const tableH = Math.ceil(features.length / 2) * rowH + 10;
    doc.setFillColor(...SURFACE);
    roundRect(doc, margin, y, W - margin * 2, tableH, 3);

    const cols = 2;
    const colW = (W - margin * 2) / cols;
    features.forEach((f, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const fx = margin + col * colW + 4;
      const fy = y + 6 + row * rowH;
      doc.setFillColor(...PURPLE);
      doc.circle(fx + 1.5, fy + 0.5, 1.2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...WHITE);
      doc.text(f, fx + 5, fy + 2.5);
    });
    y += tableH + 6;
  }

  // ── Pricing summary ───────────────────────────────────────────────────────────
  doc.setFillColor(...SURFACE);
  const pricingH = quote.maintenance ? 38 : 30;
  roundRect(doc, margin, y, W - margin * 2, pricingH, 3);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('PRICING SUMMARY', margin + 4, y + 7);

  const total = quote.total_amount || 0;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(`Project Development (${quote.project_type})`, margin + 4, y + 14);
  doc.text('Included', W - margin - 4, y + 14, { align: 'right' });
  doc.text(`Selected Features (${features.length})`, margin + 4, y + 20);
  doc.text('Included', W - margin - 4, y + 20, { align: 'right' });

  if (quote.maintenance && maintenancePlans?.[quote.maintenance]) {
    const mp = maintenancePlans[quote.maintenance];
    doc.text(`Monthly Maintenance — ${mp.label}`, margin + 4, y + 26);
    doc.setTextColor(...WHITE);
    doc.text(`₹${mp.price.toLocaleString('en-IN')}/mo`, W - margin - 4, y + 26, { align: 'right' });
  }

  // Total line
  const totalY = y + pricingH - 8;
  doc.setFillColor(...BORDER);
  doc.rect(margin + 4, totalY - 4, W - margin * 2 - 8, 0.3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('Total Project Investment', margin + 4, totalY + 1);
  doc.setTextColor(...PURPLE);
  doc.text(`₹${total.toLocaleString('en-IN')}`, W - margin - 4, totalY + 1, { align: 'right' });

  y += pricingH + 8;

  // ── Notes ─────────────────────────────────────────────────────────────────────
  if (quote.notes) {
    doc.setFillColor(...SURFACE);
    roundRect(doc, margin, y, W - margin * 2, 20, 3);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text('NOTES', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    const lines = doc.splitTextToSize(quote.notes, W - margin * 2 - 8);
    doc.text(lines[0] || '', margin + 4, y + 14);
    y += 28;
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setFillColor(...BORDER);
  doc.rect(0, H - 14, W, 0.3, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Valid for 15 days. 50% advance required to begin. Balance due on delivery.', W / 2, H - 8, { align: 'center' });

  doc.save(`Quotation-${quote.quote_number}.pdf`);
}

/**
 * Export an invoice as a professional PDF
 */
export function exportInvoicePDF(invoice, client) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const margin = 16;
  let y = 0;

  // Background
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, H, 'F');

  // Header band
  doc.setFillColor(20, 18, 40);
  doc.rect(0, 0, W, 42, 'F');

  // Status color accent
  const statusColors = { paid: [16, 185, 129], pending: [245, 158, 11], overdue: [239, 68, 68], draft: [107, 107, 128], sent: [0, 212, 255] };
  const sc = statusColors[invoice.status] || MUTED;
  doc.setFillColor(...sc);
  doc.rect(0, 0, W, 1.5, 'F');

  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...PURPLE);
  doc.text('RP.', margin, 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Rajat Poddar — Developer & Entrepreneur', margin, 22);
  doc.text('solutionspoddar@gmail.com  ·  +91 7250580175', margin, 27);

  // Invoice label
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('INVOICE', W - margin, 14, { align: 'right' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(invoice.invoice_number, W - margin, 22, { align: 'right' });

  const date = new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(`Date: ${date}`, W - margin, 28, { align: 'right' });
  if (invoice.due_date) {
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, W - margin, 33, { align: 'right' });
  }

  y = 50;

  // Client + Status
  doc.setFillColor(...SURFACE);
  roundRect(doc, margin, y, (W - margin * 2 - 6) / 2, 28, 3);
  roundRect(doc, margin + (W - margin * 2 - 6) / 2 + 6, y, (W - margin * 2 - 6) / 2, 28, 3);

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text('BILLED TO', margin + 4, y + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(client?.name || '—', margin + 4, y + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(client?.business || '—', margin + 4, y + 20);
  if (client?.email) doc.text(client.email, margin + 4, y + 25);

  const rx = margin + (W - margin * 2 - 6) / 2 + 10;
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text('PROJECT', rx, y + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(invoice.project_name || '—', rx, y + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...sc);
  doc.text(invoice.status?.toUpperCase() || 'DRAFT', rx, y + 20);

  y += 36;

  // Amount breakdown
  doc.setFillColor(...SURFACE);
  const hasDiscount = invoice.discount_amount > 0;
  const breakdownH = hasDiscount ? 52 : 44;
  roundRect(doc, margin, y, W - margin * 2, breakdownH, 3);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('AMOUNT BREAKDOWN', margin + 4, y + 7);

  const rows = [
    ['Project Amount', `₹${(invoice.total_amount || 0).toLocaleString('en-IN')}`],
  ];
  if (hasDiscount) {
    const discLabel = invoice.discount_type === 'percent'
      ? `Discount (${invoice.discount_value}%)`
      : 'Discount';
    rows.push([discLabel, `-₹${(invoice.discount_amount || 0).toLocaleString('en-IN')}`]);
  }
  rows.push(['Amount Paid', `₹${(invoice.paid_amount || 0).toLocaleString('en-IN')}`]);

  rows.forEach(([label, val], i) => {
    const ry = y + 14 + i * 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(label, margin + 4, ry);
    doc.setTextColor(...WHITE);
    doc.text(val, W - margin - 4, ry, { align: 'right' });
  });

  // Due amount
  const dueY = y + breakdownH - 10;
  doc.setFillColor(...BORDER);
  doc.rect(margin + 4, dueY - 3, W - margin * 2 - 8, 0.3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('Amount Due', margin + 4, dueY + 2);
  const dueColor = (invoice.due_amount || 0) > 0 ? [245, 158, 11] : [16, 185, 129];
  doc.setTextColor(...dueColor);
  doc.text(`₹${(invoice.due_amount || 0).toLocaleString('en-IN')}`, W - margin - 4, dueY + 2, { align: 'right' });

  y += breakdownH + 8;

  // Notes
  if (invoice.notes) {
    doc.setFillColor(...SURFACE);
    roundRect(doc, margin, y, W - margin * 2, 22, 3);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text('PAYMENT NOTES', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    const lines = doc.splitTextToSize(invoice.notes, W - margin * 2 - 8);
    doc.text(lines.slice(0, 2), margin + 4, y + 14);
    y += 30;
  }

  // Footer
  doc.setFillColor(...BORDER);
  doc.rect(0, H - 14, W, 0.3, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Thank you for your business. Please make payment by the due date.', W / 2, H - 8, { align: 'center' });

  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
}
