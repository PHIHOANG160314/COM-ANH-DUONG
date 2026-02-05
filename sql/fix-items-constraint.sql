-- Fix items column constraint
ALTER TABLE public.orders ALTER COLUMN items DROP NOT NULL;
