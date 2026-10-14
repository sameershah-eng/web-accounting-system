/**
 * Swedish accounting formatting helpers
 * Adheres to standard Swedish financial formatting (SEK, space thousands separator, comma decimal)
 */

export function formatSEK(amount: number, showDecimals: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0,00 kr';
  }

  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  const parts = absVal.toFixed(showDecimals ? 2 : 0).split('.');
  // Add space separator for thousands (Swedish accounting standard)
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const decimalPart = parts[1];

  const formatted = showDecimals ? `${integerPart},${decimalPart} kr` : `${integerPart} kr`;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatSEKCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace('.', ',')} Mkr`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} tkr`;
  }
  return formatSEK(amount, false);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  // Format as YYYY-MM-DD
  return dateString.substring(0, 10);
}

export function formatOrgNr(orgNr: string): string {
  if (!orgNr) return '';
  const cleaned = orgNr.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
  }
  return orgNr;
}

export function maskPersonnummer(pnr: string): string {
  if (!pnr) return '';
  const cleaned = pnr.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 8)}-****`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 6)}-****`;
  }
  return pnr;
}

/**
 * Download a generated text or XML/JSON file in browser
 */
export function downloadFile(filename: string, content: string, contentType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
