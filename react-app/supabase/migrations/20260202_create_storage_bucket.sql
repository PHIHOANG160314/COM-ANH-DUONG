-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('menu-images', 'menu-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Allow public read access to menu-images bucket
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

-- Allow authenticated users (service role) to upload images
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'menu-images');

-- Allow authenticated users (service role) to update images
CREATE POLICY "Authenticated update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'menu-images');
