# DRP Uživatelský manuál

## Obsah

1. [Úvod](#úvod)
2. [Začínáme](#začínáme)
3. [Vytvoření dotazníku](#vytvoření-dotazníku)
4. [Tvorba otázek](#tvorba-otázek)
5. [Správa respondentů](#správa-respondentů)
6. [Sběr odpovědí](#sběr-odpovědí)
7. [Export dat](#export-dat)
8. [Průvodce pro respondenty](#průvodce-pro-respondenty)

---

## Úvod

DRP (Data Request Portal) je webová aplikace pro vytváření a správu dotazníků pro sběr dat. Umožňuje:

- Vytvářet strukturované dotazníky s různými typy otázek
- Spravovat respondenty a generovat unikátní přístupové odkazy
- Sbírat odpovědi s automatickým ukládáním
- Exportovat data v různých formátech (CSV, Excel, ZIP)

### Podporované jazyky

Aplikace podporuje tři jazyky:
- 🇨🇿 Čeština (výchozí)
- 🇸🇰 Slovenština
- 🇬🇧 Angličtina

Jazyk lze přepínat pomocí tlačítka v pravém horním rohu.

---

## Začínáme

### Přihlášení

1. Přejděte na URL aplikace
2. Klikněte na **„Přihlásit se"**
3. Zadejte e-mail a heslo
4. Klikněte na **„Přihlásit"**

<!-- Screenshot: Přihlašovací stránka -->
![Přihlášení](screenshots/01-login.png)
*Přihlašovací stránka*

### Přehled hlavní stránky

Po přihlášení uvidíte hlavní přehled se seznamem všech dotazníků.

<!-- Screenshot: Hlavní přehled -->
![Přehled](screenshots/02-dashboard.png)
*Hlavní přehled se seznamem dotazníků*

Přehled zobrazuje:
- **Název dotazníku** - Kliknutím otevřete
- **Kód** - Unikátní identifikátor (např. QNR-2025-ABCD1234)
- **Respondenti** - Celkový počet respondentů
- **Otevřeno** - Kolik respondentů otevřelo formulář
- **Odpovědi** - Počet odeslaných odpovědí
- **Poslední úprava** - Datum poslední změny

---

## Vytvoření dotazníku

### Krok 1: Nový dotazník

1. Klikněte na tlačítko **„Nový dotazník"** (ikona +)
2. Zadejte název dotazníku
3. Volitelně přidejte popis
4. Klikněte na **„Vytvořit dotazník"**

<!-- Screenshot: Formulář pro vytvoření -->
![Vytvořit dotazník](screenshots/03-create-questionnaire.png)
*Formulář pro vytvoření nového dotazníku*

### Krok 2: Přehled dotazníku

Po vytvoření budete přesměrováni na přehled dotazníku, který zobrazuje:
- Statistiky (respondenti, otevřeno, rozpracováno, odpovědi)
- Rychlé akce
- Možnosti exportu
- Historii verzí

<!-- Screenshot: Přehled dotazníku -->
![Přehled dotazníku](screenshots/04-questionnaire-overview.png)
*Přehled dotazníku se statistikami*

---

## Tvorba otázek

### Přístup do editoru

1. Z přehledu dotazníku klikněte na **„Upravit dotazník"** nebo záložku **„Editor"**
2. Zobrazí se rozhraní editoru otázek

<!-- Screenshot: Editor otázek -->
![Editor otázek](screenshots/05-question-builder.png)
*Rozhraní editoru otázek*

### Přidání bloku

Otázky jsou organizovány do bloků (sekcí). Pro přidání bloku:

1. Klikněte na **„Přidat blok"** v dolní části editoru
2. Zadejte název bloku
3. Volitelně přidejte popis

<!-- Screenshot: Přidání bloku -->
![Přidat blok](screenshots/06-add-block.png)
*Přidání nového bloku otázek*

### Přidání otázek

1. V rámci bloku klikněte na jedno z tlačítek typu otázky:
   - **Krátký text** - Jednořádkový textový vstup
   - **Dlouhý text** - Víceřádkové textové pole
   - **Výběr jedné možnosti** - Přepínače (jedna volba)
   - **Výběr více možností** - Zaškrtávací políčka
   - **Škála** - Číselná škála s volitelným popisky
   - **Nahrání souboru** - Možnost přiložit soubor

2. Kliknutím na otázku rozbalíte její nastavení

<!-- Screenshot: Typy otázek -->
![Typy otázek](screenshots/07-question-types.png)
*Dostupné typy otázek*

### Nastavení otázky

Každá otázka má tato nastavení:

| Nastavení | Popis |
|-----------|-------|
| **Popisek** | Text otázky zobrazený respondentům |
| **Proměnná** | Interní název pro export dat |
| **Povinná** | Zda musí být otázka zodpovězena |
| **Popis** | Volitelný nápovědný text |

<!-- Screenshot: Nastavení otázky -->
![Nastavení otázky](screenshots/08-question-settings.png)
*Panel nastavení otázky*

### Otázky s výběrem (Radio/Checkbox)

Pro otázky s výběrem můžete přidávat možnosti:

1. Klikněte na **„Přidat možnost"**
2. Zadejte popisek možnosti (zobrazeno uživateli)
3. Hodnota (pro export) je generována automaticky

<!-- Screenshot: Možnosti výběru -->
![Možnosti výběru](screenshots/09-choice-options.png)
*Přidání možností k otázce s výběrem*

### Škálové otázky

Škálové otázky umožňují číselný vstup s těmito nastaveními:

| Nastavení | Popis |
|-----------|-------|
| **Minimum** | Nejnižší hodnota na škále |
| **Maximum** | Nejvyšší hodnota na škále |
| **Krok** | Přírůstek mezi hodnotami |
| **Popisky** | Volitelné popisky pro konkrétní hodnoty |

<!-- Screenshot: Konfigurace škály -->
![Konfigurace škály](screenshots/10-scale-config.png)
*Nastavení škálové otázky*

### Ukládání změn

Změny se ukládají automaticky. Uvidíte:
- **„Ukládám..."** - Během ukládání
- **„Uloženo"** - Když jsou změny uloženy

---

## Správa respondentů

### Přístup ke správě respondentů

1. Klikněte na záložku **„Respondenti"** v editoru dotazníku
2. Zobrazí se seznam všech respondentů

<!-- Screenshot: Správa respondentů -->
![Správa respondentů](screenshots/11-respondent-manager.png)
*Rozhraní pro správu respondentů*

### Přidání jednoho respondenta

1. Klikněte na **„Přidat respondenta"**
2. Vyplňte formulář:
   - **Název** (povinné) - Název firmy nebo jméno osoby
   - **IČO** (volitelné)
   - **E-mail** (volitelný)
   - **Interní poznámka** (volitelná) - Není viditelná respondentovi
   - **Platnost od/do** - Časové okno přístupu

3. Klikněte na **„Přidat"**

<!-- Screenshot: Přidání respondenta -->
![Přidat respondenta](screenshots/12-add-respondent.png)
*Formulář pro přidání respondenta*

### Import více respondentů

1. Klikněte na **„Přidat více"**
2. Zadejte respondenty ve formátu CSV:
   ```
   Firma 1, 12345678, email1@example.com
   Firma 2, 87654321, email2@example.com
   ```
3. Klikněte na **„Importovat"**

<!-- Screenshot: Import respondentů -->
![Import respondentů](screenshots/13-import-respondents.png)
*Rozhraní hromadného importu*

### Kopírování přístupových odkazů

Každý respondent má unikátní přístupový odkaz:

1. Najděte respondenta v seznamu
2. Klikněte na **ikonu kopírování** vedle jeho tokenu
3. Odkaz je zkopírován do schránky

Formát odkazu: `https://vasedomena.cz/r/{token}`

<!-- Screenshot: Kopírování odkazu -->
![Kopírování odkazu](screenshots/14-copy-link.png)
*Kopírování přístupového odkazu respondenta*

### Stavy respondentů

| Stav | Popis |
|------|-------|
| 🔵 **Neotevřeno** | Odkaz ještě nebyl otevřen |
| 👁️ **Zobrazeno** | Formulář otevřen, ale nezačato |
| ✏️ **Rozpracováno** | Částečně vyplněno |
| ✅ **Odesláno** | Formulář odeslán |
| 🔒 **Uzamčeno** | Přístup zrušen |

### Hromadné operace

1. Vyberte více respondentů pomocí zaškrtávacích políček
2. Klikněte na **„Hromadné akce"**
3. Vyberte akci:
   - Aktualizovat data platnosti
   - Smazat vybrané

<!-- Screenshot: Hromadné akce -->
![Hromadné akce](screenshots/15-bulk-actions.png)
*Menu hromadných operací*

---

## Sběr odpovědí

### Sledování průběhu

Záložka **„Odpovědi"** zobrazuje:
- Statistiky odeslaných odpovědí
- Ukazatel průběhu
- Poslední odeslaná
- Možnosti exportu

<!-- Screenshot: Přehled odpovědí -->
![Přehled odpovědí](screenshots/16-responses-overview.png)
*Přehled sběru odpovědí*

### Zobrazení jednotlivých odpovědí

1. Klikněte na jméno respondenta v seznamu odeslaných
2. Zobrazíte všechny jeho odpovědi
3. Uvidíte nahrané soubory

<!-- Screenshot: Zobrazení odpovědi -->
![Zobrazení odpovědi](screenshots/17-view-submission.png)
*Prohlížeč jednotlivých odpovědí*

---

## Export dat

### Formáty exportu

| Formát | Popis |
|--------|-------|
| **CSV** | Jednoduchý tabulkový formát, jeden řádek na respondenta |
| **Excel (XLSX)** | Více listů s odpověďmi, otázkami a seznamem souborů |
| **ZIP balíček** | Excel soubor + všechny nahrané soubory |

### Export

1. Přejděte na přehled dotazníku nebo stránku odpovědí
2. Klikněte na požadované tlačítko exportu
3. Soubor se automaticky stáhne

<!-- Screenshot: Možnosti exportu -->
![Možnosti exportu](screenshots/18-export-options.png)
*Možnosti formátu exportu*

### Formát CSV

CSV soubor obsahuje:
- Záhlaví s názvy proměnných otázek
- Jeden řádek na respondenta
- Všechny odpovědi ve sloupcích

### Formát Excel

Excel soubor obsahuje více listů:
- **Odpovědi** - Všechny odpovědi
- **Otázky** - Definice otázek
- **Soubory** - Seznam nahraných souborů

---

## Průvodce pro respondenty

Tato sekce je určena respondentům, kteří vyplňují dotazník.

### Přístup k formuláři

1. Klikněte na odkaz, který jste obdrželi
2. Formulář se otevře ve vašem prohlížeči

<!-- Screenshot: Formulář respondenta -->
![Formulář respondenta](screenshots/19-respondent-form.png)
*Formulář dotazníku pro respondenty*

### Vyplnění formuláře

1. Odpovězte na všechny otázky označené ***** (povinné)
2. Váš průběh je zobrazen nahoře
3. Odpovědi se **ukládají automaticky** - můžete odejít a vrátit se později

<!-- Screenshot: Průběh formuláře -->
![Průběh formuláře](screenshots/20-form-progress.png)
*Ukazatel průběhu a automatické ukládání*

### Nahrávání souborů

Pro otázky s nahráním souboru:

1. Klikněte na **„Vybrat soubor"** nebo přetáhněte soubor
2. Počkejte na dokončení nahrávání
3. Soubory můžete před odesláním odebrat

<!-- Screenshot: Nahrání souboru -->
![Nahrání souboru](screenshots/21-file-upload.png)
*Rozhraní pro nahrání souboru*

### Odeslání

1. Zkontrolujte všechny své odpovědi
2. Klikněte na **„Odeslat formulář"**
3. Zobrazí se potvrzující zpráva

⚠️ **Poznámka:** Po odeslání již nemůžete své odpovědi upravovat.

<!-- Screenshot: Potvrzení odeslání -->
![Potvrzení odeslání](screenshots/22-submit-confirmation.png)
*Potvrzení odeslání*

---

## Řešení problémů

### Časté problémy

| Problém | Řešení |
|---------|--------|
| Nelze přistoupit k formuláři | Zkontrolujte, zda odkaz nevypršel |
| Změny se neukládají | Zkontrolujte připojení k internetu |
| Export selhává | Ujistěte se, že existuje alespoň jedna odeslaná odpověď |
| Nahrání souboru selhává | Zkontrolujte velikost souboru (max 50 MB) |

### Kontakt podpory

V případě problémů kontaktujte svého administrátora.

---

## Klávesové zkratky

| Zkratka | Akce |
|---------|------|
| `Tab` | Přesun na další pole |
| `Shift + Tab` | Přesun na předchozí pole |
| `Enter` | Odeslat (na posledním poli) |
| `Esc` | Zavřít modální okna |

---

*DRP Uživatelský manuál v1.0 | Poslední aktualizace: Prosinec 2025*
