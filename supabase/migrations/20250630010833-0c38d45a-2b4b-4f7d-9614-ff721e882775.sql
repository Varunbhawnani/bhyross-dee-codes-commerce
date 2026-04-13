
-- Add Imcolus as a brand option to existing brand_type enum
ALTER TYPE brand_type ADD VALUE IF NOT EXISTS 'imcolus';

-- Update banner_images table to support imcolus brand
ALTER TABLE public.banner_images DROP CONSTRAINT IF EXISTS banner_images_brand_check;
ALTER TABLE public.banner_images ADD CONSTRAINT banner_images_brand_check 
  CHECK (brand IN ('bhyross', 'deecodes', 'imcolus'));

-- Update categories table to support imcolus brand
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_brand_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_brand_check 
  CHECK (brand IN ('bhyross', 'deecodes', 'imcolus'));

-- Insert Imcolus categories
INSERT INTO public.categories (name, path, description, brand, image_url) VALUES
('Oxford', 'oxford', 'Classic closed-lace design for formal occasions', 'imcolus', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center'),
('Derby', 'derby', 'Versatile open-lace style for business and casual', 'imcolus', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=300&fit=crop&crop=center'),
('Monk Strap', 'monk-strap', 'Distinguished buckle closure with European flair', 'imcolus', 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=300&fit=crop&crop=center'),
('Loafer', 'loafer', 'Slip-on comfort with refined elegance', 'imcolus', 'https://images.unsplash.com/photo-1571245078683-3bbf52d98bf6?w=400&h=300&fit=crop&crop=center')
ON CONFLICT DO NOTHING;
