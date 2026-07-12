/** Hex-only invoice styles for PDF export (html2canvas-safe). */
export const INVOICE_EXPORT_CSS = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
  }

  #invoice-document {
    position: relative;
    width: 794px;
    max-width: 794px;
    overflow: hidden;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    font-size: 12px;
    line-height: 1.45;
  }

  .receipt-watermark-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: min(92%, 520px);
    opacity: 0.45;
  }

  .inv-body {
    position: relative;
    z-index: 1;
  }

  .invoice-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    background: #0b1f3a;
    color: #ffffff;
    padding: 20px 24px;
  }

  .inv-brand {
    display: flex;
    width: 100%;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .inv-logo-box {
    display: flex;
    height: 56px;
    width: 56px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: #ffffff;
    padding: 8px;
  }

  .inv-logo-box img {
    height: 40px;
    width: auto;
    max-width: 100%;
    object-fit: contain;
  }

  .inv-company-name {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
    color: #ffffff;
  }

  .inv-company-tagline {
    margin: 4px 0 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #cbd5e1;
  }

  .inv-doc-title-wrap {
    text-align: right;
  }

  .inv-doc-badge {
    display: inline-block;
    border-radius: 6px;
    background: rgba(51, 65, 85, 0.85);
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .inv-doc-ref {
    margin: 8px 0 0;
    font-size: 11px;
    color: #cbd5e1;
  }

  .inv-doc-number {
    margin: 4px 0 0;
    font-family: Consolas, monospace;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #ffffff;
  }

  .inv-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    border-bottom: 1px solid #e2e8f0;
    background: #f1f5f9;
    padding: 12px 24px;
  }

  .inv-meta-col-right {
    text-align: right;
  }

  .inv-meta p {
    margin: 0;
    font-size: 11px;
    line-height: 1.5;
    color: #334155;
  }

  .inv-meta strong {
    color: #0f172a;
  }

  .inv-parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    border-bottom: 1px solid #e2e8f0;
    padding: 20px 24px;
  }

  .inv-section-label {
    margin: 0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #64748b;
  }

  .inv-party p {
    margin: 0 0 4px;
    font-size: 13px;
    color: #334155;
  }

  .inv-party .inv-party-name {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }

  .inv-pickup-time {
    margin-top: 12px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #ea580c !important;
  }

  .inv-pickup-code {
    display: inline-block;
    margin-top: 12px;
    border: 1px solid #fdba74;
    border-radius: 6px;
    background: #fff7ed;
    padding: 8px 16px;
  }

  .inv-pickup-code-label {
    margin: 0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c2410c;
  }

  .inv-pickup-code-value {
    margin: 4px 0 0;
    font-family: Consolas, monospace;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
    -webkit-text-fill-color: #0f172a;
  }

  .inv-table-wrap {
    padding: 16px 24px;
    overflow-x: auto;
  }

  .inv-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  .inv-table thead tr {
    border-bottom: 2px solid #cbd5e1;
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
  }

  .inv-table th,
  .inv-table td {
    padding: 10px 8px;
    vertical-align: top;
  }

  .inv-table th:nth-child(2),
  .inv-table td:nth-child(2) { text-align: center; }
  .inv-table th:nth-child(n+3),
  .inv-table td:nth-child(n+3) { text-align: right; }

  .inv-table tbody tr {
    border-bottom: 1px solid #e2e8f0;
  }

  .inv-item-name {
    margin: 0;
    font-weight: 600;
    color: #0f172a;
  }

  .inv-item-sku {
    margin: 2px 0 0;
    font-size: 11px;
    color: #64748b;
  }

  .inv-summary {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 24px;
    border-top: 1px solid #e2e8f0;
    padding: 20px 24px;
  }

  .inv-payment p {
    margin: 0 0 4px;
    font-size: 13px;
    color: #1e293b;
  }

  .inv-payment strong {
    color: #0f172a;
  }

  .inv-status-paid { color: #047857; font-weight: 700; }
  .inv-status-pending { color: #b45309; font-weight: 700; }

  .inv-note {
    margin-top: 16px;
    font-size: 11px;
    font-style: italic;
    color: #475569;
  }

  .inv-totals {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #f8fafc;
    padding: 16px;
  }

  .inv-totals-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    color: #475569;
  }

  .inv-totals-row strong {
    color: #0f172a;
  }

  .inv-totals-total {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #cbd5e1;
    padding-top: 12px;
    margin-top: 4px;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .inv-totals-words {
    margin: 12px 0 0;
    font-size: 11px;
    font-style: italic;
    color: #475569;
  }

  .inv-signatures {
    border-top: 1px solid #e2e8f0;
    padding: 20px 24px;
  }

  .inv-signatures-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 16px;
  }

  .inv-signature-line {
    border-bottom: 1px solid #94a3b8;
    margin-top: 24px;
  }

  .inv-legal {
    border-top: 1px solid #e2e8f0;
    padding: 16px 24px;
  }

  .inv-legal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .inv-legal ul {
    margin: 8px 0 0;
    padding-left: 18px;
    font-size: 11px;
    line-height: 1.5;
    color: #475569;
  }

  .invoice-footer {
    background: #0b1f3a;
    padding: 16px 24px;
    text-align: center;
    font-size: 10px;
    line-height: 1.5;
    color: #cbd5e1;
  }

  .invoice-footer p {
    margin: 0 0 4px;
  }

  .inv-footer-thanks {
    margin-top: 8px !important;
    font-weight: 600;
    color: #ffffff !important;
  }
`;
