/**
 * ProfilePage.jsx
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500)); // Simulate save
    updateProfile({ name: form.name, avatar: form.avatar });
    setSaving(false);
    toast.success('Profile updated!');
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 page-wrapper">
      <h1 className="text-2xl font-bold text-primary mb-8">Profile</h1>

      {/* Avatar section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Avatar user={{ name: form.name, avatar: form.avatar }} size="2xl" />
          <label
            htmlFor="avatar-url"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg text-white"
            style={{ background: 'var(--accent)' }}
            title="Change avatar"
          >
            <Camera className="w-4 h-4" />
          </label>
        </div>
        <p className="text-sm text-muted mt-2">Enter avatar URL below or keep initials</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-secondary mb-1.5">Display Name</label>
          <input
            id="profile-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm text-primary outline-none transition-all"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-secondary mb-1.5">Email</label>
          <input
            id="profile-email"
            type="email"
            value={form.email}
            disabled
            className="w-full px-4 py-3 rounded-xl text-sm text-muted outline-none cursor-not-allowed"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.6 }}
          />
        </div>

        <div>
          <label htmlFor="avatar-url" className="block text-sm font-medium text-secondary mb-1.5">Avatar URL (optional)</label>
          <input
            id="avatar-url"
            type="url"
            value={form.avatar}
            onChange={(e) => setForm(prev => ({ ...prev, avatar: e.target.value }))}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-4 py-3 rounded-xl text-sm text-primary outline-none transition-all placeholder:text-muted"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black hover:opacity-90 transition-all disabled:opacity-60"
          style={{ background: 'var(--accent)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
