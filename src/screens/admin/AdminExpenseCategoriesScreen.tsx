import { useMemo, useState } from 'react';
import { useLang } from '../../i18n';
import {
  deleteExpenseCategory,
  getExpenseCategories,
  saveExpenseCategory,
} from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';

const inputCls =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

/** Admin: add / rename / deactivate / delete expense categories. */
export function AdminExpenseCategoriesScreen() {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = useMemo(() => getExpenseCategories(true), [refresh]);

  async function add() {
    setError('');
    try {
      await saveExpenseCategory({ name });
      setName('');
      setRefresh((r) => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tryAgain'));
    }
  }

  async function saveEdit(id: string) {
    setError('');
    try {
      await saveExpenseCategory({ id, name: editName });
      setEditingId(null);
      setRefresh((r) => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tryAgain'));
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const c = categories.find((x) => x.id === id);
    if (!c) return;
    await saveExpenseCategory({ id, name: c.name, active: !active });
    setRefresh((r) => r + 1);
  }

  async function remove(id: string) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId || deleting) return;
    setDeleting(true);
    try {
      await deleteExpenseCategory(confirmDeleteId);
      setConfirmDeleteId(null);
      setRefresh((r) => r + 1);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('categories')} backTo="/admin/expenses" />
      <div className="px-4 pt-3">
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('newCategoryPlaceholder')}
            aria-label={t('newCategoryPlaceholder')}
          />
          <button
            type="button"
            onClick={add}
            disabled={!name.trim()}
            className="min-h-[52px] shrink-0 rounded-2xl bg-maroon-800 px-5 text-base font-extrabold text-amber-100 disabled:opacity-50"
          >
            {t('add')}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <div className="mt-3 space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-3 shadow-sm">
              {editingId === c.id ? (
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label={t('categoryName')}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(c.id)}
                    className="min-h-[48px] shrink-0 rounded-xl bg-maroon-800 px-4 text-sm font-bold text-amber-100"
                  >
                    {t('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="min-h-[48px] shrink-0 rounded-xl bg-stone-100 px-4 text-sm font-bold text-stone-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-extrabold ${c.active ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                    {c.name}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditName(c.name);
                      }}
                      className="min-h-[40px] rounded-xl bg-stone-100 px-3 text-xs font-bold text-stone-700"
                    >
                      {t('edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(c.id, c.active)}
                      className="min-h-[40px] rounded-xl bg-stone-100 px-3 text-xs font-bold text-stone-700"
                    >
                      {c.active ? t('deactivate') : t('activate')}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="min-h-[40px] rounded-xl bg-red-50 px-3 text-xs font-bold text-red-700"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 px-1 text-xs text-stone-400">{t('categoryDeleteNote')}</p>
      </div>

      {/* in-app delete confirmation */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t('confirmDeleteCategory')}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-base font-extrabold text-stone-900">{t('confirmDeleteCategory')}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                className="min-h-[52px] flex-1 rounded-2xl bg-stone-100 text-base font-bold text-stone-700 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="min-h-[52px] flex-1 rounded-2xl bg-red-600 text-base font-extrabold text-white disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
