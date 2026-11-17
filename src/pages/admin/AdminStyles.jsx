import React, { useState } from 'react';
import { adminApi } from '@/api/adminClient';
import { uploadFile } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'braids', 'corn_rows', 'cornrows', 'locs', 'knotless_braids', 'box_braids', 'boho_braids', 'goddess_braids',
  'tribal_braids', 'stitch_braids', 'fulani_braids', 'lemonade_braids', 'custom_styles',
].map((value) => ({ value, label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));

function StyleForm({ style, onSave, onClose }) {
  const [form, setForm] = useState(style ? {
    ...style,
    size_prices: style.size_prices || {},
    size_contact_us: style.size_contact_us || []
  } : {
    name: '', description: '', starting_price: 0, estimated_duration: '',
    category: 'braids', is_active: true, images: [], video_url: '',
    size_prices: {},
    size_contact_us: []
  });

  const sizePriceLabels = [
    { key: 'extra_small', label: 'Extra Small' },
    { key: 'small', label: 'Small' },
    { key: 'small_medium', label: 'Small-Medium' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
    { key: 'extra_large', label: 'Extra Large' },
  ];

  const setSizePrice = (key, val) =>
    setForm(f => ({ ...f, size_prices: { ...(f.size_prices || {}), [key]: val === '' ? null : (parseFloat(val) || null) } }));

  const toggleContactUs = (key, checked) =>
    setForm(f => {
      const current = f.size_contact_us || [];
      const updated = checked ? [...current.filter(k => k !== key), key] : current.filter(k => k !== key);
      return { ...f, size_contact_us: updated };
    });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file, 'styles');
      setForm((f) => ({ ...f, images: [...(f.images || []), file_url] }));
    } catch (err) { toast.error(err.message); }
    setUploading(false);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file, 'styles');
      setForm((f) => ({ ...f, video_url: file_url }));
    } catch (err) { toast.error(err.message); }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wider">Style Name *</Label>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 rounded-none h-10" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">Description</Label>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 rounded-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider">Starting Price ($)</Label>
          <Input type="number" value={form.starting_price} onChange={e => setForm({ ...form, starting_price: parseFloat(e.target.value) || 0 })} className="mt-1 rounded-none h-10" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider">Duration</Label>
          <Input value={form.estimated_duration} onChange={e => setForm({ ...form, estimated_duration: e.target.value })} placeholder="e.g. 3-5 hours" className="mt-1 rounded-none h-10" />
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">Category</Label>
        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
          <SelectTrigger className="mt-1 rounded-none h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">Images</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {form.images?.map((img, i) => (
            <div key={i} className="relative w-16 h-16">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-[10px] flex items-center justify-center">×</button>
            </div>
          ))}
          <label className="w-16 h-16 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">Video</Label>
        <div className="mt-2">
          {form.video_url ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600">Video uploaded</span>
              <button onClick={() => setForm({ ...form, video_url: '' })} className="text-xs text-destructive">Remove</button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border text-xs cursor-pointer hover:border-gold transition-colors">
              <Upload className="w-3 h-3" /> Upload Video
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">Price by Hair Size ($)</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {sizePriceLabels.map(({ key, label }) => {
            const isContactUs = (form.size_contact_us || []).includes(key);
            return (
              <div key={key} className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">{label}</Label>
                <Input
                  type="number"
                  placeholder="—"
                  value={isContactUs ? '' : (form.size_prices?.[key] ?? '')}
                  disabled={isContactUs}
                  onChange={e => setSizePrice(key, e.target.value)}
                  className="rounded-none h-9 disabled:opacity-40"
                />
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isContactUs}
                    onChange={e => toggleContactUs(key, e.target.checked)}
                    className="w-3 h-3 accent-gold"
                  />
                  <span className="text-[10px] text-muted-foreground">Contact us for price</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
        <Label className="text-xs">Active</Label>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => {
          // Clean size_prices: remove null/empty values so schema stays valid
          const cleanSizePrices = {};
          Object.entries(form.size_prices || {}).forEach(([k, v]) => {
            if (v !== null && v !== '' && v !== undefined) cleanSizePrices[k] = v;
          });
          onSave({ ...form, size_prices: cleanSizePrices, size_contact_us: form.size_contact_us || [] });
        }} disabled={!form.name || uploading} className="bg-onyx text-white hover:bg-gold rounded-none text-xs uppercase tracking-wider h-10 px-6">
          {style ? 'Update' : 'Create'} Style
        </Button>
        <Button variant="outline" onClick={onClose} className="rounded-none text-xs h-10">Cancel</Button>
      </div>
    </div>
  );
}

export default function AdminStyles() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: styles = [] } = useQuery({
    queryKey: ['admin-hairstyles'],
    queryFn: () => adminApi.hairstyles.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.hairstyles.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-hairstyles'] }); setDialogOpen(false); toast.success('Style created'); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.hairstyles.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-hairstyles'] }); setDialogOpen(false); setEditing(null); toast.success('Style updated'); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.hairstyles.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-hairstyles'] }); toast.success('Style deleted'); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl text-onyx">Manage Hairstyles</h2>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-onyx text-white hover:bg-gold rounded-none text-xs uppercase tracking-wider h-9 px-4">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Style
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'New'} Hairstyle</DialogTitle></DialogHeader>
            <StyleForm
              style={editing}
              onSave={(data) => editing ? updateMutation.mutate({ id: editing.id, data }) : createMutation.mutate(data)}
              onClose={() => { setDialogOpen(false); setEditing(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {styles.map(s => (
          <Card key={s.id} className="shadow-sm border-border">
            <CardContent className="p-4 flex items-center gap-4">
              {s.images?.[0] && <img src={s.images[0]} alt={s.name} className="w-16 h-16 object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{s.name}</h3>
                  {!s.is_active && <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-sm">Inactive</span>}
                </div>
                <p className="text-xs text-muted-foreground">{s.category?.replace(/_/g, ' ')} · ${s.starting_price} · {s.estimated_duration}</p>
              </div>
              <div className="flex gap-1 items-center">
                <Switch checked={s.is_active} onCheckedChange={(v) => updateMutation.mutate({ id: s.id, data: { is_active: v } })} aria-label="Active" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(s); setDialogOpen(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (window.confirm(`Delete "${s.name}"? This can't be undone.`)) deleteMutation.mutate(s.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}