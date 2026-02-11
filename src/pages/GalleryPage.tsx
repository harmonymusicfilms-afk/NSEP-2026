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
import { APP_CONFIG } from '@/constants/config';

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: 'CEREMONY' | 'TOPPERS' | 'EVENTS' | 'OTHER';
  year?: number;
  featured: boolean;
}

// Mock gallery data with placeholder images
const mockGalleryItems: GalleryItem[] = [
  // Certificate Distribution Ceremonies
  {
    id: '1',
    title: 'Annual Certificate Distribution 2025',
    description: 'Chief Guest distributing certificates to top performers',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    category: 'CEREMONY',
    year: 2025,
    featured: true,
  },
  {
    id: '2',
    title: 'Scholarship Award Ceremony',
    description: 'Winners receiving scholarship cheques',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'CEREMONY',
    year: 2025,
    featured: false,
  },
  {
    id: '3',
    title: 'State Level Felicitation',
    description: 'State toppers being honored',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    category: 'CEREMONY',
    year: 2024,
    featured: false,
  },
  {
    id: '4',
    title: 'Regional Award Function',
    description: 'District-wise topper recognition',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
    category: 'CEREMONY',
    year: 2024,
    featured: false,
  },
  // Toppers
  {
    id: '5',
    title: 'Class 12 Topper - Rahul Sharma',
    description: 'All India Rank 1 with 98.5% marks',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=600&fit=crop',
    category: 'TOPPERS',
    year: 2025,
    featured: true,
  },
  {
    id: '6',
    title: 'Class 10 Topper - Priya Verma',
    description: 'State Rank 1 in GPHDM Scholarship Exam',
    imageUrl: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop',
    category: 'TOPPERS',
    year: 2025,
    featured: false,
  },
  {
    id: '7',
    title: 'Junior Category Winners',
    description: 'Class 1-5 top performers',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
    category: 'TOPPERS',
    year: 2024,
    featured: false,
  },
  {
    id: '8',
    title: 'Middle School Champions',
    description: 'Class 6-8 scholarship winners',
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop',
    category: 'TOPPERS',
    year: 2024,
    featured: false,
  },
  // Events
  {
    id: '9',
    title: 'Examination Day 2025',
    description: 'Students appearing for GPHDM examination',
    imageUrl: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=600&fit=crop',
    category: 'EVENTS',
    year: 2025,
    featured: true,
  },
  {
    id: '10',
    title: 'Center Coordinator Meeting',
    description: 'Annual meeting of registered centers',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
    category: 'EVENTS',
    year: 2025,
    featured: false,
  },
  {
    id: '11',
    title: 'Awareness Campaign',
    description: 'Rural outreach program for scholarship awareness',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop',
    category: 'EVENTS',
    year: 2024,
    featured: false,
  },
  {
    id: '12',
    title: 'Teacher Training Workshop',
    description: 'Capacity building for examination coordinators',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    category: 'EVENTS',
    year: 2024,
    featured: false,
  },
  // Other
  {
    id: '13',
    title: 'GPHDM Team',
    description: 'Our dedicated team working for student success',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    category: 'OTHER',
    year: 2025,
    featured: false,
  },
  {
    id: '14',
    title: 'Certificate Design',
    description: 'Sample scholarship certificate',
    imageUrl: 'https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=800&h=600&fit=crop',
    category: 'OTHER',
    year: 2025,
    featured: false,
  },
];

const categoryConfig = {
  CEREMONY: { label: 'Ceremonies', icon: Award, color: 'text-yellow-600 bg-yellow-100' },
  TOPPERS: { label: 'Toppers', icon: Sparkles, color: 'text-purple-600 bg-purple-100' },
  EVENTS: { label: 'Events', icon: Calendar, color: 'text-blue-600 bg-blue-100' },
  OTHER: { label: 'Other', icon: Users, color: 'text-gray-600 bg-gray-100' },
};

export function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const filteredItems = selectedCategory === 'all'
    ? mockGalleryItems
    : mockGalleryItems.filter(item => item.category === selectedCategory);

  const featuredItems = mockGalleryItems.filter(item => item.featured);

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

  // Handle keyboard navigation
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
              <Image className="size-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold">Photo Gallery</h1>
              <p className="text-white/80">फोटो गैलरी</p>
            </div>
          </div>
          <p className="text-xl text-white/80 max-w-2xl">
            Celebrating academic excellence through memorable moments from our scholarship programs, 
            certificate distribution ceremonies, and events.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Featured Section */}
        {featuredItems.length > 0 && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="size-6 text-yellow-500" />
              Featured Highlights
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                  onClick={() => openLightbox(item)}
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    {!imagesLoaded[item.id] && (
                      <div className="absolute inset-0 bg-muted animate-pulse" />
                    )}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        imagesLoaded[item.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(item.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-white/80 line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <span className="absolute top-2 right-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                      Featured
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="size-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All Photos ({mockGalleryItems.length})
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = mockGalleryItems.filter(i => i.category === key).length;
            const IconComponent = config.icon;
            return (
              <Button
                key={key}
                size="sm"
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key)}
                className="gap-2"
              >
                <IconComponent className="size-4" />
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const CategoryIcon = categoryConfig[item.category].icon;
            return (
              <Card
                key={item.id}
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                onClick={() => openLightbox(item)}
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {!imagesLoaded[item.id] && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                      imagesLoaded[item.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(item.id)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${categoryConfig[item.category].color}`}>
                      <CategoryIcon className="size-3" />
                      {categoryConfig[item.category].label}
                    </span>
                  </div>
                  {item.year && (
                    <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {item.year}
                    </span>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Image className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No photos found</h3>
            <p className="text-muted-foreground">
              No photos available in this category yet.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={closeLightbox}
          >
            <X className="size-8" />
          </button>

          {/* Navigation Buttons */}
          <button 
            className="absolute left-4 text-white/80 hover:text-white z-10 p-2"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            <ChevronLeft className="size-10" />
          </button>
          <button 
            className="absolute right-4 text-white/80 hover:text-white z-10 p-2"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            <ChevronRight className="size-10" />
          </button>

          {/* Image */}
          <div 
            className="max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              className="max-w-full max-h-[75vh] object-contain"
            />
            <div className="text-white text-center mt-4">
              <h3 className="text-xl font-semibold">{lightboxImage.title}</h3>
              {lightboxImage.description && (
                <p className="text-white/70 mt-1">{lightboxImage.description}</p>
              )}
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-white/60">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${categoryConfig[lightboxImage.category].color}`}>
                  {categoryConfig[lightboxImage.category].label}
                </span>
                {lightboxImage.year && <span>{lightboxImage.year}</span>}
                <span>{currentIndex + 1} / {filteredItems.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
