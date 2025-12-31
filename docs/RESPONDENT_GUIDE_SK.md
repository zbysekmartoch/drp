# Príručka pre respondentov

## Ako vyplniť dotazník v systéme DRP

**Protimonopolný úrad Slovenskej republiky (PMÚ)**

---

## Obsah

1. [Úvod](#úvod)
2. [Prístup k dotazníku](#prístup-k-dotazníku)
3. [Rozhranie formulára](#rozhranie-formulára)
4. [Vyplňovanie otázok](#vyplňovanie-otázok)
5. [Nahrávanie súborov](#nahrávanie-súborov)
6. [Ukladanie a prerušenie práce](#ukladanie-a-prerušenie-práce)
7. [Odoslanie formulára](#odoslanie-formulára)
8. [Často kladené otázky](#často-kladené-otázky)
9. [Riešenie problémov](#riešenie-problémov)

---

## Úvod

Táto príručka vás prevedie procesom vyplnenia dotazníka v systéme DRP (Data Request Portal). Systém bol navrhnutý tak, aby bol čo najjednoduchší na použitie a aby vaše odpovede boli bezpečne uložené.

### Čo budete potrebovať

- ✅ Prístupový odkaz (dostanete e-mailom alebo iným spôsobom)
- ✅ Webový prehliadač (Chrome, Firefox, Safari, Edge)
- ✅ Stabilné pripojenie k internetu
- ✅ Prípadné súbory na nahratie (ak to dotazník vyžaduje)

### Podporované prehliadače

| Prehliadač | Verzia | Podpora |
|------------|--------|---------|
| Google Chrome | 90+ | ✅ Plná |
| Mozilla Firefox | 88+ | ✅ Plná |
| Microsoft Edge | 90+ | ✅ Plná |
| Safari | 14+ | ✅ Plná |
| Internet Explorer | - | ❌ Nepodporovaný |

---

## Prístup k dotazníku

### Krok 1: Otvorenie odkazu

1. Vyhľadajte e-mail alebo správu s prístupovým odkazom
2. Odkaz má formát: `https://[adresa]/r/[váš-unikátny-kód]`
3. Kliknite na odkaz alebo ho skopírujte do prehliadača

<!-- Screenshot: Príklad odkazu v e-maile -->
![Odkaz v e-maile](screenshots/respondent-01-email-link.png)
*Príklad prístupového odkazu v e-maile*

### Krok 2: Načítanie formulára

Po kliknutí na odkaz sa zobrazí:
- Názov dotazníka
- Prípadný úvodný text
- Vaša identifikácia (názov organizácie)
- Formulár s otázkami

<!-- Screenshot: Úvodná obrazovka formulára -->
![Úvodná obrazovka](screenshots/respondent-02-form-start.png)
*Úvodná obrazovka dotazníka*

### Kontrola platnosti prístupu

Váš prístup k dotazníku môže byť časovo obmedzený. Ak vidíte jednu z týchto správ:

| Správa | Význam | Čo robiť |
|--------|--------|----------|
| „Tento formulár ešte nie je k dispozícii" | Dotazník sa otvorí neskôr | Skúste neskôr, kontaktujte PMÚ |
| „Platnosť tohto formulára vypršala" | Termín na vyplnenie uplynul | Kontaktujte PMÚ |
| „Neplatný prístupový odkaz" | Odkaz je chybný alebo deaktivovaný | Overte správnosť odkazu, kontaktujte PMÚ |

---

## Rozhranie formulára

### Hlavné časti obrazovky

<!-- Screenshot: Popis častí formulára -->
![Časti formulára](screenshots/respondent-03-form-layout.png)
*Rozhranie formulára s označenými časťami*

1. **Hlavička** - Názov dotazníka a vaša identifikácia
2. **Ukazovateľ priebehu** - Koľko percent ste vyplnili
3. **Bloky otázok** - Zoskupené otázky podľa témy
4. **Otázky** - Jednotlivé otázky na zodpovedanie
5. **Tlačidlo odoslania** - Na konci formulára

### Ukazovateľ priebehu

V hornej časti formulára vidíte:

```
Priebeh: ████████░░░░░░░░░░░░ 40%
```

- Ukazuje, koľko **povinných** otázok ste zodpovedali
- Aktualizuje sa automaticky pri vypĺňaní
- 100% znamená, že sú zodpovedané všetky povinné otázky

### Indikátor automatického ukladania

V pravom hornom rohu sa zobrazuje:

| Stav | Význam |
|------|--------|
| 💾 „Automaticky uložené" | Vaše odpovede sú bezpečne uložené |
| ⏳ „Ukladám..." | Prebieha ukladanie |
| ⚠️ „Chyba ukladania" | Problém s pripojením, skúste obnoviť stránku |

---

## Vyplňovanie otázok

### Povinné vs. voliteľné otázky

- **Povinné otázky** sú označené červenou hviezdičkou *****
- Formulár nie je možné odoslať bez zodpovedania všetkých povinných otázok
- Voliteľné otázky môžete preskočiť

### Typ 1: Krátky text

Jednoriadkové textové pole pre krátke odpovede.

<!-- Screenshot: Krátky text -->
![Krátky text](screenshots/respondent-04-short-text.png)
*Pole pre krátky text*

**Ako vyplniť:**
1. Kliknite do poľa
2. Napíšte odpoveď
3. Prejdite na ďalšiu otázku (kláves Tab alebo kliknutie)

**Tipy:**
- Maximálna dĺžka je obvykle 255 znakov
- Ak potrebujete napísať viac, použite pole „Dlhý text"

### Typ 2: Dlhý text

Viacriadkové textové pole pre dlhšie odpovede.

<!-- Screenshot: Dlhý text -->
![Dlhý text](screenshots/respondent-05-long-text.png)
*Pole pre dlhý text*

**Ako vyplniť:**
1. Kliknite do poľa
2. Píšte ľubovoľne dlhý text
3. Pole sa automaticky zväčšuje podľa obsahu

**Tipy:**
- Môžete použiť Enter pre nové riadky
- Kopírovanie a vkladanie (Ctrl+C, Ctrl+V) funguje normálne
- Nie je obmedzenie dĺžky (prakticky do desiatok tisíc znakov)

### Typ 3: Výber jednej možnosti (Radio)

Vyberte presne jednu možnosť zo zoznamu.

<!-- Screenshot: Radio buttons -->
![Výber jednej možnosti](screenshots/respondent-06-radio.png)
*Otázka s výberom jednej možnosti*

**Ako vyplniť:**
1. Prečítajte si všetky možnosti
2. Kliknite na krúžok vedľa zvolenej odpovede
3. Vybraná možnosť sa zvýrazní

**Dôležité:**
- Je možné vybrať **iba jednu** možnosť
- Pre zmenu kliknite na inú možnosť
- Ak je otázka povinná, musíte vybrať

### Typ 4: Výber viacerých možností (Checkbox)

Vyberte ľubovoľný počet možností (aj žiadnu, ak nie je povinná).

<!-- Screenshot: Checkboxes -->
![Výber viacerých možností](screenshots/respondent-07-checkbox.png)
*Otázka s výberom viacerých možností*

**Ako vyplniť:**
1. Kliknite na štvorček pri každej relevantnej možnosti
2. Zaškrtnuté možnosti majú ✓
3. Opätovným kliknutím zrušíte výber

**Tipy:**
- Môžete vybrať všetky, niektoré alebo žiadnu možnosť
- Poradie výberu nie je dôležité

### Typ 5: Škála

Vyberte hodnotu na číselnej škále.

<!-- Screenshot: Škála -->
![Škála](screenshots/respondent-08-scale.png)
*Škálová otázka*

**Ako vyplniť:**
1. Prečítajte si popisky na krajoch škály (napr. „Vôbec nesúhlasím" ... „Plne súhlasím")
2. Kliknite na hodnotu, ktorá najlepšie zodpovedá vašej odpovedi
3. Alebo použite posuvník

**Varianty škál:**
- Číselná (1-5, 1-10, 0-100)
- S popiskami pri hodnotách
- S desatinnými číslami (napr. 0, 0.25, 0.5, 0.75, 1)

### Typ 6: Nahratie súboru

Priložte jeden alebo viac súborov.

<!-- Screenshot: Nahratie súboru -->
![Nahratie súboru](screenshots/respondent-09-file-upload.png)
*Pole pre nahratie súboru*

Podrobný návod pozri sekciu [Nahrávanie súborov](#nahrávanie-súborov).

---

## Nahrávanie súborov

### Podporované formáty

Typicky sú podporované tieto formáty (môže sa líšiť podľa nastavenia):

| Kategória | Formáty |
|-----------|---------|
| Dokumenty | PDF, DOC, DOCX, XLS, XLSX, TXT |
| Obrázky | JPG, JPEG, PNG, GIF |
| Archívy | ZIP, RAR |
| Ostatné | Podľa nastavenia PMÚ |

### Obmedzenie veľkosti

- **Maximálna veľkosť súboru:** 50 MB (môže byť nižšia)
- **Maximálny počet súborov:** Závisí od nastavenia otázky (typicky 1-10)

### Spôsoby nahratia

#### Spôsob 1: Pretiahnutie (Drag & Drop)

1. Otvorte priečinok so súborom na vašom počítači
2. Pretiahnite súbor myšou do označenej oblasti
3. Pustite tlačidlo myši

<!-- Screenshot: Drag and drop -->
![Pretiahnutie súboru](screenshots/respondent-10-drag-drop.png)
*Pretiahnutie súboru do oblasti nahrávania*

#### Spôsob 2: Výber súboru

1. Kliknite na odkaz **„vyberte z počítača"** alebo tlačidlo **„Vybrať súbor"**
2. V dialógovom okne nájdite požadovaný súbor
3. Kliknite na **„Otvoriť"**

<!-- Screenshot: Dialóg pre výber súboru -->
![Výber súboru](screenshots/respondent-11-file-dialog.png)
*Dialógové okno pre výber súboru*

### Priebeh nahrávania

Po výbere súboru uvidíte:

1. **Názov súboru** a jeho veľkosť
2. **Ukazovateľ priebehu** nahrávania
3. Po dokončení: ✅ zelená značka

<!-- Screenshot: Priebeh nahrávania -->
![Priebeh nahrávania](screenshots/respondent-12-upload-progress.png)
*Ukazovateľ priebehu nahrávania súboru*

### Odstránenie súboru

Ak chcete nahrať iný súbor alebo ste nahrali nesprávny:

1. Nájdite nahratý súbor v zozname
2. Kliknite na tlačidlo **„Odstrániť"** alebo ikonu 🗑️
3. Potvrďte odstránenie

<!-- Screenshot: Odstránenie súboru -->
![Odstránenie súboru](screenshots/respondent-13-remove-file.png)
*Tlačidlo pre odstránenie súboru*

### Riešenie problémov s nahrávaním

| Problém | Príčina | Riešenie |
|---------|---------|----------|
| „Súbor je príliš veľký" | Prekročený limit veľkosti | Zmenšite súbor alebo kontaktujte PMÚ |
| „Nepodporovaný formát" | Formát nie je povolený | Preveďte do podporovaného formátu |
| „Nahrávanie zlyhalo" | Výpadok pripojenia | Skúste znova, obnovte stránku |
| Nahrávanie je pomalé | Veľký súbor alebo pomalé pripojenie | Buďte trpezliví, nezatvárajte stránku |

---

## Ukladanie a prerušenie práce

### Automatické ukladanie

**Vaše odpovede sa ukladajú automaticky** pri každej zmene. Nemusíte nič robiť.

Ako to funguje:
1. Vyplníte alebo zmeníte odpoveď
2. Po 1-2 sekundách sa spustí ukladanie
3. Zobrazí sa „Ukladám..." a potom „Automaticky uložené"

<!-- Screenshot: Indikátor ukladania -->
![Automatické ukladanie](screenshots/respondent-14-autosave.png)
*Indikátor automatického ukladania*

### Prerušenie práce

Môžete bezpečne:
- ✅ Zavrieť prehliadač
- ✅ Vypnúť počítač
- ✅ Prejsť na inú stránku
- ✅ Pokračovať za hodinu, za deň, za týždeň

**Vaše odpovede zostanú uložené.**

### Pokračovanie vo vypĺňaní

1. Otvorte znova ten istý odkaz
2. Formulár sa načíta s vašimi uloženými odpoveďami
3. Pokračujte tam, kde ste skončili

<!-- Screenshot: Pokračovanie -->
![Pokračovanie vo vypĺňaní](screenshots/respondent-15-continue.png)
*Formulár s už vyplnenými odpoveďami*

### Dôležité upozornenie

⚠️ **Pozor na termín!** 

Ak má dotazník stanovený konečný termín, musíte:
1. **Vyplniť** všetky povinné otázky
2. **Odoslať** formulár pred termínom

Samotné uloženie odpovedí nestačí – formulár musí byť **odoslaný**.

---

## Odoslanie formulára

### Pred odoslaním

Skontrolujte:

1. ✅ Všetky povinné otázky sú zodpovedané (100% priebeh)
2. ✅ Súbory sú nahrané (ak je požadované)
3. ✅ Odpovede sú správne a kompletné

### Postup odoslania

1. Prejdite na koniec formulára
2. Kliknite na tlačidlo **„Odoslať formulár"**

<!-- Screenshot: Tlačidlo odoslať -->
![Tlačidlo odoslať](screenshots/respondent-16-submit-button.png)
*Tlačidlo pre odoslanie formulára*

### Chýbajúce odpovede

Ak ste nevyplnili všetky povinné otázky:

1. Zobrazí sa upozornenie
2. Formulár sa posunie k prvej nevyplnenej otázke
3. Doplňte chýbajúce odpovede
4. Skúste odoslať znova

<!-- Screenshot: Chýbajúce odpovede -->
![Chýbajúce odpovede](screenshots/respondent-17-validation-error.png)
*Upozornenie na nevyplnené povinné otázky*

### Potvrdenie odoslania

Po úspešnom odoslaní uvidíte:

- ✅ Potvrdzujúcu správu
- Dátum a čas odoslania
- Prípadne možnosť stiahnuť kópiu

<!-- Screenshot: Potvrdenie -->
![Potvrdenie odoslania](screenshots/respondent-18-confirmation.png)
*Potvrdenie úspešného odoslania*

### Po odoslaní

⚠️ **Dôležité:** Po odoslaní formulára:

- ❌ **Nie je možné** upravovať odpovede
- ❌ **Nie je možné** pridávať alebo mazať súbory
- ❌ **Nie je možné** odoslať znova

Ak potrebujete vykonať zmeny, kontaktujte PMÚ.

---

## Často kladené otázky

### Všeobecné otázky

**Q: Môžem vyplniť formulár na mobile?**
A: Áno, formulár je responzívny a funguje na mobilných zariadeniach. Pre najlepší zážitok odporúčame tablet alebo počítač.

**Q: Potrebujem sa niekam prihlasovať?**
A: Nie, váš prístupový odkaz obsahuje unikátny identifikátor. Nepotrebujete používateľské meno ani heslo.

**Q: Môžem zdieľať svoj odkaz s kolegom?**
A: Odkaz je priradený vašej organizácii. O zdieľaní sa poraďte s PMÚ.

**Q: V akom jazyku môžem vyplniť dotazník?**
A: Rozhranie podporuje češtinu, slovenčinu a angličtinu. Jazyk je možné prepnúť v pravom hornom rohu. Vaše odpovede môžete písať v ľubovoľnom jazyku.

### Otázky k ukladaniu

**Q: Stratím odpovede, keď zatvorím prehliadač?**
A: Nie, odpovede sa ukladajú automaticky. Pri návrate ich nájdete vyplnené.

**Q: Ako spoznám, že sa odpovede uložili?**
A: V rohu uvidíte „Automaticky uložené" so zelenou značkou.

**Q: Čo ak nemám internet počas vypĺňania?**
A: Odpovede sa uložia, akonáhle sa pripojenie obnoví. Nezatvárajte stránku.

### Otázky k súborom

**Q: Aké súbory môžem nahrať?**
A: Závisí od nastavenia dotazníka. Typicky PDF, Word, Excel, obrázky.

**Q: Môžem nahrať viac súborov k jednej otázke?**
A: Áno, ak to otázka umožňuje. Maximum uvidíte pri otázke.

**Q: Môžem nahrať ZIP archív?**
A: Obvykle áno, overte pri konkrétnom dotazníku.

### Otázky k odoslaniu

**Q: Môžem upraviť odpovede po odoslaní?**
A: Nie, po odoslaní sú odpovede uzamknuté. Kontaktujte PMÚ.

**Q: Dostanem potvrdenie e-mailom?**
A: Závisí od nastavenia. Vždy vidíte potvrdenie na obrazovke.

**Q: Čo ak odošlem omylom?**
A: Kontaktujte PMÚ čo najskôr.

---

## Riešenie problémov

### Problém: Stránka sa nenačítava

**Príznaky:** Biela stránka, chyba 404, „Stránka nenájdená"

**Riešenie:**
1. Skontrolujte správnosť odkazu (preklepy, chýbajúce znaky)
2. Skúste obnoviť stránku (F5 alebo Ctrl+R)
3. Vymažte vyrovnávaciu pamäť prehliadača (Ctrl+Shift+Delete)
4. Skúste iný prehliadač
5. Kontaktujte PMÚ

### Problém: Formulár sa zobrazuje, ale nejde vyplniť

**Príznaky:** Polia sú neaktívne, nejde písať

**Riešenie:**
1. Možno ste už odoslali – skontrolujte stav
2. Možno vypršal termín – kontaktujte PMÚ
3. Skúste obnoviť stránku
4. Vypnite blokovač reklám/rozšírenia

### Problém: Zmeny sa neukladajú

**Príznaky:** Nezobrazuje sa „Automaticky uložené", po obnovení chýbajú odpovede

**Riešenie:**
1. Skontrolujte pripojenie k internetu
2. Počkajte a skúste znova
3. Nepoužívajte anonymný/inkognito režim (môže blokovať ukladanie)
4. Skúste iný prehliadač

### Problém: Nie je možné nahrať súbor

**Príznaky:** Chybová správa pri nahrávaní, súbor sa neobjaví

**Riešenie:**
1. Skontrolujte veľkosť súboru (max 50 MB)
2. Overte formát súboru
3. Skúste súbor premenovať (odstrániť špeciálne znaky)
4. Skúste iný súbor

### Problém: Tlačidlo „Odoslať" nejde kliknúť

**Príznaky:** Tlačidlo je sivé, neklikateľné

**Riešenie:**
1. Vyplňte všetky povinné otázky (označené *)
2. Najazdite priebeh na 100%
3. Obnovte stránku a skúste znova

### Kontakt na podporu

Ak problémy pretrvávajú, pripravte si:

- 📝 Popis problému
- 📸 Screenshot chyby (ak je možné)
- 🔗 Prístupový odkaz (alebo jeho časť)
- 💻 Použitý prehliadač a operačný systém

Kontaktujte Protimonopolný úrad SR prostredníctvom kontaktných údajov v pôvodnom e-maile.

---

## Klávesové skratky

Pre rýchlejšie vypĺňanie môžete použiť:

| Skratka | Akcia |
|---------|-------|
| `Tab` | Presun na ďalšie pole |
| `Shift + Tab` | Presun na predchádzajúce pole |
| `Medzerník` | Vybrať/zrušiť checkbox |
| `↑` `↓` | Pohyb medzi možnosťami (radio/checkbox) |
| `Enter` | Potvrdiť (v jednoriadkovom poli) |
| `Ctrl + V` | Vložiť skopírovaný text |

---

## Zhrnutie

### Postup vyplnenia v 5 krokoch

1. **Otvorte odkaz** z e-mailu
2. **Vyplňte otázky** – odpovede sa ukladajú automaticky
3. **Nahrajte súbory** (ak je požadované)
4. **Skontrolujte odpovede** – vráťte sa a opravte
5. **Odošlite formulár** tlačidlom na konci

### Zapamätajte si

✅ Odpovede sa ukladajú automaticky
✅ Môžete kedykoľvek prerušiť a pokračovať
✅ Povinné otázky sú označené *
⚠️ Po odoslaní nie je možné meniť
⚠️ Nezabudnite odoslať pred termínom!

---

*Príručka pre respondentov v1.0 | DRP – Data Request Portal | PMÚ SR | December 2025*
