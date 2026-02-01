import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';
import { Debug } from '@/shared/utils/debug';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// Demo data for when Supabase is not configured - uses AI-generated images
const DEMO_PRODUCTS: (Product & { categories: Category | null })[] = [
  // Cơm Phần (Rice Dishes)
  {
    id: 'demo-1',
    name: 'Cơm Sườn Nướng',
    description: 'Sườn heo nướng than hồng, ăn kèm dưa leo, cà chua',
    price: 45000,
    image_url: '/images/menu/com_suon_nuong.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-2',
    name: 'Cơm Gà Xối Mỡ',
    description: 'Đùi gà chiên giòn, nước mắm tỏi ớt đặc biệt',
    price: 40000,
    image_url: '/images/menu/com_ga_xoi_mo.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-3',
    name: 'Cơm Tấm Bì Chả',
    description: 'Bì heo, chả trứng, mỡ hành, đồ chua',
    price: 35000,
    image_url: '/images/menu/com_tam_bi_cha.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-4',
    name: 'Sườn Cốt Lết Chiên',
    description: 'Sườn cốt lết chiên giòn, ăn kèm rau sống',
    price: 48000,
    image_url: '/images/menu/suon_cot_let_chien.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-5',
    name: 'Đùi Gà Chiên Nước Mắm',
    description: 'Đùi gà chiên nước mắm tỏi ớt đậm đà',
    price: 42000,
    image_url: '/images/menu/dui_ga_chien_nuoc_mam.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },

  // Phở & Bún (Noodle Soups)
  {
    id: 'demo-6',
    name: 'Phở Bò Tái',
    description: 'Phở bò tái chín, nước dùng xương hầm 8 tiếng',
    price: 50000,
    image_url: '/images/menu/pho_bo_tai.png',
    category_id: 'cat-2',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-2',
      name: 'Phở & Bún',
      slug: 'pho-bun',
      image_url: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-7',
    name: 'Bún Bò Huế',
    description: 'Bún bò Huế cay nồng, giò heo, huyết',
    price: 55000,
    image_url: '/images/menu/bun_bo_hue.png',
    category_id: 'cat-2',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-2',
      name: 'Phở & Bún',
      slug: 'pho-bun',
      image_url: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },

  // Bánh Mì & Snacks
  {
    id: 'demo-8',
    name: 'Bánh Mì Đặc Biệt',
    description: 'Pate, chả lụa, thịt nguội, rau thơm',
    price: 25000,
    image_url: '/images/menu/banh_mi_dac_biet.png',
    category_id: 'cat-3',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-3',
      name: 'Bánh Mì',
      slug: 'banh-mi',
      image_url: null,
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-9',
    name: 'Ba Sọi Chiên Nước Mắm',
    description: 'Ba chỉ chiên giòn, nước mắm ngon',
    price: 52000,
    image_url: '/images/menu/ba_soi_chien_nuoc_mam.png',
    category_id: 'cat-3',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-3',
      name: 'Bánh Mì',
      slug: 'banh-mi',
      image_url: null,
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },

  // Món Xào (Stir-Fried)
  {
    id: 'demo-10',
    name: 'Bò Xào Đậu Hồng',
    description: 'Bò xào đậu hồng, thơm ngon bổ dưỡng',
    price: 60000,
    image_url: '/images/menu/bo_xao_dau_hong.png',
    category_id: 'cat-4',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-4',
      name: 'Món Xào',
      slug: 'mon-xao',
      image_url: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-11',
    name: 'Gà Xào Sả Ớt',
    description: 'Gà xào sả ớt cay thơm, đậm đà',
    price: 55000,
    image_url: '/images/menu/ga_xao_sa_ot.png',
    category_id: 'cat-4',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-4',
      name: 'Món Xào',
      slug: 'mon-xao',
      image_url: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-12',
    name: 'Heo Quay Xào Dưa Cải',
    description: 'Heo quay giòn xào dưa cải chua',
    price: 58000,
    image_url: '/images/menu/heo_quay_xao_dua_cai.png',
    category_id: 'cat-4',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-4',
      name: 'Món Xào',
      slug: 'mon-xao',
      image_url: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-13',
    name: 'Vịt Xào Gừng',
    description: 'Vịt xào gừng thơm ngon, đậm đà',
    price: 65000,
    image_url: '/images/menu/vit_xao_gung.png',
    category_id: 'cat-4',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-4',
      name: 'Món Xào',
      slug: 'mon-xao',
      image_url: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },

  // Món Kho & Canh (Stewed & Soup)
  {
    id: 'demo-14',
    name: 'Thịt Kho Tiêu',
    description: 'Thịt kho tiêu đậm đà, ăn kèm cơm',
    price: 45000,
    image_url: '/images/menu/thit_kho_tieu.png',
    category_id: 'cat-5',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-5',
      name: 'Món Kho & Canh',
      slug: 'mon-kho-canh',
      image_url: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-15',
    name: 'Thịt Kho Trứng',
    description: 'Thịt kho trứng cút, vị ngọt tự nhiên',
    price: 48000,
    image_url: '/images/menu/thit_kho_trung.png',
    category_id: 'cat-5',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-5',
      name: 'Món Kho & Canh',
      slug: 'mon-kho-canh',
      image_url: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-16',
    name: 'Cá Ngừ Kho Khóm',
    description: 'Cá ngừ kho khóm chua ngọt',
    price: 55000,
    image_url: '/images/menu/ca_ngu_kho_khom.png',
    category_id: 'cat-5',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-5',
      name: 'Món Kho & Canh',
      slug: 'mon-kho-canh',
      image_url: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-17',
    name: 'Cá Rô Kho Mỡ Hành',
    description: 'Cá rô kho mỡ hành thơm ngon',
    price: 52000,
    image_url: '/images/menu/ca_ro_kho_mo_hanh.png',
    category_id: 'cat-5',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-5',
      name: 'Món Kho & Canh',
      slug: 'mon-kho-canh',
      image_url: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-18',
    name: 'Canh Chua Cá Bạc',
    description: 'Canh chua cá bạc miền Tây',
    price: 50000,
    image_url: '/images/menu/canh_chua_ca_ba.png',
    category_id: 'cat-5',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-5',
      name: 'Món Kho & Canh',
      slug: 'mon-kho-canh',
      image_url: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-19',
    name: 'Canh Khổ Qua Dồn Thịt',
    description: 'Canh khổ qua dồn thịt thanh mát',
    price: 48000,
    image_url: '/images/menu/canh_kho_qua_don_thit.png',
    category_id: 'cat-5',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-5',
      name: 'Món Kho & Canh',
      slug: 'mon-kho-canh',
      image_url: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },

  // Món Chiên (Fried)
  {
    id: 'demo-20',
    name: 'Cá Lóc Muối Chiên',
    description: 'Cá lóc muối chiên giòn, vị đậm đà',
    price: 60000,
    image_url: '/images/menu/ca_loc_muoi_chien.png',
    category_id: 'cat-6',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-6',
      name: 'Món Chiên',
      slug: 'mon-chien',
      image_url: null,
      sort_order: 6,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-21',
    name: 'Kho Cá Diêu Chiên',
    description: 'Cá diêu chiên giòn, kho đậm đà',
    price: 58000,
    image_url: '/images/menu/kho_ca_dieu_chien.png',
    category_id: 'cat-6',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-6',
      name: 'Món Chiên',
      slug: 'mon-chien',
      image_url: null,
      sort_order: 6,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },

  // Đồ Uống (Beverages)
  {
    id: 'demo-22',
    name: 'Cà Phê Sữa Đá',
    description: 'Cà phê phin truyền thống, sữa đặc',
    price: 25000,
    image_url: '/images/menu/ca_phe_sua_da.png',
    category_id: 'cat-7',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-7',
      name: 'Đồ Uống',
      slug: 'do-uong',
      image_url: null,
      sort_order: 7,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-23',
    name: 'Bạc Xỉu',
    description: 'Cà phê sữa ngọt pha nhẹ',
    price: 28000,
    image_url: '/images/menu/bac_xiu.png',
    category_id: 'cat-7',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-7',
      name: 'Đồ Uống',
      slug: 'do-uong',
      image_url: null,
      sort_order: 7,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-24',
    name: 'Sữa Chua Đánh Đá',
    description: 'Sữa chua đánh đá mát lạnh',
    price: 30000,
    image_url: '/images/menu/sua_chua_danh_da.png',
    category_id: 'cat-7',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-7',
      name: 'Đồ Uống',
      slug: 'do-uong',
      image_url: null,
      sort_order: 7,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },

  // New Items (Part 1)
  {
    id: 'demo-25',
    name: 'Bánh Phồng Tôm Sa Giang',
    description: 'Bánh phồng tôm giòn tan, vị tôm thơm ngon',
    price: 15000,
    image_url: '/images/menu/banh_phong_tom_sa_giang.png',
    category_id: 'cat-3',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-3',
      name: 'Bánh Mì',
      slug: 'banh-mi',
      image_url: null,
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-26',
    name: 'Bún Cá Basa Kho',
    description: 'Bún cá basa kho thơm ngon đậm đà',
    price: 50000,
    image_url: '/images/menu/bun_ca_basa_kho.png',
    category_id: 'cat-2',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-2',
      name: 'Phở & Bún',
      slug: 'pho-bun',
      image_url: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-27',
    name: 'Cá Lóc Nướng Lá Sen',
    description: 'Cá lóc nướng lá sen thơm lừng, đặc sản miền Tây',
    price: 85000,
    image_url: '/images/menu/ca_loc_nuong_la_sen.png',
    category_id: 'cat-6',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-6',
      name: 'Món Chiên',
      slug: 'mon-chien',
      image_url: null,
      sort_order: 6,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-28',
    name: 'Đậu Hủ Chiên Sả',
    description: 'Đậu hủ chiên giòn xào sả ớt thơm ngon',
    price: 35000,
    image_url: '/images/menu/dau_hu_chien_sa.png',
    category_id: 'cat-4',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-4',
      name: 'Món Xào',
      slug: 'mon-xao',
      image_url: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-29',
    name: 'Đậu Hủ Dồn Thịt Sốt Cà',
    description: 'Đậu hủ dồn thịt sốt cà chua ngọt thanh',
    price: 40000,
    image_url: '/images/menu/dau_hu_don_thit_sot_ca.png',
    category_id: 'cat-4',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-4',
      name: 'Món Xào',
      slug: 'mon-xao',
      image_url: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
];

const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Cơm Phần',
    slug: 'com-phan',
    image_url: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Phở & Bún',
    slug: 'pho-bun',
    image_url: null,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Bánh Mì',
    slug: 'banh-mi',
    image_url: null,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Món Xào',
    slug: 'mon-xao',
    image_url: null,
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    name: 'Món Kho & Canh',
    slug: 'mon-kho-canh',
    image_url: null,
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-6',
    name: 'Món Chiên',
    slug: 'mon-chien',
    image_url: null,
    sort_order: 6,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-7',
    name: 'Đồ Uống',
    slug: 'do-uong',
    image_url: null,
    sort_order: 7,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const useDailyMenu = () => {
  return useQuery({
    queryKey: ['daily-menu'],
    queryFn: async () => {
      // Return demo data if Supabase is not configured
      if (!hasSupabaseConfig) {
        Debug.warn('⚠️ Supabase not configured - showing demo menu');
        return DEMO_PRODUCTS;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select(
            `
          *,
          categories (
            id,
            name,
            sort_order
          )
        `
          )
          .eq('is_active', true)
          .order('name');

        // If error from Supabase (e.g., 401 with placeholder credentials), fallback to demo
        if (error) {
          Debug.warn('⚠️ Supabase error - falling back to demo menu:', error.message);
          return DEMO_PRODUCTS;
        }

        return data as (Product & { categories: Category | null })[];
      } catch (err) {
        // Catch any network or auth errors and fallback to demo
        Debug.warn('⚠️ Failed to fetch menu - falling back to demo:', err);
        return DEMO_PRODUCTS;
      }
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Return demo data if Supabase is not configured
      if (!hasSupabaseConfig) {
        Debug.warn('⚠️ Supabase not configured - showing demo categories');
        return DEMO_CATEGORIES;
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        // If error from Supabase (e.g., 401 with placeholder credentials), fallback to demo
        if (error) {
          Debug.warn('⚠️ Supabase error - falling back to demo categories:', error.message);
          return DEMO_CATEGORIES;
        }

        return data as Category[];
      } catch (err) {
        // Catch any network or auth errors and fallback to demo
        Debug.warn('⚠️ Failed to fetch categories - falling back to demo:', err);
        return DEMO_CATEGORIES;
      }
    },
  });
};
