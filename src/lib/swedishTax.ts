/**
 * Swedish Tax & Payroll calculation logic
 * Skatteverket skattetabeller & Arbetsgivaravgifter (31,42%)
 */

export const EMPLOYER_CONTRIBUTION_RATE = 0.3142; // Arbetsgivaravgift 31.42%
export const VACATION_ACCRUAL_RATE = 0.12; // Semesterlönelagen min 12%

/**
 * Calculates preliminary tax deduction based on monthly salary and Swedish tax table (Tabell 29-42, Kolumn 1)
 * Approximates Skatteverket standard preliminary tax tables with basic deduction (grundavdrag) and jobbskatteavdrag
 */
export function calculatePreliminaryTax(monthlySalary: number, taxTable: number = 31, column: number = 1): number {
  if (monthlySalary <= 2000) return 0;

  // Municipal tax rate approximation based on table number (e.g., Tabell 31 ~ 31.0%)
  const municipalRate = (taxTable / 100);

  // Jobbskatteavdrag & Grundavdrag simplified emulation for realistic payslips
  let effectiveTaxRate = municipalRate;

  if (monthlySalary < 20000) {
    effectiveTaxRate = municipalRate * 0.65;
  } else if (monthlySalary < 35000) {
    effectiveTaxRate = municipalRate * 0.78;
  } else if (monthlySalary < 50000) {
    effectiveTaxRate = municipalRate * 0.86;
  } else {
    // Above brytpunkt (~598 500 kr/yr or ~49 875 kr/mo in 2026): 20% state tax applies to excess
    const stateTaxThreshold = 51000;
    const baseTax = stateTaxThreshold * municipalRate * 0.88;
    const excess = Math.max(0, monthlySalary - stateTaxThreshold);
    const totalTax = baseTax + (excess * (municipalRate + 0.20));
    return Math.round(totalTax);
  }

  // Adjust slightly for column 2 (non-pensionable or other tax situations)
  if (column === 2) {
    effectiveTaxRate *= 1.08;
  }

  const calculated = Math.round(monthlySalary * effectiveTaxRate);
  return Math.max(0, calculated);
}

/**
 * Calculates employer contributions (Arbetsgivaravgift: 31,42%)
 */
export function calculateEmployerContribution(grossSalary: number): number {
  return Math.round(grossSalary * EMPLOYER_CONTRIBUTION_RATE);
}

/**
 * Calculates vacation pay accrual (Semesterskuld)
 */
export function calculateVacationAccrual(grossSalary: number): number {
  return Math.round(grossSalary * VACATION_ACCRUAL_RATE);
}

/**
 * Generates an AGI (Arbetsgivardeklaration på individnivå) XML payload for Skatteverket
 */
export function generateAgiXml(
  company: { name: string; orgNr: string },
  period: string, // YYYY-MM
  payrollLines: Array<{
    personalId: string;
    employeeName: string;
    grossPay: number;
    taxAmount: number;
    employerContribution: number;
  }>
): string {
  const timestamp = new Date().toISOString();
  const totalGross = payrollLines.reduce((s, l) => s + l.grossPay, 0);
  const totalTax = payrollLines.reduce((s, l) => s + l.taxAmount, 0);
  const totalAg = payrollLines.reduce((s, l) => s + l.employerContribution, 0);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Skatteverket Arbetsgivardeklaration AGI v1.4 -->
<e-deklaration xmlns="http://xmls.skatteverket.se/se/skatteverket/ai/instans/infoForBeskattning/1.4" skapad="${timestamp}">
  <blankettgemensamt>
    <uppgiftslamnare>
      <organisationsnummer>${company.orgNr.replace('-', '')}</organisationsnummer>
      <namn>${company.name}</namn>
    </uppgiftslamnare>
    <redovisningsperiod>${period.replace('-', '')}</redovisningsperiod>
    <programnamn>Balans Byråsystem v2026.4</programnamn>
  </blankettgemensamt>
  <huvuduppgift>
    <arbetsgivaravgift>
      <underlagAvgiftspliktigErsattning>${totalGross}</underlagAvgiftspliktigErsattning>
      <summaArbetsgivaravgifter>${totalAg}</summaArbetsgivaravgifter>
    </arbetsgivaravgift>
    <avdragenSkatt>
      <summaAvdragenSkatt>${totalTax}</summaAvdragenSkatt>
    </avdragenSkatt>
  </huvuduppgift>
  <individuppgifter>
${payrollLines
  .map(
    (line, idx) => `    <individuppgift id="IND_${idx + 1}">
      <betalningsmottagare>
        <personidentifikator>${line.personalId}</personidentifikator>
        <namn>${line.employeeName}</namn>
      </betalningsmottagare>
      <bruttoersattningKontant>${line.grossPay}</bruttoersattningKontant>
      <avdragenSkatt>${line.taxAmount}</avdragenSkatt>
      <underlagArbetsgivaravgifter>${line.grossPay}</underlagArbetsgivaravgifter>
    </individuppgift>`
  )
  .join('\n')}
  </individuppgifter>
</e-deklaration>`;

  return xml;
}

/**
 * Generates Bolagsverket iXBRL instance document for K2 Årsredovisning
 */
export function generateBolagsverketIxbrl(company: { name: string; orgNr: string; fiscalYear: string }, netProfit: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:ix="http://www.xbrl.org/2013/inlineXBRL"
      xmlns:se-cd-base="http://www.bolagsverket.se/se/fr/cd-base/2017-12-31"
      xmlns:se-gen-base="http://www.bolagsverket.se/se/fr/gen-base/2017-12-31">
  <head>
    <title>Årsredovisning K2 - ${company.name}</title>
    <!-- Bolagsverket Digital Inlämning v2026 -->
  </head>
  <body>
    <h1>Årsredovisning för ${company.name}</h1>
    <p>Organisationsnummer: ${company.orgNr}</p>
    <p>Räkenskapsår: ${company.fiscalYear}</p>
    <p>Årets resultat: <ix:nonFraction unitRef="SEK" decimals="0" contextRef="CurrentYear">${netProfit}</ix:nonFraction> SEK</p>
    <p>Revisionsberättelse: Revisor har ej utsetts (avser mindre aktiebolag enl ABL)</p>
  </body>
</html>`;
}

/**
 * Generates Skatteverket SRU files (Blanketter.sru + Info.sru)
 */
export function generateSruFiles(company: { name: string; orgNr: string }): { blanketter: string; info: string } {
  const info = `#DATABESKRIVNING_START
#PRODUKT SRU
#PROGRAM Balans Byråsystem
#FILNAMN BLANKETTER.SRU
#DATABESKRIVNING_SLUT
#MEDDELANDE_START
#ORGNR ${company.orgNr.replace('-', '')}
#NAMN ${company.name}
#MEDDELANDE_SLUT`;

  const blanketter = `#BLANKETT INK2-2026P4
#IDENTITET ${company.orgNr.replace('-', '')} 20261231
#UPPGIFT 7011 20260101
#UPPGIFT 7012 20261231
#BLANKETTSLUT`;

  return { blanketter, info };
}
