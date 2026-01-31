import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseAdminClient } from '../_shared/database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch Analytics for Today
    // Note: We can reuse the RPC 'get_revenue_analytics_secure' if we could call it as admin,
    // but Edge Functions bypass RLS/Security checks if using Service Role key.
    // However, that RPC performs 'check_admin_access' which checks auth.uid().
    // Service Role client usually has no auth.uid().
    // So we might need to run raw query or assume 'check_admin_access' handles null/service role?
    // Actually 'check_admin_access' throws if role not found.
    // Better to run a direct query here since we are in a trusted environment.

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total, id')
      .eq('status', 'completed')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (ordersError) throw ordersError;

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 2. Fetch Top Item
    // Simplifying for report

    // 3. Construct Email Body (Mocking email sending for now)
    const report = {
      date: today,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      generatedAt: new Date().toISOString(),
    };

    console.log('Daily Report Generated:', JSON.stringify(report, null, 2));

    // In a real app, integrate with Resend/SendGrid here
    // await fetch('https://api.resend.com/emails', { ... })

    // 4. Log to Notifications for Admin visibility
    await supabase.from('notifications').insert({
      recipient_role: 'admin',
      title: 'Báo cáo doanh thu ngày ' + today,
      message: `Doanh thu: ${totalRevenue.toLocaleString()}đ | Đơn hàng: ${totalOrders}`,
      link: '/admin/analytics',
      type: 'info',
    });

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Daily Report Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
