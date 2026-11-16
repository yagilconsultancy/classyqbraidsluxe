import React, { useState, useRef } from 'react';
import { uploadFile } from '@/api/dataClient';
import { Upload, X, Loader2, Link2, Image as ImageIcon, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InspirationMediaUploader({ media = [], onMediaChange, link = '', onLinkChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isVideo = (url) => /\.(mp4|webm|mov|ogg|avi)(\?|$)/i.test(url);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await uploadFile(file, 'inspiration');
        uploaded.push(file_url);
      }
      onMediaChange([...media, ...uploaded]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeItem = (idx) => {
    onMediaChange(media.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <Label className="text-xs uppercase tracking-wider">Inspiration Video / Pictures (Optional)</Label>
      <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
        Upload reference photos or videos of the look you want, or paste a link below if you can't upload.
      </p>

      {/* Uploaded media previews */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {media.map((url, idx) => (
            <div key={idx} className="relative group border border-border rounded-sm overflow-hidden aspect-square bg-secondary/30">
              {isVideo(url) ? (
                <video src={url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={url} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-onyx/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-onyx/60 flex items-center justify-center">
                {isVideo(url) ? <Video className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label className="block cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <div className="border-2 border-dashed border-border hover:border-gold transition-colors p-6 text-center rounded-sm">
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-gold mx-auto mb-2 animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Tap to upload photos or videos</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPG, PNG, MP4, MOV</p>
            </>
          )}
        </div>
      </label>

      {/* Link input */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Link2 className="w-3.5 h-3.5 text-gold" />
          <Label className="text-xs text-muted-foreground normal-case tracking-normal">Or paste a link</Label>
        </div>
        <Input
          value={link}
          onChange={e => onLinkChange(e.target.value)}
          className="rounded-none h-11"
          placeholder="https://instagram.com/... or https://youtube.com/..."
        />
      </div>
    </div>
  );
}