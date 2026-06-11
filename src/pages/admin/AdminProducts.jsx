import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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

const hairstyleCategories = [
  { value: 'braiding', label: 'Braiding' },
  { value: 'twisting', label: 'Twisting' },
  { value: 'cornrow', label: 'Cornrow' },
  { value: 'others', label: 'Others' },
];

const extensionCategories = [
  { value: 'bone_straight', label: 'Bone Straight' },
  { value: 'french_curls', label: 'French Curls' },
  { value: 'kinky_twist', label: 'Kinky Twist' },
  { value: 'boho_curls', label: 'Boho Curls' },
  { value: 'others', label: 'Others' },
];

function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || {
    name: '', description: '', price: 0, sale_price: null, product_type: 'extension',
    category: 'bone_straight', is_active: true, featured: false, images: [],
    inventory_count: 0, lengths: [], colors: []
  });
  const [uploading, setUploading] = useState(false);

  const categoryOptions = form.product_type === 'hairstyle' ? hairstyleCategories : extensionCategories;

  const handleTypeChange = (val) => {
    const defaultCat = val === 'hairstyle' ? 'braiding' : 'bone_straight';
    setForm({ ...form, product_type: val, category: defaultCat });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, images: [...(form.images || []), file_url] });
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wider">Product Name *</Label>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 rounded-none h-10" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">Description</Label>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 rounded-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider">Price ($)</Label>
          <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="mt-1 rounded-none h-10" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider">Sale Price ($)</Label>
          <Input type="number" value={form.sale_price || ''} onChange={e => setForm({ ...form, sale_price: parseFloat(e.target.value) || null })} className="mt-1 rounded-none h-10" placeholder="Optional" />
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">Product Type</Label>
        <Select value={form.product_type} onValueChange={handleTypeChange}>
          <SelectTrigger className="mt-1 rounded-none h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="extension">Extension / Hair</SelectItem>
            <SelectItem value="hairstyle">Hairstyle Service</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider">Category</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger className="mt-1 rounded-none h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider">Inventory</Label>
          <Input type="number" value={form.inventory_count} onChange={e => setForm({ ...form, inventory_count: parseInt(e.target.value) || 0 })} className="mt-1 rounded-none h-10" />
        </div>
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
          <label className="w-16 h-16 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-gold">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
          <Label className="text-xs">Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} />
          <Label className="text-xs">Featured</Label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave(form)} disabled={!form.name || uploading} className="bg-onyx text-white hover:bg-gold rounded-none text-xs uppercase tracking-wider h-10 px-6">
          {product ? 'Update' : 'Create'}
        </Button>
        <Button variant="outline" onClick={onClose} className="rounded-none text-xs h-10">Cancel</Button>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => base44.entities.Product.list() });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.Product.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setDialogOpen(false); toast.success('Product created'); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setDialogOpen(false); setEditing(null); toast.success('Updated'); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Deleted'); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl text-onyx">Manage Products</h2>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-onyx text-white hover:bg-gold rounded-none text-xs uppercase tracking-wider h-9 px-4">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'New'} Product</DialogTitle></DialogHeader>
            <ProductForm
              product={editing}
              onSave={(d) => editing ? updateMutation.mutate({ id: editing.id, data: d }) : createMutation.mutate(d)}
              onClose={() => { setDialogOpen(false); setEditing(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map(p => (
          <Card key={p.id} className="shadow-sm border-border">
            <CardContent className="p-4 flex items-center gap-4">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-14 h-14 object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{p.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${p.product_type === 'hairstyle' ? 'bg-gold/10 text-yellow-700' : 'bg-secondary text-muted-foreground'}`}>
                    {p.product_type === 'hairstyle' ? 'Hairstyle' : 'Extension'}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.category?.replace(/_/g, ' ')} · ${p.price} · Stock: {p.inventory_count}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(p); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}