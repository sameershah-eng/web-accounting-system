import { BasAccount } from '../types';

export const BAS_ACCOUNTS: BasAccount[] = [
  // KONTOPLASS 1: TILLGÅNGAR
  { number: 1010, name: 'Utvecklingsutgifter', type: 'Tillgångar', class: 1 },
  { number: 1110, name: 'Byggnader', type: 'Tillgångar', class: 1 },
  { number: 1210, name: 'Maskiner och andra tekniska anläggningar', type: 'Tillgångar', class: 1 },
  { number: 1220, name: 'Inventarier och verktyg', type: 'Tillgångar', class: 1, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 1229, name: 'Ackumulerade avskrivningar på inventarier', type: 'Tillgångar', class: 1 },
  { number: 1240, name: 'Bilar och andra transportmedel', type: 'Tillgångar', class: 1 },
  { number: 1249, name: 'Ackumulerade avskrivningar på transportmedel', type: 'Tillgångar', class: 1 },
  { number: 1510, name: 'Kundfordringar', type: 'Tillgångar', class: 1 },
  { number: 1630, name: 'Avräkning för skatter och avgifter (skattekonto)', type: 'Tillgångar', class: 1 },
  { number: 1680, name: 'Andra kortfristiga fordringar', type: 'Tillgångar', class: 1 },
  { number: 1710, name: 'Förutbetalda hyreskostnader', type: 'Tillgångar', class: 1 },
  { number: 1730, name: 'Förutbetalda försäkringspremier', type: 'Tillgångar', class: 1 },
  { number: 1790, name: 'Övriga förutbetalda kostnader och upplupna intäkter', type: 'Tillgångar', class: 1 },
  { number: 1910, name: 'Kassa', type: 'Tillgångar', class: 1 },
  { number: 1930, name: 'Företagskonto / Checkkonto / Bank', type: 'Tillgångar', class: 1 },
  { number: 1940, name: 'Övriga bankkonton', type: 'Tillgångar', class: 1 },
  { number: 1970, name: 'Särskilda bankkonton (skattekonto ref)', type: 'Tillgångar', class: 1 },

  // KONTOPLASS 2: EGET KAPITAL OCH SKULDER
  { number: 2081, name: 'Aktiekapital', type: 'Skulder och eget kapital', class: 2 },
  { number: 2091, name: 'Balanserad vinst eller förlust', type: 'Skulder och eget kapital', class: 2 },
  { number: 2098, name: 'Vinst eller förlust från föregående år', type: 'Skulder och eget kapital', class: 2 },
  { number: 2099, name: 'Årets resultat', type: 'Skulder och eget kapital', class: 2 },
  { number: 2350, name: 'Andra långfristiga skulder till kreditinstitut', type: 'Skulder och eget kapital', class: 2 },
  { number: 2440, name: 'Leverantörsskulder', type: 'Skulder och eget kapital', class: 2 },
  { number: 2611, name: 'Utgående moms på försäljning inom Sverige, 25%', type: 'Skulder och eget kapital', class: 2 },
  { number: 2621, name: 'Utgående moms på försäljning inom Sverige, 12%', type: 'Skulder och eget kapital', class: 2 },
  { number: 2631, name: 'Utgående moms på försäljning inom Sverige, 6%', type: 'Skulder och eget kapital', class: 2 },
  { number: 2641, name: 'Ingående moms', type: 'Skulder och eget kapital', class: 2 },
  { number: 2650, name: 'Redovisningskonto för moms (momsredovisning)', type: 'Skulder och eget kapital', class: 2 },
  { number: 2710, name: 'Personalskatt (preliminärskatt källskatt)', type: 'Skulder och eget kapital', class: 2 },
  { number: 2731, name: 'Avräkning lagstadgade sociala avgifter', type: 'Skulder och eget kapital', class: 2 },
  { number: 2820, name: 'Kortfristiga skulder till anställda', type: 'Skulder och eget kapital', class: 2 },
  { number: 2890, name: 'Övriga kortfristiga skulder', type: 'Skulder och eget kapital', class: 2 },
  { number: 2920, name: 'Upplupna semesterlöner (semesterskuld)', type: 'Skulder och eget kapital', class: 2 },
  { number: 2940, name: 'Upplupna lagstadgade sociala avgifter', type: 'Skulder och eget kapital', class: 2 },
  { number: 2990, name: 'Övriga upplupna kostnader och förutbetalda intäkter', type: 'Skulder och eget kapital', class: 2 },

  // KONTOPLASS 3: RÖRELSENS INTÄKTER
  { number: 3001, name: 'Försäljning varor inom Sverige, 25% moms', type: 'Rörelsens intäkter', class: 3, vatCode: '25%', defaultVatAccount: 2611 },
  { number: 3002, name: 'Försäljning varor inom Sverige, 12% moms', type: 'Rörelsens intäkter', class: 3, vatCode: '12%', defaultVatAccount: 2621 },
  { number: 3003, name: 'Försäljning varor inom Sverige, 6% moms', type: 'Rörelsens intäkter', class: 3, vatCode: '6%', defaultVatAccount: 2631 },
  { number: 3004, name: 'Försäljning momsfri inom Sverige, 0%', type: 'Rörelsens intäkter', class: 3, vatCode: '0%' },
  { number: 3041, name: 'Försäljning tjänster inom Sverige, 25% moms', type: 'Rörelsens intäkter', class: 3, vatCode: '25%', defaultVatAccount: 2611 },
  { number: 3044, name: 'Försäljning tjänster inom Sverige, momsfri (omvänd skattskyldighet bygg)', type: 'Rörelsens intäkter', class: 3, vatCode: '0%' },
  { number: 3540, name: 'Fakturerade resekostnader', type: 'Rörelsens intäkter', class: 3, vatCode: '25%', defaultVatAccount: 2611 },
  { number: 3740, name: 'Öres- och kronutjämning', type: 'Rörelsens intäkter', class: 3 },
  { number: 3990, name: 'Övriga rörelseintäkter', type: 'Rörelsens intäkter', class: 3 },

  // KONTOPLASS 4: KOSTNADER FÖR VAROR, MATERIAL OCH DIREKTA KOSTNADER
  { number: 4010, name: 'Inköp av material och varor, 25% moms', type: 'Kostnader för sålda varor', class: 4, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 4012, name: 'Inköp av varor, 12% moms', type: 'Kostnader för sålda varor', class: 4, vatCode: '12%', defaultVatAccount: 2641 },
  { number: 4016, name: 'Inköp av varor, 6% moms', type: 'Kostnader för sålda varor', class: 4, vatCode: '6%', defaultVatAccount: 2641 },
  { number: 4400, name: 'Inköpta underentreprenader (omvänd skattskyldighet)', type: 'Kostnader för sålda varor', class: 4, vatCode: '0%' },
  { number: 4410, name: 'Inköpta underentreprenader, 25% moms', type: 'Kostnader för sålda varor', class: 4, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 4535, name: 'Inköp av varor från annat EU-land', type: 'Kostnader för sålda varor', class: 4 },

  // KONTOPLASS 5 & 6: ÖVRIGA EXTERNA KOSTNADER
  { number: 5010, name: 'Lokalhyra', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5020, name: 'El för belysning och drift', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5060, name: 'Städning och renhållning', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5410, name: 'Förbrukningsinventarier (< ett halvt prisbasbelopp)', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5460, name: 'Förbrukningsmaterial', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5611, name: 'Drivmedel för personbilar', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5612, name: 'Drivmedel för lastbilar/transportfordon', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5613, name: 'Reparation och underhåll av transportmedel', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 5800, name: 'Resekostnader (tåg, flyg, hotell)', type: 'Övriga externa kostnader', class: 5, vatCode: '12%', defaultVatAccount: 2641 },
  { number: 5910, name: 'Annonsering och reklam', type: 'Övriga externa kostnader', class: 5, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 6071, name: 'Representation, avdragsgill', type: 'Övriga externa kostnader', class: 6, vatCode: '12%', defaultVatAccount: 2641 },
  { number: 6072, name: 'Representation, ej avdragsgill', type: 'Övriga externa kostnader', class: 6, vatCode: 'ingen' },
  { number: 6110, name: 'Kontorsmateriel', type: 'Övriga externa kostnader', class: 6, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 6211, name: 'Fast telefoni och bredband', type: 'Övriga externa kostnader', class: 6, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 6212, name: 'Mobiltelefoner och abonnemang', type: 'Övriga externa kostnader', class: 6, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 6310, name: 'Företagsförsäkringar', type: 'Övriga externa kostnader', class: 6, vatCode: 'ingen' },
  { number: 6420, name: 'Ersättningar till revisor / auktoriserad redovisningskonsult', type: 'Övriga externa kostnader', class: 6, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 6540, name: 'IT-tjänster och molnprogramvaror', type: 'Övriga externa kostnader', class: 6, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 6570, name: 'Bankkostnader och transaktionsavgifter', type: 'Övriga externa kostnader', class: 6, vatCode: 'ingen' },
  { number: 6980, name: 'Föreningsavgifter och branschorganisationer', type: 'Övriga externa kostnader', class: 6, vatCode: 'ingen' },

  // KONTOPLASS 7: PERSONALKOSTNADER
  { number: 7010, name: 'Löner till tjänstemän', type: 'Personalkostnader', class: 7 },
  { number: 7210, name: 'Löner till kollektivanställda / arbetare', type: 'Personalkostnader', class: 7 },
  { number: 7280, name: 'Tantiem och bonusar', type: 'Personalkostnader', class: 7 },
  { number: 7290, name: 'Förändring av semesterlöneskuld', type: 'Personalkostnader', class: 7 },
  { number: 7331, name: 'Skattepliktiga bilersättningar', type: 'Personalkostnader', class: 7 },
  { number: 7332, name: 'Skattefria bilersättningar (milersättning)', type: 'Personalkostnader', class: 7 },
  { number: 7380, name: 'Kostnader för förmåner till anställda (friskvård mm)', type: 'Personalkostnader', class: 7, vatCode: '25%', defaultVatAccount: 2641 },
  { number: 7510, name: 'Lagstadgade sociala avgifter (31,42%)', type: 'Personalkostnader', class: 7 },
  { number: 7533, name: 'Särskild löneskatt på pensionskostnader', type: 'Personalkostnader', class: 7 },
  { number: 7570, name: 'Premier för arbetsmarknadsförsäkringar (FORA mm)', type: 'Personalkostnader', class: 7 },
  { number: 7610, name: 'Utbildning och personalkurser', type: 'Personalkostnader', class: 7, vatCode: 'ingen' },

  // KONTOPLASS 8: AVSKRIVNINGAR, FINANSIELLT & SKATTER
  { number: 7832, name: 'Avskrivningar på maskiner och inventarier', type: 'Avskrivningar', class: 7 },
  { number: 7834, name: 'Avskrivningar på bilar och transportmedel', type: 'Avskrivningar', class: 7 },
  { number: 8310, name: 'Ränteintäkter från omsättningstillgångar', type: 'Finansiella poster', class: 8 },
  { number: 8410, name: 'Räntekostnader för långfristiga skulder', type: 'Finansiella poster', class: 8 },
  { number: 8423, name: 'Räntekostnader för checkräkningskredit / banklån', type: 'Finansiella poster', class: 8 },
  { number: 8910, name: 'Skatt på årets resultat (bolagsskatt 20,6%)', type: 'Skatter och bokslutsdispositioner', class: 8 },
  { number: 8999, name: 'Årets resultat (motkonto bokslut)', type: 'Skatter och bokslutsdispositioner', class: 8 },
];

export function getAccountByNumber(num: number): BasAccount | undefined {
  return BAS_ACCOUNTS.find(a => a.number === num);
}

export function searchAccounts(query: string): BasAccount[] {
  if (!query) return BAS_ACCOUNTS.slice(0, 15);
  const q = query.toLowerCase().trim();
  return BAS_ACCOUNTS.filter(a => 
    a.number.toString().includes(q) || 
    a.name.toLowerCase().includes(q)
  );
}
