// Function Name: create-shiprocket-order
// Copy and paste this code in the Supabase dashboard:
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in';

interface AdhocOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  comment?: string;
  reseller_name?: string;
  company_name?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_isd_code?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  billing_alternate_phone?: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_country?: string;
  shipping_state?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: string;
    selling_price: string;
    discount?: string;
    tax?: string;
    hsn?: string;
  }>;
  payment_method: string;
  shipping_charges?: string;
  giftwrap_charges?: string;
  transaction_charges?: string;
  total_discount?: string;
  sub_total: string;
  length: string;
  breadth: string;
  height: string;
  weight: string;
  ewaybill_no?: string;
  customer_gstin?: string;
  invoice_number?: string;
  order_type?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting Shiprocket adhoc order creation...');
    
    const requestBody = await req.json();
    const { orderId, adhocData, codAmount, useAdhoc } = requestBody;
    
    if (!orderId && !adhocData) {
      throw new Error('Either Order ID or adhoc data is required');
    }
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // @ts-ignore
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
    // @ts-ignore
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');

    if (!shiprocketEmail || !shiprocketPassword) {
      throw new Error('Shiprocket credentials not configured');
    }

    console.log('🔐 Authenticating with Shiprocket...');
    const authResponse = await fetch(`${SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Ecommerce-App/1.0'
      },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      throw new Error(`Authentication failed: ${authError}`);
    }

    const authData = await authResponse.json();
    const token = authData.token;

    if (!token) {
      throw new Error('No authentication token received');
    }

    console.log('✅ Authentication successful');

    let shiprocketOrder: AdhocOrderPayload;

    if (adhocData) {
      console.log('📦 Using provided adhoc data');
      shiprocketOrder = adhocData;
    } else {
      console.log('📦 Fetching order from database:', orderId);
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              sku,
              weight,
              price,
              brand
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error(`Order not found: ${orderError?.message || 'Unknown error'}`);
      }

      if (!order.shipping_address || !order.order_items?.length) {
        throw new Error('Order missing required data');
      }

      const shippingAddress = order.shipping_address as any;
      const billingAddress = order.billing_address || shippingAddress;

      const parseFullName = (fullName: string) => {
        const parts = (fullName || '').trim().split(/\s+/);
        return {
          firstName: parts[0] || 'Customer',
          lastName: parts.slice(1).join(' ') || 'User'
        };
      };

      const shippingName = parseFullName(shippingAddress.name);
      const billingName = parseFullName(billingAddress.name);
      const totalQuantity = order.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      
      const orderDate = new Date(order.created_at || Date.now());
      const formattedOrderDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')} ${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}`;

      const shippingIsBilling = (
        shippingAddress.address === billingAddress.address &&
        shippingAddress.city === billingAddress.city &&
        shippingAddress.pincode === billingAddress.pincode
      );

      // FIXED: Calculate the correct sub_total for Shiprocket
      // sub_total = total_amount - shipping_charges (product value only, tax already included in price)
      // CORRECT CALCULATION: Extract tax before sending to Shiprocket
      // Calculate amounts accounting for rounding adjustment
      const totalAmount = parseFloat(order.total_amount || 0);
      const shippingCharges = parseFloat(order.shipping_charges || 0);
      
      // Adjust product cost to account for rounding
      // So that: adjustedProductCost + shippingCharges = totalAmount (exactly)
      const adjustedProductCost = totalAmount - shippingCharges;

      console.log('💰 Pricing breakdown for Shiprocket:', {
        total_amount_shown_to_customer: totalAmount,
        shipping_charges: shippingCharges,
        product_cost_adjusted: adjustedProductCost,
        verification: `${adjustedProductCost} + ${shippingCharges} = ${adjustedProductCost + shippingCharges}`,
        matches_customer_payment: (adjustedProductCost + shippingCharges) === totalAmount,
        payment_method: order.payment_method,
        note: 'Product cost adjusted so total matches exactly what customer paid'
      });

      // Calculate tax breakdown for individual items (for display only, already included in price)
     shiprocketOrder = {
        order_id: order.id.toString(),
        order_date: formattedOrderDate,
        pickup_location: "warehouse",
        comment: `Order ${order.id}`,
        
        billing_customer_name: billingName.firstName.substring(0, 50),
        billing_last_name: billingName.lastName.substring(0, 50),
        billing_address: (billingAddress.address || '').substring(0, 200),
        billing_address_2: "",
        billing_city: (billingAddress.city || '').substring(0, 30),
        billing_pincode: (billingAddress.pincode || '').toString(),
        billing_state: (billingAddress.state || '').substring(0, 50),
        billing_country: "India",
        billing_email: (billingAddress.email || '').substring(0, 100),
        billing_phone: (billingAddress.phone || '').toString().replace(/\D/g, '').substring(0, 15),
        
        shipping_is_billing: shippingIsBilling,
        ...(shippingIsBilling ? {} : {
          shipping_customer_name: shippingName.firstName.substring(0, 50),
          shipping_last_name: shippingName.lastName.substring(0, 50),
          shipping_address: (shippingAddress.address || '').substring(0, 200),
          shipping_address_2: "",
          shipping_city: (shippingAddress.city || '').substring(0, 30),
          shipping_pincode: (shippingAddress.pincode || '').toString(),
          shipping_state: (shippingAddress.state || '').substring(0, 50),
          shipping_country: "India",
          shipping_email: (shippingAddress.email || '').substring(0, 100),
          shipping_phone: (shippingAddress.phone || '').toString().replace(/\D/g, '').substring(0, 15),
        }),
        
        order_items: order.order_items.map((item: any) => {
          const productName = item.products?.name || `Product ${item.product_id}`;
          const productSku = item.products?.sku || `SKU${item.product_id}`;
          const itemPrice = parseFloat(item.products?.price || item.price || 0);
          const quantity = parseInt(item.quantity || 1);
          
          return {
            name: productName.substring(0, 200),
            sku: productSku.substring(0, 100),
            units: quantity.toString(),
            selling_price: itemPrice.toFixed(2),
            discount: "0",
            tax: "0",
            hsn: "640399"
          };
        }),
        payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
        shipping_charges: shippingCharges.toString(),
        giftwrap_charges: "0",
        transaction_charges: "0",
        total_discount: "0",
        // FIXED: Use calculated subTotal (total_amount - shipping_charges)
        // Send tax-exclusive product value to Shiprocket
        // Send adjusted product cost so total matches customer's payment exactly
        sub_total: adjustedProductCost.toFixed(2),
        
        length: (totalQuantity > 2 ? 40 : 34).toString(),
        breadth: (totalQuantity > 2 ? 25 : 19).toString(),
        height: (totalQuantity > 2 ? 25 : Math.ceil(totalQuantity * 11.5)).toString(),
        weight: Math.max(0.5, totalQuantity * 0.9).toString()
      };
    }


    const endpoint = `${SHIPROCKET_BASE_URL}/v1/external/orders/create/adhoc`;
    console.log('📡 Calling adhoc endpoint:', endpoint);

    const orderResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'Ecommerce-App/1.0'
      },
      body: JSON.stringify(shiprocketOrder),
    });

    console.log('📡 Response status:', orderResponse.status);

    const responseText = await orderResponse.text();
    console.log('📄 Raw response:', responseText);

    if (!orderResponse.ok) {
      console.error('❌ Shiprocket API error');
      
      let errorMessage = `HTTP ${orderResponse.status}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          errorMessage = Object.entries(errorData.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
        }
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      
      throw new Error(`Shiprocket API Error: ${errorMessage}`);
    }

    let orderResult;
    try {
      orderResult = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON from Shiprocket: ${responseText}`);
    }

    console.log('✅ Adhoc order created:', orderResult);

    if (!adhocData && orderId) {
      const updateData: any = {
        shiprocket_order_id: orderResult.order_id,
        shipment_id: orderResult.shipment_id,
        status: 'processing',
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        console.warn('⚠️ Database update failed:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          order_id: orderResult.order_id,
          shipment_id: orderResult.shipment_id,
          status: 'created',
          endpoint_used: 'adhoc',
          sub_total_sent: shiprocketOrder.sub_total,
          shipping_charges_sent: shiprocketOrder.shipping_charges,
          expected_shiprocket_total: parseFloat(shiprocketOrder.sub_total) + parseFloat(shiprocketOrder.shipping_charges || '0')
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});