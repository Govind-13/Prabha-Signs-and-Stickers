import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, ImagePlus, Trash2, Layout } from 'lucide-react';
import { API_URL } from '../config';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stickers, setStickers] = useState<any[]>([]);
  const [animation, setAnimation] = useState('fade');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Car and Bike Stickers');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchStickers();
    fetchAnimation();
  }, [navigate, token]);

  const fetchStickers = async () => {
    try {
      const res = await axios.get(`${API_URL}/stickers`);
      setStickers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnimation = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings`);
      if (res.data && res.data.headerAnimation) {
        setAnimation(res.data.headerAnimation);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', category);

    try {
      await axios.post(`${API_URL}/stickers`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
      setTitle('');
      fetchStickers();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload. Make sure backend and Cloudinary are configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`${API_URL}/stickers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStickers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAnimation = async () => {
    try {
      await axios.put(`${API_URL}/settings`, { key: 'headerAnimation', value: animation }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Animation updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-surface p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border border-outline-variant/30">
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Layout className="w-6 h-6" /> Admin Dashboard
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-error font-semibold hover:bg-error-container px-4 py-2 rounded-lg transition-colors">
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
                onChange={(e) => setAnimation(e.target.value)}
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

            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <ImagePlus className="w-5 h-5" /> Upload New Photo
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="E.g., Audi Wrap" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="Car and Bike Stickers">Car and Bike Stickers</option>
                  <option value="Business Signage">Business Signage</option>
                  <option value="Specialty Items">Specialty Items</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Image File</label>
                <input type="file" accept="image/*" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {loading ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
          </div>

          {/* Portfolio Management */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <h2 className="text-xl font-bold text-on-surface mb-6">Manage Portfolio Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stickers.map((img) => (
                <div key={img._id} className="relative group rounded-xl overflow-hidden border aspect-square">
                  <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                    <span className="text-white text-xs truncate max-w-[70%]">{img.title}</span>
                    <button onClick={() => handleDelete(img._id)} className="text-red-400 hover:text-red-300 p-1 bg-white/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {stickers.length === 0 && (
                <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container rounded-xl">
                  No images found. Upload some to see them here!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
