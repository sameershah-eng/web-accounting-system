# Balans Byråsystem – Svenskt Redovisnings- & Lönesystem för Redovisningsbyråer

Balans Byråsystem är en komplett, modern webbaserad plattform utvecklad för auktoriserade redovisningsbyråer (FAR/Srf konsulterna) som administrerar cirka 65 småföretagskunder (aktiebolag och enskilda firmor). Systemet ersätter separata nischprogram med ett enhetligt byråsystem som omfattar löpande bokföring, lönehantering, momsredovisning samt årsbokslut och K2-årsredovisning.

---

## 1. Systemarkitektur & Mappstruktur

```
/src
  /components
    Navbar.tsx              # Slimmad Nordic top-bar med glidande gradientindikator och klientsökning
    CommandPalette.tsx       # Cmd+K snabbkommandon för att hoppa till bolag, vyer och funktioner
    BankIdModal.tsx          # Realistisk svensk Mobilt BankID-dialog med QR-skanning och certifiering
    ToastContainer.tsx       # Diskreta händelseaviseringar
  /context
    AccountingContext.tsx    # Globalt byråtillstånd med automatisk localStorage-persistens
  /data
    basAccounts.ts           # Kontoplan BAS 2026 (klass 1 till 8, momskoder och standardkonton)
    seedClients.ts           # 65 realistiska svenska klientbolag (AB och EF) med organisationsnummer
    seedNorrstrom.ts         # Fullständigt dataunderlag för huvudklienten "Norrström Bygg AB"
    seedSystem.ts            # Byråmedarbetare, roller, mockade integrationer och revisionslogg
  /lib
    formatters.ts            # Svenska valutaformat (1 234 567,00 kr), datum och personnummermaskering
    swedishTax.ts            # Skatteverkets preliminärskattetabeller (29–42), sociala avgifter (31,42%)
    ledgerCalculations.ts    # Huvudbok, råbalans, resultaträkning, balansräkning och momsdeklaration
  /pages
    Dashboard.tsx            # Byråöversikt: deadlines, KPI:er, intäkts-/kostnadsgraf, revisionsflöde
    Clients.tsx              # Klientregister för 65 bolag med sökning, bolagsformsfilter och sidopanel
    Bookkeeping.tsx          # Verifikationer, kontering med hård balansvalidering, huvudbok, råbalans, moms
    Payroll.tsx              # Anställningsregister, lönekörningsguide, utskriftsvänlig lönespec, AGI XML
    YearEnd.tsx              # 5-stegs bokslutsprocess, K2-årsredovisning med balanskontroll, iXBRL och SRU
    Integrations.tsx         # Myndighetskopplingar, RBAC-användarhantering och fullständig revisionslogg
    ClientPortal.tsx         # Förenklad portalvy för företagare (rapporter, BankID-dokument, meddelanden)
  /types
    index.ts                 # Strikt typning för svensk redovisning, lön och integrationer
```

---

## 2. Användarroller och Behörigheter (RBAC)

Byrån har 4 fördefinierade roller:
1. **Admin (Byråledare, t.ex. Karin Lindqvist)**: Full behörighet över alla 65 klienter, användarhantering, systeminställningar, API-nycklar och revisionslogg.
2. **Senior Accountant (Senior Redovisningsekonom, t.ex. Erik Bergström)**: Behörighet att låsa och godkänna lönekörningar, upprätta bokslutsdispositioner och signera K2-årsredovisningar som auktoriserat ombud.
3. **Accountant (Redovisningskonsult, t.ex. Sara Wallin)**: Handlägger löpande verifikationer, bankavstämning, kvittohantering och preliminära löner.
4. **Client (Företagarklient, t.ex. Johan Norrström)**: Begränsad, renodlad klientvy som enbart ser det egna bolagets rapporter, undertecknade dokument och meddelanden med byrån.

Du kan när som helst byta aktiv användare/roll via profilmenyn uppe till höger eller via snabbknappen **"Klientvy"**.

---

## 3. Funktioner och Moduler i Detalj

### Löpande Bokföring (Bokföringslagen BFL & BAS 2026)
- **Hård balansvalidering**: En verifikation kan inte sparas om debet inte är exakt lika med kredit. Skillnaden visas i realtid med färgkodad indikator.
- **Automatisk moms**: Stöd för 25%, 12%, 6% och omvänd byggmoms. Klick på "+25% Moms" lägger till automatisk motkontering på konto 2611 (utgående moms) eller 2641 (ingående moms).
- **Huvudbok & Råbalans**: Automatisk sammanställning av ingående balans, omsättning och utgående saldo för alla konton.
- **Momsdeklaration**: Officiella Skatteverket-rutor (Ruta 05, 06, 07, 10, 11, 12, 48, 49) med export till CSV.
- **Bankavstämning**: Importerat transaktionsflöde via Open Banking med automatiska matchningsförslag och "Bokför & matcha"-knapp.

### Lönehantering (Lön & Arbetsgivaravgifter)
- **Skatteberäkning**: Dynamisk beräkning baserad på Skatteverkets preliminärskattetabeller (tabell 29–42, kolumn 1 & 2) och jobbskatteavdrag.
- **Arbetsgivaravgifter**: 31,42% lagstadgad avgift beräknas och bokförs automatiskt.
- **Semesterskuld**: Spårning av semesterdagar och semesterskuldstillväxt (12%).
- **AGI-export**: Genererar officiell XML-fil enligt Skatteverkets specifikation för e-deklaration.
- **Lönespecifikation**: Ren, utskriftsoptimerad vy med automatisk PDF-generering via webbläsarens utskriftsdialog (`window.print`).

### Årsbokslut & K2 Årsredovisning (BFNAR 2016:10)
- **Bokslutsprocess**: 5-stegs guide från avstämning till skatteberäkning (20,6% bolagsskatt) och signering.
- **Årsredovisningshandling**: Förvaltningsberättelse med flerårsöversikt och resultatdisposition, resultaträkning, balansräkning, noter och underskrifter.
- **Balanskontroll**: Visuell indikator som bekräftar att tillgångarna balanserar mot eget kapital och skulder.
- **Digital signering**: Fullt BankID-flöde med QR-kod och signeringsstatus.
- **Export**: iXBRL-fil för Bolagsverket och SRU-filer (`BLANKETTER.SRU` / `INFO.SRU`) för Skatteverket.

---

## 4. Integration mot Svenska Myndigheter och Bankinfrastruktur

I denna live-demonstration körs integrationerna mot ett internt certifierat datalager med mockade svarsdata. I en produktionsmiljö ansluts följande officiella API:er:

### 1. Skatteverket API (Neos & Maskin-till-maskin)
- **Tjänster**: Inlämning av Arbetsgivardeklaration på individnivå (AGI), Momsdeklaration samt automatisk avstämning av Skattekonto.
- **Protokoll**: REST API med mTLS (ömsesidig TLS-autentisering) och OAuth2 Client Credentials med organisationscertifikat (Soft- eller SmartCard PKI) utfärdat av godkänd certifikatutfärdare (t.ex. Expisoft eller Telia).
- **Format**: XML enligt Skatteverkets XSD-scheman (`e-deklaration v1.4`).

### 2. Bolagsverket API (Digital inlämning av årsredovisning)
- **Tjänster**: Registrering av K2/K3-årsredovisning och revisionsberättelse.
- **Protokoll**: SOAP/REST via Bolagsverkets e-tjänst för programvaruleverantörer.
- **Format**: Inline XBRL (iXBRL) med den officiella svenska taxonomin `se-cd-base` och `se-gen-base`.
- **Signering**: Verifiering av avancerad elektronisk underskrift från styrelseledamöter via svensk e-legitimation (BankID eller Freja eID+).

### 3. Försäkringskassan (Arbetsgivartjänster)
- **Tjänster**: Automatisk rapportering av sjuklön, karensavdrag och verifiering av VAB-dagar för att motverka felaktiga löneavdrag.
- **Protokoll**: API via Arbetsgivargateway med organisations-eID.

### 4. Open Banking PSD2 / PSS (Nordic API Gateway / Neonomics / Bankernas egna API:er)
- **Tjänster**: Realtidsåtkomst till kontotransaktioner (AIS - Account Information Services) från SEB, Swedbank, Handelsbanken och Nordea.
- **Protokoll**: Berlin Group NextGenPSD2 REST API med OAuth2 och SCA (Strong Customer Authentication).

---

## 5. Så kör du applikationen lokalt

```bash
# Installera beroenden
npm install

# Starta utvecklingsservern
npm run dev

# Kompilera produktionsbygge
npm run build
```

Öppna webbläsaren på `http://localhost:3000`. Alla ändringar du gör i bokföringen eller lönekörningen sparas automatiskt i din webbläsares lokala minne (`localStorage`) så att demonstrationen överlever sidomladdningar.
