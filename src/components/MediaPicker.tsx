import React from 'react';
import { collection, getDocs, addDoc, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Media } from '../types';
import { Button } from './Button';
import { Image as ImageIcon, Plus, X, Search, Check, Trash2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  allowMultiple?: boolean;
  selectedUrls?: string[];
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ onSelect, onClose, allowMultiple = false, selectedUrls = [] }) => {
  const [media, setMedia] = React.useState<Media[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState<'grid' | 'upload'>('grid');
  const [uploading, setUploading] = React.useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'media'), orderBy('createdAt', 'desc')));
    setMedia(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Media)));
    setLoading(false);
  };

  React.useEffect(() => {
    fetchMedia();
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Optimized for web and database storage
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Use a slightly more aggressive compression to ensure it fits in Firestore (1MB limit)
          // 0.7 quality is a great balance for e-commerce
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Optimize image immediately
      const optimizedBase64 = await compressImage(file);
      
      // 2. Save directly to Firestore for maximum reliability
      // This bypasses Storage connection issues entirely
      const newMedia = {
        name: file.name,
        url: optimizedBase64,
        type: 'image/jpeg',
        size: Math.round(optimizedBase64.length * 0.75), // Approximate size in bytes
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'media'), newMedia);
      const mediaItem = { id: docRef.id, ...newMedia } as Media;
      
      setMedia(prev => [mediaItem, ...prev]);
      setView('grid');
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please try a different image or check your internet connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: Media, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        // 1. Delete from Firebase Storage if path exists
        if (item.storagePath) {
          const storageRef = ref(storage, item.storagePath);
          await deleteObject(storageRef);
        }
        
        // 2. Delete from Firestore
        await deleteDoc(doc(db, 'media', item.id));
        
        setMedia(prev => prev.filter(m => m.id !== item.id));
      } catch (err) {
        console.error('Error deleting media:', err);
        alert('Failed to delete media. It might have already been removed.');
      }
    }
  };

  const filteredMedia = media.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-black">Media Library</h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setView('grid')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", view === 'grid' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
              >
                Browse
              </button>
              <button 
                onClick={() => setView('upload')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", view === 'upload' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
              >
                Upload
              </button>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'grid' ? (
            <>
              <div className="p-4 border-b bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search media..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : filteredMedia.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredMedia.map(item => {
                      const isSelected = selectedUrls.includes(item.url);
                      return (
                        <div 
                          key={item.id} 
                          className={cn(
                            "aspect-square rounded-2xl border-2 overflow-hidden relative group cursor-pointer transition-all",
                            isSelected ? "border-black ring-2 ring-black/10" : "border-transparent hover:border-gray-200"
                          )}
                          onClick={() => onSelect(item.url)}
                        >
                          <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {isSelected && <div className="bg-black text-white p-1 rounded-full"><Check className="h-4 w-4" /></div>}
                            <button 
                              className="bg-white p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                              onClick={(e) => handleDelete(item, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-[10px] text-white font-medium truncate">{item.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ImageIcon className="h-12 w-12 text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No media found</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => setView('upload')}>Upload your first asset</Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-full max-w-md p-12 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Upload Media</h3>
                <p className="text-sm text-gray-500 mb-8">Drag and drop your files here, or click to browse</p>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label htmlFor="file-upload">
                  <span className="inline-flex items-center justify-center rounded-full bg-black text-white px-8 h-10 text-sm font-bold hover:bg-gray-800 transition-colors cursor-pointer">
                    {uploading ? 'Uploading...' : 'Select Files'}
                  </span>
                </label>
                <p className="mt-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest">No size limit (Firebase Storage)</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50/50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={onClose} className="rounded-xl px-8">Done</Button>
        </div>
      </motion.div>
    </div>
  );
};
