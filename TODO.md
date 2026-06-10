# TODO - تغيير الهوية من سدافكو إلى موقع لمصنع بافكو

## الخطوة 1: إعداد خطة التعديل
- [x] فحص أماكن ظهور SADAFCO / سدافكو في العميل والصفحات الثابتة.
- [x] تحديد الملفات المرشحة للتعديل.
- [x] تحديد الاسم المطلوب: باڤكو / BAFCO.

## الخطوة 2: تجهيز التغيير البرمجي (بدون تنفيذ بعد)
- [x] تحديث `client/src/components/layout/Header.tsx` و`Footer.tsx` (الاسم، الشعار، البريد، حقوق النشر).
- [x] تحديث `client/src/i18n/ar.json` و`en.json` (نصوص فيها SADAFCO).
- [x] تحديث صفحات التقديم/الهوية البصرية في `client/src/components/home/*` (SADAFCO strings مثل: "At SADAFCO" و"SADAFCO Sustainability Report").
- [x] تحديث النصوص الثابتة في `web/index.html`, `web/products.html`, `web/login.html`, `web/register.html`.
- [x] تحديث ألوان Tailwind: `client/tailwind.config.js` (إعادة تسمية palette من sadafco-* إلى bafco-* أو تعديل قيمها).
- [x] تحديث `client/src/index.css` (container/gradients/buttons إن لزم).

## الخطوة 3: تطبيق التعديلات
- [x] تعديل الملفات حسب الخطة (تم التنفيذ).

## الخطوة 4: تحقق
- [x] إعادة البحث عن أي بقايا SADAFCO/sadafco داخل المشروع.

