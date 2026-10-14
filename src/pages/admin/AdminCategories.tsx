import React, { useState, useEffect } from 'react';
import { Layers, Plus, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCategories, saveCategory } from '../../services/db';
import { JobCategory } from '../../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descBn, setDescBn] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.warn('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (cat: JobCategory) => {
    await saveCategory({ id: cat.id, active: !cat.active });
    await fetchCategories();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameBn.trim()) return;

    try {
      setSaving(true);
      await saveCategory({
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim(),
        descriptionEn: descEn.trim(),
        descriptionBn: descBn.trim(),
        active: true,
        order: categories.length + 1,
      });

      setShowAddModal(false);
      setNameEn('');
      setNameBn('');
      setDescEn('');
      setDescBn('');
      await fetchCategories();
    } catch (err) {
      console.warn('Error adding category:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Job Categories Management
          </h2>
          <p className="text-xs text-slate-500">
            Configure bilingual taxonomy for microjob postings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No categories registered.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {categories.map((c) => (
              <div
                key={c.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {c.nameEn}
                    </span>
                    <span className="text-xs text-slate-400">({c.nameBn})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.descriptionEn || 'No English description'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c.active ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    onClick={() => handleToggleActive(c)}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    {c.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Add New Job Category
            </h3>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Name (English):
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Graphic & Logo Design"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Name (Bengali / বাংলা):
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: গ্রাফিক্স ও লোগো ডিজাইন"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Description (English):
                </label>
                <input
                  type="text"
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Description (Bengali):
                </label>
                <input
                  type="text"
                  value={descBn}
                  onChange={(e) => setDescBn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
