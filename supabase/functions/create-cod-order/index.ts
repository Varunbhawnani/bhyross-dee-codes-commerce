// File: supabase/functions/create-cod-order/index.ts
// FIXED: Correctly calculates amount to send to Shiprocket
// Logic: adjustedProductCost = totalAmount - shippingCharges
// So that: adjustedProductCost + shippingCharges = totalAmount (exactly)
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to safely parse numbers
const safeParseNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Helper function to safely parse integers
const safeParseInt = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 COD Order Function Started');
    console.log('📍 Method:', req.method);
    console.log('📍 URL:', req.url);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📦 Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { checkoutData } = requestBody;
    console.log('🔍 Checkout data received:', {
      hasCheckoutData: !!checkoutData,
      userId: checkoutData?.userId,
      cartItemsCount: checkoutData?.cartItems?.length,
      totalAmount: checkoutData?.totalAmount,
      paymentMethod: checkoutData?.paymentMethod,
      shippingCharges: checkoutData?.shippingCharges
    });

    // Enhanced validation with detailed error messages
    if (!checkoutData) {
      throw new Error('Missing checkoutData in request');
    }

    if (!checkoutData.userId) {
      throw new Error('User ID is required for COD orders');
    }

    if (!checkoutData.cartItems || !Array.isArray(checkoutData.cartItems)) {
      throw new Error('Cart items must be a non-empty array');
    }

    if (checkoutData.cartItems.length === 0) {
      throw new Error('At least one cart item is required');
    }

    if (!checkoutData.shippingAddress) {
      throw new Error('Shipping address is required');
    }

    // Validate shipping address fields
    const requiredAddressFields = ['name', 'address', 'city', 'state', 'pincode', 'phone'];
    for (const field of requiredAddressFields) {
      if (!checkoutData.shippingAddress[field]) {
        throw new Error(`Shipping address ${field} is required`);
      }
    }

    if (!checkoutData.totalAmount || checkoutData.totalAmount <= 0) {
      throw new Error('Valid total amount is required');
    }

    console.log('✅ Initial validation passed');

    // Initialize Supabase with better error handling
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is missing');
    }
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
    }

    console.log('🔗 Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate cart items before processing
    console.log('🔍 Validating cart items...');
    for (let i = 0; i < checkoutData.cartItems.length; i++) {
      const item = checkoutData.cartItems[i];
      console.log(`📦 Validating item ${i + 1}:`, {
        hasId: !!item.id,
        hasProductId: !!item.product_id,
        hasProducts: !!item.products,
        quantity: item.quantity,
        size: item.size
      });

      if (!item.id && !item.product_id) {
        throw new Error(`Cart item ${i + 1}: Missing product identifier`);
      }

      if (!item.products) {
        throw new Error(`Cart item ${i + 1}: Missing products data`);
      }

      if (!item.products.name) {
        throw new Error(`Cart item ${i + 1}: Missing product name`);
      }

      if (!item.products.price && !item.price) {
        throw new Error(`Cart item ${i + 1}: Missing product price`);
      }

      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Cart item ${i + 1}: Invalid quantity`);
      }
    }

    console.log('✅ Cart items validation passed');

    // FIXED: Calculate amounts following checkout page logic
    // The product prices already include 5% tax
    // Total = product cost (with tax) + shipping charges
    // We need to send: adjustedProductCost = totalAmount - shippingCharges
    const totalAmount = Math.round(safeParseNumber(checkoutData.totalAmount));
    const shippingCharges = safeParseNumber(checkoutData.shippingCharges, 0);
    
    // Calculate the adjusted product cost to account for rounding
    // This ensures: adjustedProductCost + shippingCharges = totalAmount (exactly)
    const adjustedProductCost = totalAmount - shippingCharges;

    console.log('💰 Pricing breakdown:', {
      total_shown_to_customer: totalAmount,
      shipping_charges: shippingCharges,
      adjusted_product_cost: adjustedProductCost,
      verification: `${adjustedProductCost} + ${shippingCharges} = ${adjustedProductCost + shippingCharges}`,
      matches_customer_payment: (adjustedProductCost + shippingCharges) === totalAmount,
      note: 'Product cost adjusted so total matches exactly what customer paid'
    });

    // Prepare order data (using existing schema)
    const orderData = {
      user_id: checkoutData.userId,
      razorpay_order_id: null,
      payment_id: null,
      payment_method: 'COD',
      total_amount: totalAmount, // Full amount customer pays
      shipping_address: checkoutData.shippingAddress,
      billing_address: checkoutData.billingAddress || checkoutData.shippingAddress,
      shipping_charges: Math.round(shippingCharges),
      cod_amount: adjustedProductCost, // FIXED: Send adjusted product cost to Shiprocket
      status: 'confirmed' as const,
      created_at: new Date().toISOString()
    };

    console.log('📝 Creating order with data:', {
      user_id: orderData.user_id,
      total_amount: orderData.total_amount, // What customer pays
      cod_amount: orderData.cod_amount,     // What we send to Shiprocket
      payment_method: orderData.payment_method,
      status: orderData.status,
      shipping_charges: orderData.shipping_charges
    });

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      throw new Error(`Database error creating order: ${orderError.message}`);
    }

    if (!order || !order.id) {
      throw new Error('Order was created but no ID was returned');
    }

    console.log('✅ Order created successfully with ID:', order.id);

    // Prepare order items with careful type conversion
    console.log('📝 Preparing order items...');
    const orderItems = checkoutData.cartItems.map((item: any, index: number) => {
      console.log(`📦 Processing cart item ${index + 1}:`, {
        id: item.id,
        product_id: item.product_id,
        size: item.size,
        sizeType: typeof item.size,
        quantity: item.quantity,
        price: item.products?.price || item.price
      });
      
      // Handle size conversion carefully
      let itemSize: number = 7; // Default size
      
      if (typeof item.size === 'number') {
        itemSize = item.size;
      } else if (typeof item.size === 'string') {
        // Try to parse common size formats
        const sizeStr = item.size.toString().trim();
        if (sizeStr.match(/^\d+$/)) {
          // Pure number string like "42"
          itemSize = parseInt(sizeStr);
        } else if (sizeStr.match(/^(XS|S|M|L|XL|XXL)$/i)) {
          // Convert size names to numbers
          const sizeMap: Record<string, number> = {
            'XS': 6, 'S': 7, 'M': 8, 'L': 9, 'XL': 10, 'XXL': 11
          };
          itemSize = sizeMap[sizeStr.toUpperCase()] || 8;
        } else {
          // Try to extract number from string
          const numMatch = sizeStr.match(/\d+/);
          itemSize = numMatch ? parseInt(numMatch[0]) : 7;
        }
      }

      // Ensure size is within reasonable bounds
      if (itemSize < 6 || itemSize > 12) {
        console.warn(`⚠️ Size ${itemSize} for item ${index + 1} is outside normal range, using default`);
        itemSize = 8;
      }

      const orderItem = {
        order_id: order.id,
        product_id: item.product_id || item.id,
        quantity: Math.max(1, safeParseInt(item.quantity, 1)),
        size: itemSize,
        price: Math.max(0, safeParseNumber(item.products?.price || item.price, 0))
      };

      console.log(`✅ Order item ${index + 1} formatted:`, orderItem);
      return orderItem;
    });

    console.log('📝 Inserting order items:', orderItems.length, 'items');

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items creation error:', itemsError);
      
      // Try to clean up the order if items failed
      try {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.id);
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup order after items error:', cleanupError);
      }
      
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log('✅ Order items created successfully');

    // Handle shipping - with better error handling
    try {
      console.log('🚚 Creating Shiprocket order...');
      console.log('💰 Sending adjusted product cost to Shiprocket:', adjustedProductCost);
      
      // CRITICAL: The create-shiprocket-order function will calculate:
      // sub_total = total_amount - shipping_charges
      // This is exactly our adjustedProductCost!
      const { data: shipmentData, error: shipmentError } = await supabase.functions.invoke(
        'create-shiprocket-order',
        { 
          body: { 
            orderId: order.id,
            useAdhoc: true
          }
        }
      );

      if (shipmentError) {
        console.error('❌ Shiprocket order creation failed:', shipmentError);
        throw new Error(`Shipping service error: ${shipmentError.message}`);
      }

      console.log('✅ Shiprocket order created successfully');

      // Update order with shipment details
      if (shipmentData?.data?.shipment_id) {
        const updateData = {
          shiprocket_order_id: shipmentData.data.order_id,
          shipment_id: shipmentData.data.shipment_id,
          tracking_status: 'processing'
        };

        const { error: updateError } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', order.id);

        if (updateError) {
          console.warn('⚠️ Failed to update order with shipment details:', updateError);
        } else {
          console.log('✅ Order updated with shipment details');
        }
      }

      // Success response
      const successResponse = {
        success: true,
        orderId: order.id,
        orderNumber: `COD${order.id.toString().padStart(6, '0')}`,
        message: 'COD order created successfully',
        shipmentData: shipmentData?.data || null,
        pricing: {
          productCost: adjustedProductCost,
          shippingCharges: shippingCharges,
          totalPaid: totalAmount,
          sentToShiprocket: adjustedProductCost,
          verification: `${adjustedProductCost} + ${shippingCharges} = ${totalAmount}`
        }
      };

      console.log('🎉 COD order completed successfully:', {
        orderId: successResponse.orderId,
        orderNumber: successResponse.orderNumber,
        customerPays: totalAmount,
        sentToShiprocket: adjustedProductCost
      });

      return new Response(
        JSON.stringify(successResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (shipmentError) {
      console.error('💥 Shipment creation failed:', shipmentError);
      
      // Mark order as having shipping issues but don't fail completely
      try {
        await supabase
          .from('orders')
          .update({
            tracking_status: 'failed'
          })
          .eq('id', order.id);
      } catch (updateError) {
        console.error('⚠️ Failed to update order with shipping error:', updateError);
      }

      // Return success but indicate shipping issue
      return new Response(
        JSON.stringify({
          success: true,
          orderId: order.id,
          orderNumber: `COD${order.id.toString().padStart(6, '0')}`,
          message: 'Order created but shipping needs manual handling',
          warning: 'Shipping service temporarily unavailable. We will contact you to arrange delivery.',
          shippingError: shipmentError instanceof Error ? shipmentError.message : 'Unknown shipping error',
          pricing: {
            productCost: adjustedProductCost,
            shippingCharges: shippingCharges,
            totalPaid: totalAmount,
            sentToShiprocket: adjustedProductCost
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error('💥 COD order creation failed:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      type: 'COD_ORDER_ERROR'
    };

    console.log('❌ Returning error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});