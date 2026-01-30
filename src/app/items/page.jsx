'use client';

import { useEffect, useState } from 'react';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = { itemName: '', itemCategory: '', itemPrice: '', status: '' };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  async function loadItems(p = page, l = limit) {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/items?page=${p}&limit=${l}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load items');
      setItems(json.data);
      setPage(json.page);
      setLimit(json.limit);
      setTotalPages(json.totalPages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function createItem(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = {
        itemName: form.itemName.trim(),
        itemCategory: form.itemCategory.trim(),
        itemPrice: Number(form.itemPrice),
        status: form.status.trim(),
      };
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.errors?.join(', ') || json.error || 'Failed to create item');
      setForm(emptyForm);
      await loadItems(1, limit);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item) {
    setEditing({ ...item, itemPrice: String(item.itemPrice) });
  }

  function cancelEdit() {
    setEditing(null);
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditing((it) => ({ ...it, [name]: value }));
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      setLoading(true);
      setError('');
      const payload = {
        itemName: editing.itemName.trim(),
        itemCategory: editing.itemCategory.trim(),
        itemPrice: Number(editing.itemPrice),
        status: editing.status.trim(),
      };
      const res = await fetch(`/api/items/${editing._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update');
      setEditing(null);
      await loadItems(page, limit);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete');
      await loadItems(page, limit);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function goToPage(p) {
    const np = Math.max(1, Math.min(totalPages, p));
    loadItems(np, limit);
  }

  function changeLimit(e) {
    const l = Number(e.target.value) || 10;
    setLimit(l);
    loadItems(1, l);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Item Manager</h1>
        {loading && <span className="text-sm text-zinc-500">Working...</span>}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-medium">Create New Item</h2>
        <form onSubmit={createItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Name</span>
            <input name="itemName" value={form.itemName} onChange={handleFormChange} required className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Category</span>
            <input name="itemCategory" value={form.itemCategory} onChange={handleFormChange} required className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Price</span>
            <input name="itemPrice" type="number" step="0.01" value={form.itemPrice} onChange={handleFormChange} required className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Status</span>
            <input name="status" value={form.status} onChange={handleFormChange} required className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800" />
          </label>
          <div className="col-span-full flex gap-2">
            <button type="submit" disabled={loading} className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-black dark:hover:bg-zinc-300">Add Item</button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1 || loading} className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Prev</button>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Page {page} / {totalPages}</span>
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages || loading} className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Next</button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Per page</span>
            <select value={limit} onChange={changeLimit} className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800">
                <th className="border-b border-zinc-200 p-2 text-left font-medium dark:border-zinc-700">Name</th>
                <th className="border-b border-zinc-200 p-2 text-left font-medium dark:border-zinc-700">Category</th>
                <th className="border-b border-zinc-200 p-2 text-right font-medium dark:border-zinc-700">Price</th>
                <th className="border-b border-zinc-200 p-2 text-left font-medium dark:border-zinc-700">Status</th>
                <th className="border-b border-zinc-200 p-2 text-center font-medium dark:border-zinc-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="border-b border-zinc-100 p-2 dark:border-zinc-800">
                    {editing?._id === it._id ? (
                      <input name="itemName" value={editing.itemName} onChange={handleEditChange} className="w-full rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800" />
                    ) : (
                      it.itemName
                    )}
                  </td>
                  <td className="border-b border-zinc-100 p-2 dark:border-zinc-800">
                    {editing?._id === it._id ? (
                      <input name="itemCategory" value={editing.itemCategory} onChange={handleEditChange} className="w-full rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800" />
                    ) : (
                      it.itemCategory
                    )}
                  </td>
                  <td className="border-b border-zinc-100 p-2 text-right dark:border-zinc-800">
                    {editing?._id === it._id ? (
                      <input name="itemPrice" type="number" step="0.01" value={editing.itemPrice} onChange={handleEditChange} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-right dark:border-zinc-700 dark:bg-zinc-800" />
                    ) : (
                      Number(it.itemPrice).toFixed(2)
                    )}
                  </td>
                  <td className="border-b border-zinc-100 p-2 dark:border-zinc-800">
                    {editing?._id === it._id ? (
                      <input name="status" value={editing.status} onChange={handleEditChange} className="w-full rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800" />
                    ) : (
                      it.status
                    )}
                  </td>
                  <td className="border-b border-zinc-100 p-2 text-center dark:border-zinc-800">
                    {editing?._id === it._id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={saveEdit} disabled={loading} className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-200 dark:text-black">Save</button>
                        <button onClick={cancelEdit} disabled={loading} className="rounded-md border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => startEdit(it)} disabled={loading} className="rounded-md border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Edit</button>
                        <button onClick={() => deleteItem(it._id)} disabled={loading} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-zinc-500">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
