import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];

export interface ParsedMenuItem {
    'Tên món ăn': string;
    'Giá bán (VNĐ)': number;
    'Loại món': string;
}

export const useImportMenuMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (parsedItems: ParsedMenuItem[]) => {
            // 1. Fetch all categories to map "Loại món" to "category_id"
            const { data: categories, error: catError } = await supabase
                .from('categories')
                .select('id, name');

            if (catError) {
                throw new Error(`Failed to fetch categories: ${catError.message}`);
            }

            // Map category name -> UUID
            // Build multiple lookup keys: exact name, uppercase, and common aliases
            const categoryMap = new Map<string, string>();
            categories.forEach((cat) => {
                categoryMap.set(cat.name.toUpperCase(), cat.id);
            });

            // Alias map: common Excel abbreviations/no-diacritics -> DB category name (uppercase)
            const CATEGORY_ALIASES: Record<string, string> = {
                // No-diacritics aliases
                'THIT': 'THỊT',
                'CA': 'CÁ',
                'CANH': 'CANH',
                'VIT + GA': 'VỊT + GÀ',
                'VIT+GA': 'VỊT + GÀ',
                'VITGA': 'VỊT + GÀ',
                'VIT': 'VỊT + GÀ',
                'GA': 'VỊT + GÀ',
                'KHAC': 'KHÁC',
                'CHAY': 'CHAY',
                'XAO': 'XÀO',
                'COM': 'CƠM',
                'DO UONG': 'ĐỒ UỐNG',
                'DOUONG': 'ĐỒ UỐNG',
                'TRANG MIENG': 'TRÁNG MIỆNG',
                'TRANGMIENG': 'TRÁNG MIỆNG',
                // Common abbreviations from old system
                'THUC AN': 'THỊT',
                'MON CHINH': 'THỊT',
                'HH': 'THỊT',
                'HHI': 'THỊT',
            };

            // 2. Prepare payload for upsert
            const upsertPayload: MenuItemInsert[] = parsedItems.map((item) => {
                const categoryName = item['Loại món'] ? item['Loại món'].toString().trim().toUpperCase() : '';
                let categoryId = categoryMap.get(categoryName);

                // Try alias lookup if exact match fails
                if (!categoryId) {
                    const aliasTarget = CATEGORY_ALIASES[categoryName];
                    if (aliasTarget) {
                        categoryId = categoryMap.get(aliasTarget);
                    }
                }

                // Final fallback: try removing diacritics from DB names to match
                if (!categoryId && categoryName) {
                    for (const [dbName, id] of categoryMap.entries()) {
                        const dbNameNoDiacritics = dbName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toUpperCase();
                        if (dbNameNoDiacritics === categoryName) {
                            categoryId = id;
                            break;
                        }
                    }
                }

                return {
                    name: item['Tên món ăn'].trim(),
                    price: Number(item['Giá bán (VNĐ)']),
                    category_id: categoryId,
                    // other defaults
                    is_active: true,
                    is_sold_out: false,
                    stock_quantity: 100, // default stock
                    description: '',
                };
            });

            // 3. Perform Upsert to Supabase
            // Supabase `upsert` requires a unique constraint.
            // Assumes "name" is unique in `menu_items` table for upsert to work properly, 
            // otherwise we need to do a select first, then update/insert individually.

            // Because `name` may not be a unique constraint at DB level, we'll do manual select & update/insert.
            const results = { added: 0, updated: 0, failed: 0 };

            for (const item of upsertPayload) {
                try {
                    // Find existing item by name
                    const { data: existing, error: searchError } = await supabase
                        .from('menu_items')
                        .select('id')
                        .eq('name', item.name)
                        .maybeSingle();

                    if (searchError && searchError.code !== 'PGRST116') {
                        console.error("Search error", searchError);
                        results.failed++;
                        continue;
                    }

                    if (existing) {
                        // UPDATE
                        const { error: updateError } = await supabase
                            .from('menu_items')
                            .update({
                                price: item.price,
                                category_id: item.category_id,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', existing.id);

                        if (updateError) throw updateError;
                        results.updated++;
                    } else {
                        // INSERT
                        const { error: insertError } = await supabase
                            .from('menu_items')
                            .insert([item]);

                        if (insertError) throw insertError;
                        results.added++;
                    }
                } catch (e) {
                    console.error(`Failed to process item ${item.name}`, e);
                    results.failed++;
                }
            }

            return results;
        },
        onSuccess: () => {
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['all-menu-items'] });
            queryClient.invalidateQueries({ queryKey: ['daily-menu'] });
        },
    });
};
