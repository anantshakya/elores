'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/app/admin/_components/PageHeader.jsx';
import { adminApi } from '@/app/admin/_lib/api.js';
import { useAdminToast } from '@/app/admin/_components/AdminToast.jsx';

export default function SettingsPage() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useAdminToast();

  useEffect(() => {
    adminApi('/settings')
      .then((d) => setForm(d.data || {}))
      .catch((e) => toast.show(e.message || 'Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  // Handle Logo Image Upload
  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      return toast.show('Logo file size must be 3MB or smaller', 'error');
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'logos');
      const res = await adminApi('/admin/upload', {
        method: 'POST',
        body: fd,
      });

      if (res.url) {
        setForm((prev) => ({ ...prev, logo: res.url }));
        toast.show('Header logo image uploaded successfully!');
      } else {
        throw new Error('Image URL not returned');
      }
    } catch (err) {
      toast.show(err.message || 'Failed to upload logo', 'error');
    } finally {
      setUploading(false);
    }
  }

  // Save Settings Submit
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const d = await adminApi('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      toast.show(d.message || 'Store settings saved successfully!');
    } catch (err) {
      toast.show(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="adminPanel" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        Loading store settings…
      </div>
    );
  }

  const currentLogo = form.logo || '/elores-logo.png';

  return (
    <>
      <PageHeader
        title="Store & Header Settings"
        subtitle="Configure header branding, logo, contact, shipping, social links, and SEO."
      />

      <form className="adminPanel formPanel" onSubmit={save}>
        {/* BRANDING & HEADER LOGO SECTION */}
        <section className="formSection" style={{ borderBottom: '1px solid var(--admin-border, #eee)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', color: '#1c1714', margin: '0 0 16px' }}>Header Branding &amp; Logo</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'center' }}>
            {/* Logo Preview Box */}
            <div
              style={{
                background: '#1c1714',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #332d28',
              }}
            >
              <span style={{ fontSize: '11px', color: '#a57c36', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '12px' }}>
                Header Preview
              </span>
              <img
                src={currentLogo}
                alt="Store Header Logo"
                style={{
                  maxHeight: '60px',
                  maxWidth: '160px',
                  objectFit: 'contain',
                  marginBottom: '10px',
                }}
                onError={(e) => {
                  e.target.src = '/elores-logo.png';
                }}
              />
              <span style={{ fontSize: '12px', color: '#b5aca2' }}>
                {form.store_name || 'Elores'}
              </span>
            </div>

            {/* Logo Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="formField" style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#1c1714' }}>Upload New Header Logo Image</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--admin-gold, #a57c36)',
                      color: '#fff',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.7 : 1,
                    }}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <span>{uploading ? 'Uploading Logo...' : '📁 Choose & Upload Logo Image'}</span>
                  </label>

                  {form.logo && form.logo !== '/elores-logo.png' && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, logo: '/elores-logo.png' }))}
                      style={{
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        color: '#4b5563',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Reset to Default Logo
                    </button>
                  )}
                </div>
                <p className="helpText" style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>
                  Recommended: Transparent PNG, SVG, or WebP logo file (max 3MB).
                </p>
              </div>

              <label className="formField">
                <span>Or Image URL Path</span>
                <input
                  type="text"
                  placeholder="/elores-logo.png or https://..."
                  value={form.logo || ''}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                />
              </label>

              <label className="formField">
                <span>Header Announcement Bar Text</span>
                <input
                  type="text"
                  placeholder="FREE SHIPPING ABOVE ₹999 • COD AVAILABLE"
                  value={form.announcement || ''}
                  onChange={(e) => setForm({ ...form, announcement: e.target.value })}
                />
              </label>
            </div>
          </div>
        </section>

        {/* GENERAL BRAND & CONTACT INFO */}
        <section className="formSection">
          <h2>Brand &amp; Contact Details</h2>
          <div className="formGrid">
            <label className="formField">
              <span>Store Brand Name</span>
              <input
                type="text"
                value={form.store_name || ''}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>Customer Support Email</span>
              <input
                type="email"
                value={form.support_email || ''}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>Customer Support Phone</span>
              <input
                type="text"
                value={form.support_phone || ''}
                onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>WhatsApp Contact Number</span>
              <input
                type="text"
                placeholder="e.g. 919876543210"
                value={form.whatsapp || ''}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </label>
          </div>
        </section>

        {/* EMAIL & OTP CONFIGURATION */}
        <section className="formSection">
          <h2>Brevo (Sendinblue) Email OTP Gateway</h2>
          <p className="helpText" style={{ marginBottom: '14px', fontSize: '12.5px', color: '#666' }}>
            Configure your Brevo Transactional Email API Key and Verified Sender Email for customer OTP registration and password resets.
          </p>
          <div className="formGrid">
            <label className="formField">
              <span>Brevo API Key (`xkeysib-...`)</span>
              <input
                type="password"
                placeholder="xkeysib-..."
                value={form.sendinblue_api_key || form.brevo_api_key || ''}
                onChange={(e) => setForm({ ...form, sendinblue_api_key: e.target.value, brevo_api_key: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>Brevo Verified Sender Email</span>
              <input
                type="email"
                placeholder="support@elores.in"
                value={form.sendinblue_sender_email || ''}
                onChange={(e) => setForm({ ...form, sendinblue_sender_email: e.target.value })}
              />
            </label>
          </div>
        </section>

        {/* SHIPPING & RETURNS */}
        <section className="formSection">
          <h2>Shipping &amp; Return Policy</h2>
          <div className="formGrid">
            <label className="formField">
              <span>Free Shipping Minimum Order Amount (₹)</span>
              <input
                type="number"
                placeholder="999"
                value={form.free_shipping_min || ''}
                onChange={(e) => setForm({ ...form, free_shipping_min: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>Easy Return Window (Days)</span>
              <input
                type="number"
                placeholder="7"
                value={form.return_days || ''}
                onChange={(e) => setForm({ ...form, return_days: e.target.value })}
              />
            </label>
          </div>
        </section>

        {/* SOCIAL LINKS & SEO */}
        <section className="formSection">
          <h2>Social Profiles &amp; Search Engine Optimization (SEO)</h2>
          <div className="formGrid">
            <label className="formField">
              <span>Instagram Page Link</span>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                value={form.instagram || ''}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>Facebook Page Link</span>
              <input
                type="url"
                placeholder="https://facebook.com/..."
                value={form.facebook || ''}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>Google Analytics Measurement ID</span>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={form.google_analytics_id || ''}
                onChange={(e) => setForm({ ...form, google_analytics_id: e.target.value })}
              />
            </label>

            <label className="formField">
              <span>Default SEO Meta Title</span>
              <input
                type="text"
                placeholder="Elores — Modern Everyday Jewellery"
                value={form.meta_title || ''}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              />
            </label>
          </div>

          <label className="formField full" style={{ marginTop: '14px' }}>
            <span>Default SEO Meta Description</span>
            <textarea
              rows="3"
              placeholder="Shop anti-tarnish artificial everyday jewellery at Elores."
              value={form.meta_description || ''}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            />
          </label>
        </section>

        {/* SUBMIT FORM ACTIONS */}
        <div className="formActions">
          <button className="primaryAction" type="submit" disabled={saving || uploading}>
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </>
  );
}
