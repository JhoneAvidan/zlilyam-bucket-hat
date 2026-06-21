# 🧢 כובעי סוף שנה — סקר ועד ההורים

אפליקציית עמוד אחד (single `index.html`) לאיסוף מידות כובע ואיות שמות לכל ילד/ה בגן,
לקראת מתנת סוף השנה. עברית מלאה, RTL, מותאם לנייד.

- **Frontend:** `index.html` — מתארח חינם ב‑GitHub Pages.
- **Backend:** `Code.gs` — Google Apps Script Web App שכותב לגיליון אחד של הוועד.

כל ההורים קוראים/כותבים לאותו מקור אמת; הוועד רואה הכול בגיליון.

---

## חלק א׳ — הקמת ה‑Backend (Google Sheet + Apps Script)

1. **צרו גיליון חדש:** היכנסו ל‑[sheets.new](https://sheets.new) ותנו לו שם, למשל `כובעי סוף שנה — תשובות`.
2. בתפריט: **Extensions → Apps Script** (תוספים → Apps Script).
3. מחקו את הקוד לדוגמה ב‑`Code.gs`, והדביקו את כל התוכן מהקובץ **`Code.gs`** שבריפו הזה.
4. לחצו **Save** (אייקון הדיסקט).
5. למעלה לחצו **Deploy → New deployment** (פריסה → פריסה חדשה).
6. ליד "Select type" לחצו על גלגל השיניים ⚙️ ובחרו **Web app**.
7. הגדירו:
   - **Description:** `survey backend` (לא חובה)
   - **Execute as:** `Me` (הכתובת שלכם)
   - **Who has access:** **Anyone** ← חשוב! כך הדף הסטטי יכול לפנות לשרת.
8. לחצו **Deploy**. בפעם הראשונה תתבקשו **Authorize access** → בחרו את חשבון הגוגל שלכם →
   אם מופיע "Google hasn't verified this app" לחצו **Advanced → Go to … (unsafe)** → **Allow**.
   (זה הקוד שלכם, זה בטוח.)
9. העתיקו את ה‑**Web app URL** — הוא נראה כך:
   `https://script.google.com/macros/s/AKfy…/exec`

> 🔁 **עדכנתם את הקוד אחר כך?** חובה לעשות **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**,
> אחרת השינויים לא נכנסים לתוקף. ה‑URL נשאר זהה.

הגיליון ייווצר אוטומטית עם לשונית בשם `Responses` ושורת כותרות בפעם הראשונה שמישהו שולח.

---

## חלק ב׳ — חיבור ה‑Frontend

1. פתחו את `index.html`.
2. בראש ה‑`<script>` החליפו את השורה:
   ```js
   const SCRIPT_URL = "PASTE_HERE";
   ```
   בכתובת שהעתקתם, למשל:
   ```js
   const SCRIPT_URL = "https://script.google.com/macros/s/AKfy…/exec";
   ```
3. (לא חובה) ערכו את מערך `CHILDREN` אם צריך להוסיף/לתקן שמות.

---

## חלק ג׳ — פרסום ב‑GitHub Pages

1. צרו ריפו חדש ב‑GitHub (למשל `zlilyam-bucket-hat`) והעלו אליו את `index.html`.
2. בריפו: **Settings → Pages**.
3. תחת **Build and deployment → Source** בחרו **Deploy from a branch**.
4. **Branch:** `main`, תיקייה `/ (root)` → **Save**.
5. אחרי דקה‑שתיים הכתובת תופיע למעלה:
   `https://<שם-המשתמש>.github.io/zlilyam-bucket-hat/`
6. שלחו את הקישור להורים בווטסאפ 🎉

---

## איך זה עובד

- **בטעינה** הדף עושה `GET` ל‑Web App, מקבל את כל התשובות הקיימות ומסמן ✓ ירוק + המידה
  על כל ילד/ה שכבר מולא — כך רואים התקדמות וכל הורה רואה מה כבר נעשה.
- **בשליחה** הדף עושה `POST` עם `Content-Type: text/plain` (כדי להימנע מ‑CORS preflight
  ש‑Apps Script לא תומך בו), והשרת מוסיף שורה — או **מעדכן** את השורה הקיימת לאותו `id`,
  כך שאין כפילויות וניתן לתקן בכל עת.
- ה‑UI מתעדכן אופטימית מיד, ומבצע rollback אם השליחה נכשלה.

## עמודות הגיליון

| id | he | en | corrected | finalName | spellingCorrect | hatSize | timestamp | updatedAt |
|----|----|----|-----------|-----------|-----------------|---------|-----------|-----------|

- `corrected` — איות **אנגלי** מתוקן (ריק אם ההורה השאיר את האיות המקורי)
- `finalName` — השם **באנגלית** להדפסה על המתנה (המתוקן אם קיים, אחרת ה‑`en` המקורי)
- `hatSize` — אחת מהמידות: `12-24m, 2-4, 4-6` (12–24 חודשים / 2–4 שנים / 4–6 שנים)

## בדיקה מקומית

אפשר לפתוח את `index.html` ישירות בדפדפן. ה‑`GET`/`POST` יעבדו מול ה‑Web App
ברגע ש‑`SCRIPT_URL` מוגדר (Apps Script מאפשר גישה גם מ‑`file://` / `localhost`).
