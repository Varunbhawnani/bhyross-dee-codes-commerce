// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { original_order_id, return_items, customer_address, warehouse_address } = await req.json();

    if (!original_order_id || !return_items || !customer_address || !warehouse_address) {
      throw new Error('All fields are required');
    }

    // Initialize Supabase client
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Shiprocket credentials
    // @ts-ignore
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
    // @ts-ignore
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');
    // @ts-ignore
    const shiprocketChannelId = Deno.env.get('SHIPROCKET_CHANNEL_ID');

    if (!shiprocketEmail || !shiprocketPassword) {
      throw new Error('Shiprocket credentials not configured');
    }

    // 1. Authenticate with Shiprocket
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      throw new Error('Shiprocket authentication failed');
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // 2. Prepare return order data
    const returnOrderId = `RTN_${original_order_id}_${Date.now()}`;
    
    const shiprocketReturnOrder = {
      order_id: returnOrderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: shiprocketChannelId || '',
      comment: `Return order for ${original_order_id}`,
      
      // Pickup details (from customer)
      billing_customer_name: customer_address.name?.split(' ')[0] || 'Customer',
      billing_last_name: customer_address.name?.split(' ').slice(1).join(' ') || '',
      billing_address: customer_address.address,
      billing_city: customer_address.city,
      billing_pincode: customer_address.pincode,
      billing_state: customer_address.state,
      billing_country: 'India',
      billing_email: customer_address.email,
      billing_phone: customer_address.phone,
      
      // Shipping details (to warehouse)
      shipping_is_billing: false,
      shipping_customer_name: warehouse_address.name?.split(' ')[0] || 'Warehouse',
      shipping_last_name: warehouse_address.name?.split(' ').slice(1).join(' ') || '',
      shipping_address: warehouse_address.address,
      shipping_city: warehouse_address.city,
      shipping_pincode: warehouse_address.pincode,
      shipping_state: warehouse_address.state,
      shipping_country: 'India',
      shipping_email: warehouse_address.email,
      shipping_phone: warehouse_address.phone,
      
      // Return items
      order_items: return_items.map((item: Record<string, any>) => ({
        name: item.name || 'Return Item',
        sku: item.sku || `RTN_${item.product_id}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0, // Tax already included in price (5% inclusive)
        hsn: 64039900, // HSN code for footwear
      })),
      
      // Payment and shipping details
      payment_method: 'Prepaid', // Return orders are typically prepaid
      sub_total: return_items.reduce((total: number, item: Record<string, any>) => total + (item.price * item.quantity), 0),
      length: 34, // Standard shoe box dimensions
      breadth: 19,
      height: 12,
      weight: 0.9 * return_items.reduce((total: number, item: Record<string, any>) => total + item.quantity, 0),
    };

    // 3. Create return order in Shiprocket
    const orderResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketReturnOrder),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(`Shiprocket return order creation failed: ${JSON.stringify(errorData)}`);
    }

    const shiprocketResult = await orderResponse.json();

    // 4. Update original order with return information
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        return_awb_code: shiprocketResult.awb_code,
        status: 'return_initiated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', original_order_id);

    if (updateError) {
      console.error('Failed to update order with return details:', updateError);
      // Don't fail the entire process, just log the error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          return_order_id: returnOrderId,
          ...shiprocketResult
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Return order creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});