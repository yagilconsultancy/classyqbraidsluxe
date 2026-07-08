import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Loader2, ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';

export default function InspirationUpload({ media = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const isVideo = (url) => /\.(mp4|mov|webm|avi|mkv|m4v)(\?|$)/i.test(url);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (file_url) uploaded.push(file_url);
      }
      onChange([...(media || []), ...uploaded]);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeItem = (idx) => {
    onChange((media || []).filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Upload reference photos or videos of the look you want.
        </p>
      </div>

      {(media && media.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {media.map((url, idx) => (
            <div key={idx} className="relative group aspect-square border border-border overflow-hidden bg-secondary/30">
              {isVideo(url) ? (
                <video src={url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={url} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-onyx/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 text-white bg-onyx/50 rounded px-1 text-[8px]">
                {isVideo(url) ? <Video className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
              </span>
            </div>
          ))}
        </div>
      )}

      <label className="block cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFiles}
          className="hidden"
          disabled={uploading}
        />
        <div className="border-2 border-dashed border-border hover:border-gold transition-colors p-5 text-center">
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-gold animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Tap to upload photos or videos</p>
            </>
          )}
        </div>
      </label>
    </div>
  );
}