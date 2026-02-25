import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Users,
  Calendar,
  Sparkles,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GalleryItem } from '@/types';
import { useGalleryStore } from '@/stores';
import { motion, AnimatePresence } from 'framer-motion';

// Categories for filtering
const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  CEREMONY: { label: 'Ceremonies', icon: Award, color: 'text-yellow-400 bg-yellow-500/10' },
  TOPPERS: { label: 'Toppers', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10' },
  EVENTS: { label: 'Events', icon: Calendar, color: 'text-blue-400 bg-blue-500/10' },
  OTHER: { label: 'Other', icon: Users, color: 'text-muted-foreground bg-secondary/20' },
};

export function GalleryPage() {
  const { items, isLoading, fetchGallery } = useGalleryStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const featuredItems = items.filter(item => (item as any).featured);

  const openLightbox = (item: GalleryItem) => {
    setLightboxImage(item);
    setCurrentIndex(filteredItems.findIndex(i => i.id === item.id));
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % filteredItems.length;
    setCurrentIndex(newIndex);
    setLightboxImage(filteredItems[newIndex]);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setCurrentIndex(newIndex);
    setLightboxImage(filteredItems[newIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, currentIndex]);

  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all mb-8 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:justify-between">
              <div className="flex items-center gap-6">
                <div className="size-20 rounded-3xl bg-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,165,0,0.2)]">
                  <Image className="size-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-7xl font-bold mb-2 premium-text-gradient">Photo Gallery</h1>
                  <p className="text-xl text-muted-foreground italic tracking-widest font-bold">फोटो गैलरी</p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Celebrating academic excellence through memorable moments from our scholarship programs,
                certificate distribution ceremonies, and events.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Featured Section */}
        {featuredItems.length > 0 && selectedCategory === 'all' && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 text-foreground">
              <Sparkles className="size-8 text-yellow-500" />
              Featured Highlights
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => openLightbox(item)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[16/10] relative rounded-[2rem] overflow-hidden bg-background border border-border">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-muted-foreground text-sm line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      Featured
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-4 mb-16 pb-8 border-b border-border">
          <div className="flex items-center gap-3 text-muted-foreground mr-4">
            <Filter className="size-5" />
            <span className="text-sm font-black uppercase tracking-widest">Filter:</span>
          </div>
          <button
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === 'all'
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(33,150,243,0.3)]'
                : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/30'
              }`}
            onClick={() => setSelectedCategory('all')}
          >
            All Photos ({items.length})
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = items.filter(i => i.category === key).length;
            const IconComponent = config.icon;
            return (
              <button
                key={key}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === key
                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(33,150,243,0.3)]'
                    : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/30'
                  }`}
                onClick={() => setSelectedCategory(key)}
              >
                <IconComponent className="size-4" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const CategoryIcon = categoryConfig[item.category].icon;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(item)}
                >
                  <div className="bg-background rounded-[2.5rem] overflow-hidden border border-border transition-all group-hover:border-primary/30 group-hover:shadow-[0_0_40px_rgba(33,150,243,0.1)]">
                    <div className="aspect-square relative overflow-hidden bg-[#030712]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${imagesLoaded[item.id] ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(item.id)}
                      />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-xl backdrop-blur-md shadow-2xl ${categoryConfig[item.category].color} border border-border`}>
                          <CategoryIcon className="size-3" />
                          {categoryConfig[item.category].label}
                        </span>
                      </div>
                      {item.year && (
                        <span className="absolute top-4 right-4 bg-background/80 backdrop-blur-md text-foreground text-[10px] font-black px-3 py-1.5 rounded-xl border border-border tracking-widest">
                          {item.year}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                      {item.description && (
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <div className="size-32 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Image className="size-16 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">No photos found</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We haven't uploaded any photos to this category yet. Please check back later!
            </p>
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#030712]/98 backdrop-blur-2xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors z-[110] bg-background/80 p-4 rounded-full border border-border"
              onClick={closeLightbox}
            >
              <X className="size-8" />
            </button>

            {/* Navigation Buttons */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between z-[110] pointer-events-none">
              <button
                className="size-20 bg-input hover:bg-secondary/30 text-foreground p-4 rounded-full transition-all pointer-events-auto flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <ChevronLeft className="size-12" />
              </button>
              <button
                className="size-20 bg-input hover:bg-secondary/30 text-foreground p-4 rounded-full transition-all pointer-events-auto flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <ChevronRight className="size-12" />
              </button>
            </div>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-7xl w-full mx-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-background border-border rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.1)] border">
                <img
                  src={lightboxImage.imageUrl}
                  alt={lightboxImage.title}
                  className="w-full max-h-[75vh] object-contain bg-[#030712]/50"
                />
                <div className="p-10 border-t border-border bg-background/60 backdrop-blur-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-3xl font-bold text-foreground mb-2">{lightboxImage.title}</h3>
                      {lightboxImage.description && (
                        <p className="text-muted-foreground text-lg leading-relaxed">{lightboxImage.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${categoryConfig[lightboxImage.category].color}`}>
                        {categoryConfig[lightboxImage.category].label}
                      </span>
                      {lightboxImage.year && (
                        <span className="text-muted-foreground font-black tracking-tighter text-2xl">{lightboxImage.year}</span>
                      )}
                      <div className="text-muted-foreground/40 font-mono text-xl">
                        {currentIndex + 1} <span className="opacity-50 mx-1">/</span> {filteredItems.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
