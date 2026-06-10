import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SkeletonCard, EmptyState, Badge, ConfirmDialog } from '../components/ui';
import {
  auth as authApi,
  products as productsApi,
  categories as categoriesApi,
  careers as careersApi,
  contact as contactApi,
  orders as ordersApi,
  investors as investorsApi,
} from '../services/api';
import type {
  Product,
  Category,
  User,
  Job,
  JobApplication,
  ContactInquiry,
  B2BInquiry,
  Order,
  InvestorDocument,
} from '../types';

// ==================== PRODUCTS MANAGER (ADMIN) ====================
function ProductManager() {
  const { t, locale } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState(0);
  const [sku, setSku] = useState('');
  const [unitSize, setUnitSize] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productsApi.list({ take: 100 }),
        categoriesApi.list(),
      ]);
      setProducts(prodRes.items);
      setCategories(catRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddForm = () => {
    setEditingProduct(null);
    setNameAr(''); setNameEn(''); setSlug(''); setPrice(0);
    setSku(''); setUnitSize(''); setCategoryId(categories[0]?.id);
    setDescriptionAr(''); setDescriptionEn('');
    setImageFile(null); setImagePreview(''); setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setNameAr(p.nameAr || ''); setNameEn(p.nameEn || '');
    setSlug(p.slug || ''); setPrice(p.price || 0);
    setSku(p.sku || ''); setUnitSize(p.unitSize || '');
    setCategoryId(p.categoryId);
    setDescriptionAr(p.descriptionAr || ''); setDescriptionEn(p.descriptionEn || '');
    setImageFile(null); setImagePreview(p.imageUrl || ''); setFormError('');
    setFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!nameAr || !nameEn) { setFormError('Arabic and English names are required'); return; }
    const formData = new FormData();
    formData.append('nameAr', nameAr); formData.append('nameEn', nameEn);
    if (slug) formData.append('slug', slug);
    formData.append('price', String(price));
    if (sku) formData.append('sku', sku); if (unitSize) formData.append('unitSize', unitSize);
    if (categoryId) formData.append('categoryId', String(categoryId));
    formData.append('descriptionAr', descriptionAr); formData.append('descriptionEn', descriptionEn);
    if (imageFile) formData.append('image', imageFile);
    try {
      if (editingProduct) { await productsApi.update(editingProduct.id, formData); }
      else { await productsApi.create(formData); }
      setFormOpen(false); fetchData();
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Save failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;
    try { await productsApi.delete(id); fetchData(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{locale === 'ar' ? 'إدارة المنتجات' : 'Products Manager'}</h2>
        {!formOpen && <button onClick={openAddForm} className="btn-primary !px-4 !py-2 text-sm">{locale === 'ar' ? '+ إضافة منتج' : '+ Add Product'}</button>}
      </div>
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 border border-gray-200 rounded-2xl p-6 bg-gray-50 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">{editingProduct ? (locale === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (locale === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Arabic Name</label><input type="text" className="input-field mt-1" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">English Name</label><input type="text" className="input-field mt-1" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Slug</label><input type="text" className="input-field mt-1" placeholder="e.g. bafco-fresh-milk" value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Category</label><select className="input-field mt-1" value={categoryId || ''} onChange={(e) => setCategoryId(Number(e.target.value))}>{categories.map((c) => <option key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.nameEn}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700">Price (SAR)</label><input type="number" step="0.01" className="input-field mt-1" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
            <div><label className="block text-sm font-medium text-gray-700">SKU</label><input type="text" className="input-field mt-1" placeholder="BAF-MILK-100" value={sku} onChange={(e) => setSku(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Unit Size</label><input type="text" className="input-field mt-1" placeholder="e.g. 1L, 200g" value={unitSize} onChange={(e) => setUnitSize(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Product Image</label><input type="file" accept="image/*" className="mt-2 text-sm" onChange={handleFileChange} />{imagePreview && <img src={imagePreview.startsWith('http') || imagePreview.startsWith('/') ? imagePreview : imagePreview} alt="Preview" className="mt-3 h-20 w-20 object-cover rounded-lg border" />}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Arabic Description</label><textarea rows={3} className="input-field mt-1" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700">English Description</label><textarea rows={3} className="input-field mt-1" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} /></div>
          </div>
          {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
            <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Save</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Image</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">{locale === 'ar' ? 'Name (AR)' : 'Name'}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">{p.imageUrl ? <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover border" /> : <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">{p.nameAr?.charAt(0) || '?'}</div>}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{locale === 'ar' ? p.nameAr : p.nameEn}</td>
                <td className="px-4 py-3 text-gray-500">{p.category ? (locale === 'ar' ? p.category.nameAr : p.category.nameEn) : '-'}</td>
                <td className="px-4 py-3 font-medium">SAR {p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEditForm(p)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs mr-2">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-medium text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="text-center text-gray-500 py-10">No products yet.</p>}
    </div>
  );
}

// ==================== CATEGORY MANAGER (ADMIN) ====================
function CategoryManager() {
  const { locale } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameAr, setNameAr] = useState(''); const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState(''); const [sortOrder, setSortOrder] = useState(0);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try { const data = await categoriesApi.list(); setCategories(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchCategories(); }, []);

  const openAddForm = () => { setEditingCategory(null); setNameAr(''); setNameEn(''); setSlug(''); setSortOrder(0); setFormError(''); setFormOpen(true); };
  const openEditForm = (c: Category) => { setEditingCategory(c); setNameAr(c.nameAr); setNameEn(c.nameEn); setSlug(c.slug); setSortOrder(c.sortOrder); setFormError(''); setFormOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!nameAr || !nameEn || !slug) { setFormError('All fields (Arabic, English names, and Slug) are required'); return; }
    const payload = { nameAr, nameEn, slug, sortOrder };
    try {
      if (editingCategory) { await categoriesApi.update(editingCategory.id, payload); }
      else { await categoriesApi.create(payload); }
      setFormOpen(false); fetchCategories();
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Save failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا التصنيف؟' : 'Are you sure you want to delete this category?')) return;
    try { await categoriesApi.delete(id); fetchCategories(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{locale === 'ar' ? 'إدارة التصنيفات' : 'Categories Manager'}</h2>
        {!formOpen && <button onClick={openAddForm} className="btn-primary !px-4 !py-2 text-sm">{locale === 'ar' ? '+ إضافة تصنيف' : '+ Add Category'}</button>}
      </div>
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 border border-gray-200 rounded-2xl p-6 bg-gray-50 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Arabic Name</label><input type="text" className="input-field mt-1" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">English Name</label><input type="text" className="input-field mt-1" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Slug</label><input type="text" className="input-field mt-1" placeholder="e.g. juices-and-drinks" value={slug} onChange={(e) => setSlug(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Sort Order</label><input type="number" className="input-field mt-1" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
          </div>
          {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <div className="flex gap-3 justify-end mt-4">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
            <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Save</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">ID</th><th className="px-4 py-3 text-left font-medium text-gray-500">Name (AR)</th><th className="px-4 py-3 text-left font-medium text-gray-500">Name (EN)</th><th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th><th className="px-4 py-3 text-left font-medium text-gray-500">Products</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-gray-400">{c.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.nameAr}</td>
                <td className="px-4 py-3 text-gray-900">{c.nameEn}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-gray-500 font-medium">{c._count?.products ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEditForm(c)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs mr-2">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 font-medium text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== JOB APPLICATIONS MANAGER (ADMIN) ====================
function CareersManager() {
  const { locale } = useTranslation();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try { const data = await careersApi.listApplications(); if (data && data.items) setApplications(data.items); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchApplications(); }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try { await careersApi.updateApplicationStatus(id, status); fetchApplications(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to update status'); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">{locale === 'ar' ? 'طلبات التوظيف المستلمة' : 'Job Applications'}</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-3 text-left font-medium text-gray-500">Applicant</th><th className="px-4 py-3 text-left font-medium text-gray-500">Position</th><th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th><th className="px-4 py-3 text-left font-medium text-gray-500">CV</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-right font-medium text-gray-500">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-gray-900">{app.fullNameAr}</div>
                  {app.fullNameEn && <div className="text-xs text-gray-400">{app.fullNameEn}</div>}
                  <div className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{app.job ? (locale === 'ar' ? app.job.titleAr : app.job.titleEn) : `Job #${app.jobId}`}</td>
                <td className="px-4 py-3"><div className="text-gray-900">{app.email}</div><div className="text-xs text-gray-500" dir="ltr">{app.phone}</div></td>
                <td className="px-4 py-3"><a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-bold text-xs">Download CV</a></td>
                <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : app.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' : app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' : app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'}`}>{app.status}</span></td>
                <td className="px-4 py-3 text-right"><select className="input-field !py-1 !px-2 text-xs" value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)}><option value="PENDING">Pending</option><option value="REVIEWED">Reviewed</option><option value="SHORTLISTED">Shortlisted</option><option value="REJECTED">Rejected</option><option value="HIRED">Hired</option></select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {applications.length === 0 && <p className="text-center text-gray-500 py-10">No applications received yet.</p>}
    </div>
  );
}

// ==================== INQUIRIES MANAGER (ADMIN) ====================
function InquiriesManager() {
  const { locale } = useTranslation();
  const [inqTab, setInqTab] = useState<'general' | 'b2b'>('general');
  const [generalInquiries, setGeneralInquiries] = useState<ContactInquiry[]>([]);
  const [b2bInquiries, setB2BInquiries] = useState<B2BInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    try { const data = await contactApi.listInquiries(); if (data) { setGeneralInquiries(data.contact); setB2BInquiries(data.b2b); } }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchInquiries(); }, []);

  const handleMarkAsRead = async (id: number, type: 'contact' | 'b2b') => {
    try { await contactApi.markInquiryRead(id, type); fetchInquiries(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to update'); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">{locale === 'ar' ? 'الرسائل والاستفسارات المستلمة' : 'Inquiries Manager'}</h2>
        <div className="flex gap-2 rounded-lg bg-gray-150 p-1 border">
          <button onClick={() => setInqTab('general')} className={`px-3 py-1 text-sm font-medium rounded-md ${inqTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>General</button>
          <button onClick={() => setInqTab('b2b')} className={`px-3 py-1 text-sm font-medium rounded-md ${inqTab === 'b2b' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>B2B</button>
        </div>
      </div>
      {inqTab === 'general' ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Sender</th><th className="px-4 py-3 text-left font-medium text-gray-500">Subject / Message</th><th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-right font-medium text-gray-500">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {generalInquiries.map((inq) => (
                <tr key={inq.id} className={`hover:bg-gray-50 transition-colors ${!inq.isRead ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-3"><div className="font-bold text-gray-900">{inq.fullName}</div><div className="text-xs text-gray-400">{inq.company || '-'}</div><div className="text-xs text-gray-400">{new Date(inq.createdAt).toLocaleString()}</div></td>
                  <td className="px-4 py-3 max-w-xs md:max-w-md"><div className="font-semibold text-gray-900">{inq.subject}</div><div className="text-xs text-gray-600 mt-1 whitespace-pre-line leading-relaxed">{inq.message}</div></td>
                  <td className="px-4 py-3"><div>{inq.email}</div>{inq.phone && <div className="text-xs text-gray-500" dir="ltr">{inq.phone}</div>}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${inq.isRead ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 font-bold'}`}>{inq.isRead ? 'Read' : 'New'}</span></td>
                  <td className="px-4 py-3 text-right">{!inq.isRead && <button onClick={() => handleMarkAsRead(inq.id, 'contact')} className="text-xs font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200">Mark Read</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {generalInquiries.length === 0 && <p className="text-center text-gray-500 py-10">No general inquiries found.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Company</th><th className="px-4 py-3 text-left font-medium text-gray-500">Type / Message</th><th className="px-4 py-3 text-left font-medium text-gray-500">Attachments</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-right font-medium text-gray-500">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {b2bInquiries.map((inq) => {
                let attachmentUrls: string[] = [];
                if (inq.attachments) { try { attachmentUrls = JSON.parse(inq.attachments); } catch { attachmentUrls = [inq.attachments]; } }
                return (
                  <tr key={inq.id} className={`hover:bg-gray-50 transition-colors ${!inq.isRead ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-4 py-3"><div className="font-bold text-gray-900">{inq.companyName}</div><div className="text-xs text-gray-600">{inq.contactName}</div><div className="text-xs text-gray-400">{new Date(inq.createdAt).toLocaleString()}</div></td>
                    <td className="px-4 py-3 max-w-xs md:max-w-md"><span className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs text-indigo-700 font-bold mb-1">{inq.type}</span><div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{inq.message}</div><div className="mt-2 text-xs text-gray-500">{inq.email} | {inq.phone}</div></td>
                    <td className="px-4 py-3">{attachmentUrls.map((url, index) => <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline text-xs block mb-1">File {attachmentUrls.length > 1 ? `#${index + 1}` : ''}</a>)}{attachmentUrls.length === 0 && <span className="text-gray-400 text-xs">None</span>}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${inq.isRead ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 font-bold'}`}>{inq.isRead ? 'Read' : 'New'}</span></td>
                    <td className="px-4 py-3 text-right">{!inq.isRead && <button onClick={() => handleMarkAsRead(inq.id, 'b2b')} className="text-xs font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200">Mark Read</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {b2bInquiries.length === 0 && <p className="text-center text-gray-500 py-10">No B2B inquiries found.</p>}
        </div>
      )}
    </div>
  );
}

// ==================== ORDERS MANAGER (ADMIN) ====================
function AdminOrdersManager() {
  const { locale } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try { const data = await ordersApi.list(); setOrders(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleStatus = async (id: number, status: string) => {
    try { await ordersApi.updateStatus(id, status); fetchOrders(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">{locale === 'ar' ? 'إدارة الطلبات' : 'Orders Manager'}</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th><th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th><th className="px-4 py-3 text-left font-medium text-gray-500">Items</th><th className="px-4 py-3 text-left font-medium text-gray-500">Total</th><th className="px-4 py-3 text-left font-medium text-gray-500">Date</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-right font-medium text-gray-500">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900">#{o.id}</td>
                <td className="px-4 py-3"><div className="font-medium text-gray-900">{o.user?.name || o.user?.email}</div>{o.user?.phone && <div className="text-xs text-gray-500" dir="ltr">{o.user.phone}</div>}</td>
                <td className="px-4 py-3">
                  {o.items.map((item, idx) => (
                    <div key={item.id} className="text-xs text-gray-600">{idx + 1}. {locale === 'ar' ? item.product.nameAr : item.product.nameEn} x{item.quantity}</div>
                  ))}
                </td>
                <td className="px-4 py-3 font-bold">SAR {o.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    o.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                    o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <select className="input-field !py-1 !px-2 text-xs" value={o.status} onChange={(e) => handleStatus(o.id, e.target.value)}>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <p className="text-center text-gray-500 py-10">No orders yet.</p>}
    </div>
  );
}

// ==================== CUSTOMER MY ORDERS ====================
function CustomerOrders() {
  const { locale } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const data = await ordersApi.list(); setOrders(data); }
      catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-bafco-red border-t-transparent" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">{locale === 'ar' ? 'طلباتي' : 'My Orders'}</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>{locale === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="font-mono text-sm font-bold text-gray-900">#{o.id}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  o.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  o.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                  o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {o.status === 'PENDING' ? (locale === 'ar' ? 'قيد الانتظار' : 'Pending') :
                   o.status === 'CONFIRMED' ? (locale === 'ar' ? 'مؤكد' : 'Confirmed') :
                   o.status === 'SHIPPED' ? (locale === 'ar' ? 'تم الشحن' : 'Shipped') :
                   o.status === 'DELIVERED' ? (locale === 'ar' ? 'تم التوصيل' : 'Delivered') :
                   (locale === 'ar' ? 'ملغي' : 'Cancelled')}
                </span>
              </div>
              <div className="space-y-2">
                {o.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{locale === 'ar' ? item.product.nameAr : item.product.nameEn} x{item.quantity}</span>
                    <span className="text-gray-500">SAR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t mt-4 pt-3">
                <span className="text-sm font-medium text-gray-600">{locale === 'ar' ? 'المجموع' : 'Total'}</span>
                <span className="text-lg font-bold text-bafco-red">SAR {o.total.toFixed(2)}</span>
              </div>
              {o.notes && <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">{o.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== CUSTOMER PROFILE ====================
function CustomerProfile({ user }: { user: User }) {
  const { locale } = useTranslation();
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">{locale === 'ar' ? 'الملف الشخصي' : 'My Profile'}</h2>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bafco-red text-2xl font-bold text-white">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.name || locale === 'ar' ? 'مستخدم' : 'User'}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-gray-500">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          {user.name && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-500">{locale === 'ar' ? 'الاسم' : 'Name'}</span>
              <span className="text-sm font-medium text-gray-900">{user.name}</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-gray-500">{locale === 'ar' ? 'الدور' : 'Role'}</span>
            <span className="text-sm font-medium text-gray-900">{user.role === 'ADMIN' ? 'Admin' : locale === 'ar' ? 'عميل' : 'Customer'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== QUICK STATS CARDS ====================
function StatsCards() {
  const { locale } = useTranslation();
  const [stats, setStats] = useState({ products: 0, orders: 0, applications: 0, inquiries: 0 });

  useEffect(() => {
    Promise.all([
      productsApi.list({ take: 1 }),
      ordersApi.list(),
      careersApi.listApplications({ take: 1 }),
      contactApi.listInquiries(),
    ]).then(([p, o, a, i]) => {
      setStats({
        products: p.total,
        orders: o.length,
        applications: a.total,
        inquiries: (i.contact?.length || 0) + (i.b2b?.length || 0),
      });
    }).catch(() => {});
  }, []);

  const items = [
    { label: locale === 'ar' ? 'المنتجات' : 'Products', value: stats.products, color: 'from-bafco-red to-bafco-red-dark', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: locale === 'ar' ? 'الطلبات' : 'Orders', value: stats.orders, color: 'from-bafco-gold to-bafco-gold-light', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: locale === 'ar' ? 'المتقدمون' : 'Applicants', value: stats.applications, color: 'from-bafco-green to-green-700', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: locale === 'ar' ? 'الاستفسارات' : 'Inquiries', value: stats.inquiries, color: 'from-blue-600 to-blue-800', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== JOB MANAGER (ADMIN) ====================
function JobManager() {
  const { locale } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    titleAr: '', titleEn: '', departmentAr: '', departmentEn: '',
    locationAr: '', locationEn: '', typeAr: '', typeEn: '',
    descriptionAr: '', descriptionEn: '', requirementsAr: '', requirementsEn: '',
    salaryMin: 0, salaryMax: 0, status: 'PUBLISHED',
  });
  const [formError, setFormError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await careersApi.adminListJobs({ take: 100 });
      setJobs(data.items);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchJobs(); }, []);

  const openAddForm = () => {
    setEditingJob(null);
    setForm({ titleAr: '', titleEn: '', departmentAr: '', departmentEn: '', locationAr: '', locationEn: '', typeAr: '', typeEn: '', descriptionAr: '', descriptionEn: '', requirementsAr: '', requirementsEn: '', salaryMin: 0, salaryMax: 0, status: 'PUBLISHED' });
    setFormError(''); setFormOpen(true);
  };

  const openEditForm = (j: Job) => {
    setEditingJob(j);
    setForm({
      titleAr: j.titleAr, titleEn: j.titleEn,
      departmentAr: j.departmentAr, departmentEn: j.departmentEn,
      locationAr: j.locationAr, locationEn: j.locationEn,
      typeAr: j.typeAr, typeEn: j.typeEn,
      descriptionAr: j.descriptionAr || '', descriptionEn: j.descriptionEn || '',
      requirementsAr: j.requirementsAr || '', requirementsEn: j.requirementsEn || '',
      salaryMin: j.salaryMin || 0, salaryMax: j.salaryMax || 0,
      status: j.status || 'PUBLISHED',
    });
    setFormError(''); setFormOpen(true);
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{locale === 'ar' ? 'إدارة الوظائف' : 'Jobs Manager'}</h2>
        {!formOpen && <button onClick={openAddForm} className="btn-primary !px-4 !py-2 text-sm">{locale === 'ar' ? '+ إضافة وظيفة' : '+ Add Job'}</button>}
      </div>
      {formOpen && (
        <form onSubmit={async (e) => {
          e.preventDefault(); setFormError('');
          try {
            if (editingJob) {
              await careersApi.adminUpdateJob(editingJob.id, form);
            } else {
              await careersApi.adminCreateJob(form);
            }
            setFormOpen(false); fetchJobs();
          } catch (err) { setFormError(err instanceof Error ? err.message : 'Save failed'); }
        }} className="mb-8 border border-gray-200 rounded-2xl p-6 bg-gray-50 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">{editingJob ? 'Edit Job' : 'Add New Job'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Title (AR) *</label><input className="input-field mt-1" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Title (EN) *</label><input className="input-field mt-1" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Department (AR) *</label><input className="input-field mt-1" value={form.departmentAr} onChange={(e) => setForm({ ...form, departmentAr: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Department (EN) *</label><input className="input-field mt-1" value={form.departmentEn} onChange={(e) => setForm({ ...form, departmentEn: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Location (AR) *</label><input className="input-field mt-1" value={form.locationAr} onChange={(e) => setForm({ ...form, locationAr: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Location (EN) *</label><input className="input-field mt-1" value={form.locationEn} onChange={(e) => setForm({ ...form, locationEn: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Type (AR) *</label><input className="input-field mt-1" placeholder="دوام كامل" value={form.typeAr} onChange={(e) => setForm({ ...form, typeAr: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Type (EN) *</label><input className="input-field mt-1" placeholder="Full-time" value={form.typeEn} onChange={(e) => setForm({ ...form, typeEn: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Salary Min</label><input type="number" className="input-field mt-1" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Salary Max</label><input type="number" className="input-field mt-1" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Description (AR)</label><textarea rows={4} className="input-field mt-1" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Description (EN)</label><textarea rows={4} className="input-field mt-1" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Requirements (AR)</label><textarea rows={4} className="input-field mt-1" value={form.requirementsAr} onChange={(e) => setForm({ ...form, requirementsAr: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Requirements (EN)</label><textarea rows={4} className="input-field mt-1" value={form.requirementsEn} onChange={(e) => setForm({ ...form, requirementsEn: e.target.value })} /></div>
          </div>
          {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
            <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Save</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Department</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{locale === 'ar' ? j.titleAr : j.titleEn}</td>
                <td className="px-4 py-3 text-gray-500">{locale === 'ar' ? j.departmentAr : j.departmentEn}</td>
                <td className="px-4 py-3 text-gray-500">{locale === 'ar' ? j.locationAr : j.locationEn}</td>
                <td className="px-4 py-3"><span className="badge-gray">{locale === 'ar' ? j.typeAr : j.typeEn}</span></td>
                <td className="px-4 py-3"><span className={`badge ${j.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : j.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{j.status}</span></td>
                <td className="px-4 py-3 text-right"><button onClick={() => openEditForm(j)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jobs.length === 0 && <p className="text-center text-gray-500 py-10">No jobs created yet.</p>}
    </div>
  );
}

// ==================== DOCUMENT MANAGER (ADMIN) ====================
function DocumentManager() {
  const { locale } = useTranslation();
  const [docs, setDocs] = useState<InvestorDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try { const data = await investorsApi.listDocuments(); setDocs(data); }
    catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchDocs(); }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">{locale === 'ar' ? 'إدارة الوثائق' : 'Documents Manager'}</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-3 text-left font-medium text-gray-500">Title</th><th className="px-4 py-3 text-left font-medium text-gray-500">Type</th><th className="px-4 py-3 text-left font-medium text-gray-500">Year</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-right font-medium text-gray-500">File</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {docs.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{locale === 'ar' ? d.titleAr : d.titleEn}</td>
                <td className="px-4 py-3"><span className="badge-gray">{d.type}</span></td>
                <td className="px-4 py-3 text-gray-500">{d.year || '-'}</td>
                <td className="px-4 py-3"><span className={`badge ${d.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{d.isPublished ? 'Published' : 'Draft'}</span></td>
                <td className="px-4 py-3 text-right"><a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-bold text-xs">View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {docs.length === 0 && <p className="text-center text-gray-500 py-10">No documents uploaded yet.</p>}
    </div>
  );
}

// ==================== MAIN DASHBOARD PAGE ====================
export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const { user, isLoggedIn, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (user) setActiveTab((prev) => prev || (user.role === 'ADMIN' ? 'dashboard' : 'orders'));
  }, [navigate, isLoggedIn, user]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  const adminTabs = [
    { id: 'dashboard', labelAr: 'لوحة المعلومات', labelEn: 'Dashboard' },
    { id: 'products', labelAr: 'المنتجات', labelEn: 'Products' },
    { id: 'categories', labelAr: 'التصنيفات', labelEn: 'Categories' },
    { id: 'orders', labelAr: 'الطلبات', labelEn: 'Orders' },
    { id: 'jobs', labelAr: 'الوظائف', labelEn: 'Jobs' },
    { id: 'applications', labelAr: 'المتقدمون', labelEn: 'Applicants' },
    { id: 'inquiries', labelAr: 'الاستفسارات', labelEn: 'Inquiries' },
    { id: 'documents', labelAr: 'الوثائق', labelEn: 'Documents' },
  ];

  const customerTabs = [
    { id: 'orders', labelAr: 'طلباتي', labelEn: 'My Orders' },
    { id: 'profile', labelAr: 'الملف الشخصي', labelEn: 'Profile' },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <div className="py-16">
      <div className="container-bafco">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? (t('nav.dashboard') || 'Dashboard') : (t('nav.dashboard') || 'Dashboard')}
            </h1>
            <p className="text-sm text-gray-500">
              {isAdmin ? 'Admin Panel' : `${user.name || user.email}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isAdmin && (
              <Link to="/checkout" className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Cart
              </Link>
            )}
            <Link to="/products" className="btn-secondary !px-4 !py-2 text-sm">
              {t('nav.products')}
            </Link>
            <button onClick={handleLogout} className="btn-secondary !px-4 !py-2 text-sm">
              {t('nav.logout')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {locale === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        <div className="card p-6">
          {isAdmin && activeTab === 'dashboard' && (
            <>
              <StatsCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="rounded-2xl border border-gray-100 p-6 bg-gradient-to-br from-bafco-red/5 to-transparent">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{locale === 'ar' ? 'مرحباً بك في لوحة التحكم' : 'Welcome to Dashboard'}</h3>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'من هنا يمكنك إدارة المنتجات، التصنيفات، الطلبات، والمزيد.' : 'Manage products, categories, orders, and more from here.'}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-6 bg-gradient-to-br from-bafco-gold/5 to-transparent">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{locale === 'ar' ? 'إعدادات سريعة' : 'Quick Actions'}</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => setActiveTab('products')} className="btn-primary !px-3 !py-1.5 text-xs">{locale === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}</button>
                    <button onClick={() => setActiveTab('orders')} className="btn-secondary !px-3 !py-1.5 text-xs">{locale === 'ar' ? 'الطلبات' : 'View Orders'}</button>
                    <button onClick={() => setActiveTab('inquiries')} className="btn-secondary !px-3 !py-1.5 text-xs">{locale === 'ar' ? 'الاستفسارات' : 'Inquiries'}</button>
                  </div>
                </div>
              </div>
            </>
          )}
          {isAdmin && activeTab === 'products' && <ProductManager />}
          {isAdmin && activeTab === 'categories' && <CategoryManager />}
          {isAdmin && activeTab === 'orders' && <AdminOrdersManager />}
          {isAdmin && activeTab === 'jobs' && <JobManager />}
          {isAdmin && activeTab === 'applications' && <CareersManager />}
          {isAdmin && activeTab === 'inquiries' && <InquiriesManager />}
          {isAdmin && activeTab === 'documents' && <DocumentManager />}
          {!isAdmin && activeTab === 'orders' && <CustomerOrders />}
          {!isAdmin && activeTab === 'profile' && <CustomerProfile user={user} />}
        </div>
      </div>
    </div>
  );
}
