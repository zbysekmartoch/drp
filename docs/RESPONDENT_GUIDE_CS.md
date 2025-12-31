# Příručka pro respondenty

## Jak vyplnit dotazník v systému DRP

---

## Obsah

1. [Úvod](#úvod)
2. [Přístup k dotazníku](#přístup-k-dotazníku)
3. [Rozhraní formuláře](#rozhraní-formuláře)
4. [Vyplňování otázek](#vyplňování-otázek)
5. [Nahrávání souborů](#nahrávání-souborů)
6. [Ukládání a přerušení práce](#ukládání-a-přerušení-práce)
7. [Odeslání formuláře](#odeslání-formuláře)
8. [Často kladené otázky](#často-kladené-otázky)
9. [Řešení problémů](#řešení-problémů)

---

## Úvod

Tato příručka vás provede procesem vyplnění dotazníku v systému DRP (Data Request Portal). Systém byl navržen tak, aby byl co nejjednodušší na použití a aby vaše odpovědi byly bezpečně uloženy.

### Co budete potřebovat

- ✅ Přístupový odkaz (obdržíte e-mailem nebo jiným způsobem)
- ✅ Webový prohlížeč (Chrome, Firefox, Safari, Edge)
- ✅ Stabilní připojení k internetu
- ✅ Případné soubory k nahrání (pokud to dotazník vyžaduje)

### Podporované prohlížeče

| Prohlížeč | Verze | Podpora |
|-----------|-------|---------|
| Google Chrome | 90+ | ✅ Plná |
| Mozilla Firefox | 88+ | ✅ Plná |
| Microsoft Edge | 90+ | ✅ Plná |
| Safari | 14+ | ✅ Plná |
| Internet Explorer | - | ❌ Nepodporován |

---

## Přístup k dotazníku

### Krok 1: Otevření odkazu

1. Vyhledejte e-mail nebo zprávu s přístupovým odkazem
2. Odkaz má formát: `https://[adresa]/r/[váš-unikátní-kód]`
3. Klikněte na odkaz nebo ho zkopírujte do prohlížeče

<!-- Screenshot: Příklad odkazu v e-mailu -->
![Odkaz v e-mailu](screenshots/respondent-01-email-link.png)
*Příklad přístupového odkazu v e-mailu*

### Krok 2: Načtení formuláře

Po kliknutí na odkaz se zobrazí:
- Název dotazníku
- Případný úvodní text
- Vaše identifikace (název organizace)
- Formulář s otázkami

<!-- Screenshot: Úvodní obrazovka formuláře -->
![Úvodní obrazovka](screenshots/respondent-02-form-start.png)
*Úvodní obrazovka dotazníku*

### Kontrola platnosti přístupu

Váš přístup k dotazníku může být časově omezen. Pokud vidíte jednu z těchto zpráv:

| Zpráva | Význam | Co dělat |
|--------|--------|----------|
| „Tento formulář ještě není k dispozici" | Dotazník se otevře později | Zkuste později, kontaktujte zadavatele |
| „Platnost tohoto formuláře vypršela" | Termín pro vyplnění uplynul | Kontaktujte zadavatele |
| „Neplatný přístupový odkaz" | Odkaz je chybný nebo deaktivovaný | Ověřte správnost odkazu, kontaktujte zadavatele |

---

## Rozhraní formuláře

### Hlavní části obrazovky

<!-- Screenshot: Popis částí formuláře -->
![Části formuláře](screenshots/respondent-03-form-layout.png)
*Rozhraní formuláře s označenými částmi*

1. **Záhlaví** - Název dotazníku a vaše identifikace
2. **Ukazatel průběhu** - Kolik procent jste vyplnili
3. **Bloky otázek** - Seskupené otázky podle tématu
4. **Otázky** - Jednotlivé otázky k zodpovězení
5. **Tlačítko odeslání** - Na konci formuláře

### Ukazatel průběhu

V horní části formuláře vidíte:

```
Průběh: ████████░░░░░░░░░░░░ 40%
```

- Ukazuje, kolik **povinných** otázek jste zodpověděli
- Aktualizuje se automaticky při vyplňování
- 100% znamená, že jsou zodpovězeny všechny povinné otázky

### Indikátor automatického ukládání

V pravém horním rohu se zobrazuje:

| Stav | Význam |
|------|--------|
| 💾 „Automaticky uloženo" | Vaše odpovědi jsou bezpečně uloženy |
| ⏳ „Ukládám..." | Probíhá ukládání |
| ⚠️ „Chyba ukládání" | Problém s připojením, zkuste obnovit stránku |

---

## Vyplňování otázek

### Povinné vs. volitelné otázky

- **Povinné otázky** jsou označeny červenou hvězdičkou *****
- Formulář nelze odeslat bez zodpovězení všech povinných otázek
- Volitelné otázky můžete přeskočit

### Typ 1: Krátký text

Jednořádkové textové pole pro krátké odpovědi.

<!-- Screenshot: Krátký text -->
![Krátký text](screenshots/respondent-04-short-text.png)
*Pole pro krátký text*

**Jak vyplnit:**
1. Klikněte do pole
2. Napište odpověď
3. Přejděte na další otázku (klávesa Tab nebo kliknutí)

**Tipy:**
- Maximální délka je obvykle 255 znaků
- Pokud potřebujete napsat více, použijte pole „Dlouhý text"

### Typ 2: Dlouhý text

Víceřádkové textové pole pro delší odpovědi.

<!-- Screenshot: Dlouhý text -->
![Dlouhý text](screenshots/respondent-05-long-text.png)
*Pole pro dlouhý text*

**Jak vyplnit:**
1. Klikněte do pole
2. Pište libovolně dlouhý text
3. Pole se automaticky zvětšuje podle obsahu

**Tipy:**
- Můžete použít Enter pro nové řádky
- Kopírování a vkládání (Ctrl+C, Ctrl+V) funguje normálně
- Není omezení délky (prakticky do desítek tisíc znaků)

### Typ 3: Výběr jedné možnosti (Radio)

Vyberte přesně jednu možnost ze seznamu.

<!-- Screenshot: Radio buttons -->
![Výběr jedné možnosti](screenshots/respondent-06-radio.png)
*Otázka s výběrem jedné možnosti*

**Jak vyplnit:**
1. Přečtěte si všechny možnosti
2. Klikněte na kroužek vedle zvolené odpovědi
3. Vybraná možnost se zvýrazní

**Důležité:**
- Lze vybrat **pouze jednu** možnost
- Pro změnu klikněte na jinou možnost
- Pokud je otázka povinná, musíte vybrat

### Typ 4: Výběr více možností (Checkbox)

Vyberte libovolný počet možností (i žádnou, pokud není povinná).

<!-- Screenshot: Checkboxes -->
![Výběr více možností](screenshots/respondent-07-checkbox.png)
*Otázka s výběrem více možností*

**Jak vyplnit:**
1. Klikněte na čtvereček u každé relevantní možnosti
2. Zaškrtnuté možnosti mají ✓
3. Opětovným kliknutím zrušíte výběr

**Tipy:**
- Můžete vybrat všechny, některé nebo žádnou možnost
- Pořadí výběru není důležité

### Typ 5: Škála

Vyberte hodnotu na číselné škále.

<!-- Screenshot: Škála -->
![Škála](screenshots/respondent-08-scale.png)
*Škálová otázka*

**Jak vyplnit:**
1. Přečtěte si popisky na krajích škály (např. „Vůbec nesouhlasím" ... „Plně souhlasím")
2. Klikněte na hodnotu, která nejlépe odpovídá vaší odpovědi
3. Nebo použijte posuvník

**Varianty škál:**
- Číselná (1-5, 1-10, 0-100)
- S popisky u hodnot
- S desetinnými čísly (např. 0, 0.25, 0.5, 0.75, 1)

### Typ 6: Nahrání souboru

Přiložte jeden nebo více souborů.

<!-- Screenshot: Nahrání souboru -->
![Nahrání souboru](screenshots/respondent-09-file-upload.png)
*Pole pro nahrání souboru*

Podrobný návod viz sekce [Nahrávání souborů](#nahrávání-souborů).

---

## Nahrávání souborů

### Podporované formáty

Typicky jsou podporovány tyto formáty (může se lišit podle nastavení):

| Kategorie | Formáty |
|-----------|---------|
| Dokumenty | PDF, DOC, DOCX, XLS, XLSX, TXT |
| Obrázky | JPG, JPEG, PNG, GIF |
| Archivy | ZIP, RAR |
| Ostatní | Dle nastavení zadavatelem |

### Omezení velikosti

- **Maximální velikost souboru:** 50 MB (může být nižší)
- **Maximální počet souborů:** Závisí na nastavení otázky (typicky 1-10)

### Způsoby nahrání

#### Způsob 1: Přetažení (Drag & Drop)

1. Otevřete složku se souborem na vašem počítači
2. Přetáhněte soubor myší do označené oblasti
3. Pusťte tlačítko myši

<!-- Screenshot: Drag and drop -->
![Přetažení souboru](screenshots/respondent-10-drag-drop.png)
*Přetažení souboru do oblasti nahrávání*

#### Způsob 2: Výběr souboru

1. Klikněte na odkaz **„vyberte z počítače"** nebo tlačítko **„Vybrat soubor"**
2. V dialogovém okně najděte požadovaný soubor
3. Klikněte na **„Otevřít"**

<!-- Screenshot: Dialog pro výběr souboru -->
![Výběr souboru](screenshots/respondent-11-file-dialog.png)
*Dialogové okno pro výběr souboru*

### Průběh nahrávání

Po výběru souboru uvidíte:

1. **Název souboru** a jeho velikost
2. **Ukazatel průběhu** nahrávání
3. Po dokončení: ✅ zelená značka

<!-- Screenshot: Průběh nahrávání -->
![Průběh nahrávání](screenshots/respondent-12-upload-progress.png)
*Ukazatel průběhu nahrávání souboru*

### Odebrání souboru

Pokud chcete nahrát jiný soubor nebo jste nahráli nesprávný:

1. Najděte nahraný soubor v seznamu
2. Klikněte na tlačítko **„Odebrat"** nebo ikonu 🗑️
3. Potvrďte odebrání

<!-- Screenshot: Odebrání souboru -->
![Odebrání souboru](screenshots/respondent-13-remove-file.png)
*Tlačítko pro odebrání souboru*

### Řešení problémů s nahráváním

| Problém | Příčina | Řešení |
|---------|---------|--------|
| „Soubor je příliš velký" | Překročen limit velikosti | Zmenšete soubor nebo kontaktujte zadavatele |
| „Nepodporovaný formát" | Formát není povolen | Převeďte do podporovaného formátu |
| „Nahrávání selhalo" | Výpadek připojení | Zkuste znovu, obnovte stránku |
| Nahrávání je pomalé | Velký soubor nebo pomalé připojení | Buďte trpěliví, nezavírejte stránku |

---

## Ukládání a přerušení práce

### Automatické ukládání

**Vaše odpovědi se ukládají automaticky** při každé změně. Nemusíte nic dělat.

Jak to funguje:
1. Vyplníte nebo změníte odpověď
2. Po 1-2 sekundách se spustí ukládání
3. Zobrazí se „Ukládám..." a pak „Automaticky uloženo"

<!-- Screenshot: Indikátor ukládání -->
![Automatické ukládání](screenshots/respondent-14-autosave.png)
*Indikátor automatického ukládání*

### Přerušení práce

Můžete bezpečně:
- ✅ Zavřít prohlížeč
- ✅ Vypnout počítač
- ✅ Přejít na jinou stránku
- ✅ Pokračovat za hodinu, za den, za týden

**Vaše odpovědi zůstanou uloženy.**

### Pokračování ve vyplňování

1. Otevřete znovu stejný odkaz
2. Formulář se načte s vašimi uloženými odpověďmi
3. Pokračujte tam, kde jste skončili

<!-- Screenshot: Pokračování -->
![Pokračování ve vyplňování](screenshots/respondent-15-continue.png)
*Formulář s již vyplněnými odpověďmi*

### Důležité upozornění

⚠️ **Pozor na termín!** 

Pokud má dotazník stanoven konečný termín, musíte:
1. **Vyplnit** všechny povinné otázky
2. **Odeslat** formulář před termínem

Pouhé uložení odpovědí nestačí – formulář musí být **odeslán**.

---

## Odeslání formuláře

### Před odesláním

Zkontrolujte:

1. ✅ Všechny povinné otázky jsou zodpovězeny (100% průběh)
2. ✅ Soubory jsou nahrány (pokud požadováno)
3. ✅ Odpovědi jsou správné a kompletní

### Postup odeslání

1. Přejděte na konec formuláře
2. Klikněte na tlačítko **„Odeslat formulář"**

<!-- Screenshot: Tlačítko odeslat -->
![Tlačítko odeslat](screenshots/respondent-16-submit-button.png)
*Tlačítko pro odeslání formuláře*

### Chybějící odpovědi

Pokud jste nevyplnili všechny povinné otázky:

1. Zobrazí se upozornění
2. Formulář se posune k první nevyplněné otázce
3. Doplňte chybějící odpovědi
4. Zkuste odeslat znovu

<!-- Screenshot: Chybějící odpovědi -->
![Chybějící odpovědi](screenshots/respondent-17-validation-error.png)
*Upozornění na nevyplněné povinné otázky*

### Potvrzení odeslání

Po úspěšném odeslání uvidíte:

- ✅ Potvrzovací zprávu
- Datum a čas odeslání
- Případně možnost stáhnout kopii

<!-- Screenshot: Potvrzení -->
![Potvrzení odeslání](screenshots/respondent-18-confirmation.png)
*Potvrzení úspěšného odeslání*

### Po odeslání

⚠️ **Důležité:** Po odeslání formuláře:

- ❌ **Nelze** upravovat odpovědi
- ❌ **Nelze** přidávat nebo mazat soubory
- ❌ **Nelze** odeslat znovu

Pokud potřebujete provést změny, kontaktujte zadavatele dotazníku.

---

## Často kladené otázky

### Obecné otázky

**Q: Mohu vyplnit formulář na mobilu?**
A: Ano, formulář je responzivní a funguje na mobilních zařízeních. Pro nejlepší zážitek doporučujeme tablet nebo počítač.

**Q: Potřebuji se někam přihlašovat?**
A: Ne, váš přístupový odkaz obsahuje unikátní identifikátor. Nepotřebujete uživatelské jméno ani heslo.

**Q: Mohu sdílet svůj odkaz s kolegou?**
A: Odkaz je přiřazen vaší organizaci. O sdílení se poraďte se zadavatelem dotazníku.

**Q: V jakém jazyce mohu vyplnit dotazník?**
A: Rozhraní podporuje češtinu, slovenštinu a angličtinu. Jazyk lze přepnout v pravém horním rohu. Vaše odpovědi můžete psát v libovolném jazyce.

### Otázky k ukládání

**Q: Ztratím odpovědi, když zavřu prohlížeč?**
A: Ne, odpovědi se ukládají automaticky. Při návratu je najdete vyplněné.

**Q: Jak poznám, že se odpovědi uložily?**
A: V rohu uvidíte „Automaticky uloženo" se zelenou značkou.

**Q: Co když nemám internet během vyplňování?**
A: Odpovědi se uloží, jakmile se připojení obnoví. Nezavírejte stránku.

### Otázky k souborům

**Q: Jaké soubory mohu nahrát?**
A: Závisí na nastavení dotazníku. Typicky PDF, Word, Excel, obrázky.

**Q: Mohu nahrát více souborů k jedné otázce?**
A: Ano, pokud to otázka umožňuje. Maximum uvidíte u otázky.

**Q: Mohu nahrát ZIP archiv?**
A: Obvykle ano, ověřte u konkrétního dotazníku.

### Otázky k odeslání

**Q: Mohu upravit odpovědi po odeslání?**
A: Ne, po odeslání jsou odpovědi uzamčeny. Kontaktujte zadavatele.

**Q: Dostanu potvrzení e-mailem?**
A: Závisí na nastavení. Vždy vidíte potvrzení na obrazovce.

**Q: Co když odešlu omylem?**
A: Kontaktujte zadavatele dotazníku co nejdříve.

---

## Řešení problémů

### Problém: Stránka se nenačítá

**Příznaky:** Bílá stránka, chyba 404, „Stránka nenalezena"

**Řešení:**
1. Zkontrolujte správnost odkazu (překlepnutí, chybějící znaky)
2. Zkuste obnovit stránku (F5 nebo Ctrl+R)
3. Vymažte mezipaměť prohlížeče (Ctrl+Shift+Delete)
4. Zkuste jiný prohlížeč
5. Kontaktujte zadavatele

### Problém: Formulář se zobrazuje, ale nejde vyplnit

**Příznaky:** Pole jsou neaktivní, nejde psát

**Řešení:**
1. Možná jste již odeslali – zkontrolujte stav
2. Možná vypršel termín – kontaktujte zadavatele
3. Zkuste obnovit stránku
4. Vypněte blokátor reklam/rozšíření

### Problém: Změny se neukládají

**Příznaky:** Nezobrazuje se „Automaticky uloženo", po obnovení chybí odpovědi

**Řešení:**
1. Zkontrolujte připojení k internetu
2. Počkejte a zkuste znovu
3. Nepoužívejte anonymní/inkognito režim (může blokovat ukládání)
4. Zkuste jiný prohlížeč

### Problém: Nelze nahrát soubor

**Příznaky:** Chybová zpráva při nahrávání, soubor se neobjeví

**Řešení:**
1. Zkontrolujte velikost souboru (max 50 MB)
2. Ověřte formát souboru
3. Zkuste soubor přejmenovat (odstranit speciální znaky)
4. Zkuste jiný soubor

### Problém: Tlačítko „Odeslat" nejde kliknout

**Příznaky:** Tlačítko je šedé, neklikatelné

**Řešení:**
1. Vyplňte všechny povinné otázky (označené *)
2. Najeďte průběh na 100%
3. Obnovte stránku a zkuste znovu

### Kontakt na podporu

Pokud problémy přetrvávají, připravte si:

- 📝 Popis problému
- 📸 Screenshot chyby (pokud možno)
- 🔗 Přístupový odkaz (nebo jeho část)
- 💻 Použitý prohlížeč a operační systém

Kontaktujte zadavatele dotazníku prostřednictvím kontaktních údajů v původním e-mailu.

---

## Klávesové zkratky

Pro rychlejší vyplňování můžete použít:

| Zkratka | Akce |
|---------|------|
| `Tab` | Přesun na další pole |
| `Shift + Tab` | Přesun na předchozí pole |
| `Mezerník` | Vybrat/zrušit checkbox |
| `↑` `↓` | Pohyb mezi možnostmi (radio/checkbox) |
| `Enter` | Potvrdit (v jednořádkovém poli) |
| `Ctrl + V` | Vložit zkopírovaný text |

---

## Shrnutí

### Postup vyplnění v 5 krocích

1. **Otevřete odkaz** z e-mailu
2. **Vyplňte otázky** – odpovědi se ukládají automaticky
3. **Nahrajte soubory** (pokud požadováno)
4. **Zkontrolujte odpovědi** – vraťte se a opravte
5. **Odešlete formulář** tlačítkem na konci

### Zapamatujte si

✅ Odpovědi se ukládají automaticky
✅ Můžete kdykoliv přerušit a pokračovat
✅ Povinné otázky jsou označeny *
⚠️ Po odeslání nelze měnit
⚠️ Nezapomeňte odeslat před termínem!

---

*Příručka pro respondenty v1.0 | DRP – Data Request Portal | Prosinec 2025*
