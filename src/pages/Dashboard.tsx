import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ImagePlus, Trash2, Layout } from 'lucide-react';
import api from '../lib/axiosInstance';
import type { Sticker, AnimationType } from '../types/api';

// ─────────────────────────────────────────────────────────────
// Allowed categories — keep in sync with stickerRoutes.js
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Car and Bike Stickers',
  'Business Signage',
  'Specialty Items',
] as const;

// ─────────────────────────────────────────────────────────────
// Loading skeleton for the sticker grid
// ─────────────────────────────────────────────────────────────
function StickerSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl aspect-square bg-surface-container animate-pulse"
        />
      ))}
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  // ── Typed state ───────────────────────────────────────────
  const [stickers,    setStickers]    = useState<Sticker[]>([]);
  const [animation,   setAnimation]   = useState<AnimationType>('fade');
  const [file,        setFile]        = useState<File | null>(null);
  const [title,       setTitle]       = useState('');
  const [category,    setCategory]    = useState<typeof CATEGORIES[number]>('Car and Bike Stickers');
  const [uploading,   setUploading]   = useState(false);
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [gridError,   setGridError]   = useState('');
  const [uploadError, setUploadError] = useState('');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchStickers();
    fetchAnimation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStickers = async () => {
    setLoadingGrid(true);
    setGridError('');
    try {
      const res = await api.get<Sticker[]>('/stickers');
      setStickers(res.data);
    } catch {
      setGridError('Failed to load images. Please refresh.');
    } finally {
      setLoadingGrid(false);
    }
  };

  const fetchAnimation = async () => {
    try {
      const res = await api.get<{ headerAnimation?: AnimationType }>('/settings');
      if (res.data?.headerAnimation) {
        setAnimation(res.data.headerAnimation);
      }
    } catch {
      // Non-critical; keep default value
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', category);

    try {
      await api.post('/stickers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setTitle('');
      fetchStickers();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Upload failed. Check backend configuration.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/stickers/${id}`);
      setStickers((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert('Delete failed. Please try again.');
    }
  };

  const handleSaveAnimation = async () => {
    try {
      await api.put('/settings', { key: 'headerAnimation', value: animation });
      alert('Animation updated successfully!');
    } catch {
      alert('Failed to save animation. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-surface p-6 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border border-outline-variant/30">
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Layout className="w-6 h-6" /> Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Settings Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 h-fit">
            <h2 className="text-xl font-bold text-on-surface mb-4">Header Animation</h2>
            <div className="space-y-4">
              <select
                value={animation}
                onChange={(e) => setAnimation(e.target.value as AnimationType)}
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="fade">Fade In</option>
                <option value="slide">Slide Left</option>
                <option value="bounce">Bounce</option>
              </select>
              <button
                onClick={handleSaveAnimation}
                className="w-full bg-secondary-container text-on-secondary-container font-bold py-3 rounded-lg hover:bg-secondary-container/80 transition-colors"
              >
                Save Animation
              </button>
            </div>

            <hr className="my-8 border-outline-variant/50" />

            {/* Upload Form */}
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <ImagePlus className="w-5 h-5" /> Upload New Photo
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="E.g., Audi Wrap"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Image File</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </div>
              {uploadError && (
                <p className="text-red-500 text-sm">{uploadError}</p>
              )}
              <button
                disabled={uploading}
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading…' : 'Upload Image'}
              </button>
            </form>
          </div>

          {/* Portfolio Grid */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <h2 className="text-xl font-bold text-on-surface mb-6">Manage Portfolio Images</h2>

            {gridError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {gridError}
                <button onClick={fetchStickers} className="ml-2 underline">Retry</button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {loadingGrid ? (
                <StickerSkeleton />
              ) : stickers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container rounded-xl">
                  No images found. Upload some to see them here!
                </div>
              ) : (
                stickers.map((img) => (
                  <div
                    key={img._id}
                    className="relative group rounded-xl overflow-hidden border aspect-square"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                      <span className="text-white text-xs truncate max-w-[70%]">{img.title}</span>
                      <button
                        onClick={() => handleDelete(img._id)}
                        className="text-red-400 hover:text-red-300 p-1 bg-white/10 rounded"
                        aria-label={`Delete ${img.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
