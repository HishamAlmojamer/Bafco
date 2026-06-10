# دليل رفع موقع BAFCO على Vercel

## المتطلبات الأساسية
1. حساب على [Vercel](https://vercel.com) (مجاني)
2. حساب على [Supabase](https://supabase.com) (مجاني - لقاعدة البيانات PostgreSQL)
3. حساب على [GitHub](https://github.com) (لربط الكود)

---

## الخطوة 1: إنشاء قاعدة بيانات PostgreSQL على Supabase

1. سجل دخول إلى https://supabase.com
2. اضغط "New project"
3. اختر اسم المشروع (مثل `bafco-db`)
4. اختر كلمة مرور قوية واحفظها
5. اختر المنطقة الأقرب لك (مثل `EU West`)
6. انتظر حتى يتم إنشاء المشروع (1-2 دقيقة)
7. اذهب إلى **Project Settings → Database → Connection string**
8. انسخ رابط `URI` (يبدأ بـ `postgresql://...`)

## الخطوة 2: رفع الكود إلى GitHub

```bash
# إنشاء مستودع على GitHub أولاً، ثم:
git remote add origin https://github.com/<your-username>/bafco-website.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## الخطوة 3: ربط Vercel

1. اذهب إلى https://vercel.com
2. اضغط "Add New → Project"
3. اختر مستودع GitHub `bafco-website`
4. في إعدادات المشروع:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (الافتراضي)
   - **Build Command**: (سيتم استخدامه من `vercel.json`)
   - **Output Directory**: (سيتم استخدامه من `vercel.json`)

5. أضف **Environment Variables**:
   | Variable | القيمة |
   |----------|--------|
   | `DATABASE_URL` | رابط PostgreSQL من Supabase |
   | `JWT_SECRET` | كلمة سر قوية (مثل `bafco_jwt_secret_2024_xyz`) |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | رابط موقعك على Vercel (مثل `https://bafco.vercel.app`) |

6. اضغط "Deploy"

## الخطوة 4: ترحيل قاعدة البيانات

بعد نجاح النشر، شغّل ترحيل Prisma:

```bash
# في جهازك المحلي:
cd server
set DATABASE_URL=<رابط PostgreSQL>
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

أو استخدم Vercel CLI:

```bash
npx vercel env pull
cd server
npx prisma db push
npx tsx prisma/seed.ts
```

## الخطوة 5: تحديث عنوان API

في ملف `client/vite.config.ts`، عنوان API يجب أن يشير إلى الخادم الجديد. ولكن بما أننا نستخدم Vercel serverless functions مع المسار `/api`، لا حاجة لتعديل (لأن الكود يستخدم `/api/...` نسبياً).

---

## ملاحظات مهمة

### ❌ SQLite لا يعمل على Vercel
- سبب: Vercel serverless functions لا تملك نظام ملفات دائم
- الحل: استخدم PostgreSQL عبر Supabase (مجاني 500MB)

### ❌ رفع الملفات لا يعمل على Vercel
- سبب: multer يخزن الملفات على القرص
- الحل للرفع الفوري: استخدم خدمة تخزين سحابي مثل Cloudinary أو AWS S3

### بديل: نشر Backend على Railway.app
إذا كنت تريد استخدام SQLite، انشر الخادم الخلفي على Railway.app (يدعم تخزين دائم مجاناً):
1. ارفع مشروع `server/` إلى Railway
2. استخدم `DATABASE_URL=file:./prisma/dev.db`
3. الواجهة الأمامية تبقى على Vercel
4. غير `CORS_ORIGIN` إلى رابط Vercel

---

## بعد النشر - التحقق

- **API Health**: https://bafco.vercel.app/api/health
- **الموقع**: https://bafco.vercel.app
- **لوحة التحكم**: https://bafco.vercel.app/login
  - البريد: `admin@bafco.com`
  - كلمة المرور: `Admin@12345`
