// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Web Crypto API function to replace createHmac
async function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): Promise<boolean> {
  try {
    const message = `${orderId}|${paymentId}`;
    
    // Import the secret key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Generate the expected signature
    const expectedSignatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('🔐 Signature verification:', {
      message,
      expectedSignatureHex,
      receivedSignature: signature,
      match: expectedSignatureHex === signature
    });
    
    return expectedSignatureHex === signature;
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

serve(async (req: Request) => {
  // CRITICAL: Handle OPTIONS first, always return 200 wow
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    console.log('🚀 Payment verification function started');
    console.log('📍 Request method:', req.method);
    console.log('📍 Request URL:', req.url);
    
    // MOVED: Environment variable check AFTER OPTIONS handling
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING'
    });
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is missing');
    }
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
    }

    // Parse request body with better error handling
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('📦 Raw request body length:', bodyText.length);
      
      if (!bodyText || bodyText.trim().length === 0) {
        throw new Error('Request body is empty');
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('📦 Request body parsed successfully');
      console.log('📦 Request body keys:', Object.keys(requestBody));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      checkoutData 
    } = requestBody;

    console.log('🔍 Payment verification request details:', {
      has_razorpay_order_id: !!razorpay_order_id,
      has_razorpay_payment_id: !!razorpay_payment_id,
      has_razorpay_signature: !!razorpay_signature,
      has_checkoutData: !!checkoutData,
      paymentMethod: checkoutData?.paymentMethod
    });

    // Debug checkout data structure
    if (checkoutData) {
      console.log('🔍 CheckoutData structure:', {
        userId: checkoutData.userId,
        totalAmount: checkoutData.totalAmount,
        paymentMethod: checkoutData.paymentMethod,
        cartItemsCount: checkoutData.cartItems?.length,
        hasShippingAddress: !!checkoutData.shippingAddress,
        shippingCharges: checkoutData.shippingCharges
      });

      // Debug cart items structure
      if (checkoutData.cartItems && Array.isArray(checkoutData.cartItems)) {
        console.log('🔍 Cart items structure:');
        checkoutData.cartItems.forEach((item: any, index: number) => {
          console.log(`  Item ${index + 1}:`, {
            id: item.id,
            product_id: item.product_id,
            size: item.size,
            sizeType: typeof item.size,
            quantity: item.quantity,
            hasProducts: !!item.products,
            productName: item.products?.name,
            productPrice: item.products?.price
          });
        });
      }
    }

    // Enhanced validation with specific error messages
    if (!checkoutData) {
      console.error('❌ Missing checkoutData');
      throw new Error('Checkout data is required');
    }

    if (!checkoutData.cartItems || !Array.isArray(checkoutData.cartItems) || checkoutData.cartItems.length === 0) {
      console.error('❌ Invalid cart items:', {
        hasCartItems: !!checkoutData.cartItems,
        isArray: Array.isArray(checkoutData.cartItems),
        length: checkoutData.cartItems?.length
      });
      throw new Error('Cart items must be a non-empty array');
    }

    if (!checkoutData.shippingAddress) {
      console.error('❌ Missing shipping address');
      throw new Error('Shipping address is required');
    }

    // Validate required address fields
    const requiredFields = ['name', 'address', 'city', 'state', 'pincode', 'phone'];
    for (const field of requiredFields) {
      if (!checkoutData.shippingAddress[field]) {
        console.error(`❌ Missing shipping address field: ${field}`);
        throw new Error(`Shipping address ${field} is required`);
      }
    }

    // Initialize Supabase with better error handling
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify payment signature ONLY for prepaid orders
    if (checkoutData.paymentMethod !== 'COD') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error('Missing required Razorpay payment details for prepaid order');
      }

      // @ts-ignore
      const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
      if (!razorpaySecret) {
        throw new Error('Razorpay secret key is not configured');
      }

      // Use Web Crypto API for signature verification
      const isValidSignature = await verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpaySecret
      );

      if (!isValidSignature) {
        console.error('❌ Signature verification failed');
        throw new Error('Payment signature verification failed');
      }

      console.log('✅ Payment signature verified successfully');
    } else {
      console.log('✅ COD order - skipping signature verification');
    }

    // 2. Enhanced cart items validation
    console.log('🔍 Validating cart items structure...');
    for (let i = 0; i < checkoutData.cartItems.length; i++) {
      const item = checkoutData.cartItems[i];
      
      try {
        console.log(`📦 Cart item ${i + 1} validation:`, {
          id: item.id,
          product_id: item.product_id,
          hasProducts: !!item.products,
          productName: item.products?.name,
          productPrice: item.products?.price,
          quantity: item.quantity,
          size: item.size,
          sizeType: typeof item.size
        });

        // Validate required item fields with fallbacks
        const productId = item.product_id || item.id;
        if (!productId) {
          throw new Error(`Cart item ${i + 1}: Missing product identifier (id or product_id)`);
        }

        // Handle products data more flexibly
        const products = item.products || {};
        const productName = products.name || `Product ${productId}`;
        const productPrice = products.price || item.price || 0;

        if (productPrice <= 0) {
          console.warn(`⚠️ Cart item ${i + 1}: Price is ${productPrice}, using fallback`);
        }

        const quantity = parseInt(item.quantity) || 1;
        if (quantity <= 0) {
          throw new Error(`Cart item ${i + 1}: Invalid quantity ${item.quantity}`);
        }

        console.log(`✅ Cart item ${i + 1} validation passed`);
      } catch (itemError) {
        console.error(`❌ Cart item ${i + 1} validation failed:`, itemError);
        throw new Error(`Cart item ${i + 1}: ${itemError instanceof Error ? itemError.message : 'Validation failed'}`);
      }
    }

    console.log('✅ Cart items validation passed');

    // 3. Prepare order data with safe parsing
    const safeParseNumber = (value: any, defaultValue: number = 0): number => {
      if (typeof value === 'number' && !isNaN(value)) return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return defaultValue;
    };

    const orderData = {
  user_id: checkoutData.userId || null,
  razorpay_order_id: razorpay_order_id || null,
  payment_id: razorpay_payment_id || null,
  payment_method: checkoutData.paymentMethod || 'Prepaid',
  total_amount: Math.round(safeParseNumber(checkoutData.totalAmount, 0)),
  shipping_address: checkoutData.shippingAddress,
  billing_address: checkoutData.billingAddress || checkoutData.shippingAddress,
  shipping_charges: Math.round(safeParseNumber(checkoutData.shippingCharges, 0)),
  cod_amount: checkoutData.paymentMethod === 'COD' ? 
    Math.round(safeParseNumber(checkoutData.totalAmount, 0) - safeParseNumber(checkoutData.shippingCharges, 0)) : 0,
  status: 'confirmed',
  created_at: new Date().toISOString()
};

    console.log('📝 Creating order with data:', {
      user_id: orderData.user_id,
      payment_method: orderData.payment_method,
      total_amount: orderData.total_amount,
      status: orderData.status
    });

    // 4. Create order in database
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

    // 5. Create order items with enhanced error handling
    console.log('📝 Creating order items...');
    const orderItems: Array<{
      order_id: string;
      product_id: string;
      quantity: number;
      size: number;
      price: number;
    }> = [];

    for (let i = 0; i < checkoutData.cartItems.length; i++) {
      const item = checkoutData.cartItems[i];
      
      try {
        // Enhanced size parsing with better error handling
        let itemSize: number = 7; // Default size
        
        try {
          if (typeof item.size === 'number') {
            itemSize = Math.round(item.size);
          } else if (typeof item.size === 'string') {
            const sizeStr = item.size.toString().trim();
            
            if (sizeStr.match(/^\d+(\.\d+)?$/)) {
              // Pure number string like "42" or "42.5"
              itemSize = Math.round(parseFloat(sizeStr));
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

          // Ensure size is within reasonable bounds for shoe sizes
          if (itemSize < 6 || itemSize > 12) {
            console.warn(`⚠️ Size ${itemSize} for item ${i + 1} is outside normal range, using default`);
            itemSize = 7;
          }
        } catch (sizeError) {
          console.warn(`⚠️ Size parsing failed for item ${i + 1}:`, sizeError);
          itemSize = 7;
        }

        const products = item.products || {};
        const orderItem = {
          order_id: order.id,
          product_id: item.product_id || item.id,
          quantity: Math.max(1, parseInt(item.quantity) || 1),
          size: itemSize,
          price: Math.max(0, safeParseNumber(products.price || item.price, 0))
        };

        console.log(`📦 Order item ${i + 1} formatted:`, orderItem);
        orderItems.push(orderItem);
      } catch (itemError) {
        console.error(`❌ Failed to process cart item ${i + 1}:`, itemError);
        throw new Error(`Failed to process cart item ${i + 1}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
      }
    }

    console.log('📝 Inserting order items:', orderItems.length, 'items');

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items creation error:', itemsError);
      
      // Clean up the order if items failed
      try {
        await supabase
          .from('orders')
          .update({ 
            status: 'cancelled'
          })
          .eq('id', order.id);
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup order:', cleanupError);
      }
      
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log('✅ Order items created successfully');

// 6. Handle Shiprocket order creation
console.log('🚚 About to call create-shiprocket-order with order ID:', order.id);
console.log('🚚 Order data before Shiprocket call:', {
  orderId: order.id,
  userId: order.user_id,
  totalAmount: order.total_amount,
  shippingAddress: order.shipping_address,
  itemsCount: orderItems.length,
  paymentMethod: order.payment_method
});
console.log('🚚 Calling create-shiprocket-order function...');
try {
  console.log('🚚 Creating Shiprocket order for order ID:', order.id);
  
  // Make direct HTTP call instead of using supabase.functions.invoke()
  const shiprocketUrl = `${supabaseUrl}/functions/v1/create-shiprocket-order`;
  console.log('🚚 Making direct HTTP call to:', shiprocketUrl);
  
  const shiprocketResponse = await fetch(shiprocketUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey
    },
    body: JSON.stringify({
      orderId: order.id
    })
  });

  console.log('🚚 Shiprocket HTTP response status:', shiprocketResponse.status);
  
  let shipmentData, shipmentError;
  
  if (shiprocketResponse.ok) {
    const responseText = await shiprocketResponse.text();
    console.log('🚚 Raw shiprocket response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      if (responseJson.success) {
        shipmentData = responseJson;
        shipmentError = null;
      } else {
        shipmentData = null;
        shipmentError = { message: responseJson.error || 'Shiprocket order creation failed' };
      }
    } catch (jsonError) {
      console.error('❌ Failed to parse shiprocket response as JSON:', jsonError);
      shipmentError = { message: 'Invalid response from shiprocket service' };
      shipmentData = null;
    }
  } else {
    const errorText = await shiprocketResponse.text();
    console.error('❌ Shiprocket HTTP error:', shiprocketResponse.status, errorText);
    shipmentError = { message: `Shiprocket service error: ${shiprocketResponse.status}` };
    shipmentData = null;
  }
  
  console.log('🚚 Final shiprocket result:', { shipmentData, shipmentError });

  if (shipmentError) {
    console.error('❌ Shiprocket order creation failed:', shipmentError);
    
    // For prepaid orders, initiate refund if shipping fails
    if (checkoutData.paymentMethod !== 'COD') {
      console.log('💰 Initiating refund for failed shipment...');
      
      try {
        const refundResult = await initiateRefund(razorpay_payment_id, checkoutData.totalAmount);
        
        // Update order status to cancelled
        await supabase
          .from('orders')
          .update({ 
            status: 'cancelled',
            notes: 'Cancelled due to shipping failure'
          })
          .eq('id', order.id);

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Shipping unavailable for your location. Refund has been initiated.',
            orderId: order.id,
            refund_id: refundResult.refund_id,
            refund_status: refundResult.status
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      } catch (refundError) {
        console.error('❌ Refund initiation failed:', refundError);
        // Continue with normal error flow
      }
    } else {
      // For COD orders, just mark as cancelled
      await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          notes: 'Cancelled due to shipping unavailability'
        })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Shipping unavailable for your location.',
          orderId: order.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }
  }

  // Update order with shipment details if successful
  if (shipmentData?.data?.shipment_id) {
    const updateData: {
  shiprocket_order_id: any;
  shipment_id: any;
  status: string;  // <- Use existing status field
  awb_code?: string;
  tracking_status?: string;
} = {
  shiprocket_order_id: shipmentData.data.order_id,
  shipment_id: shipmentData.data.shipment_id,
  status: 'processing'  // <- Use existing enum value
};

    if (shipmentData.data.awb_code) {
      updateData.awb_code = shipmentData.data.awb_code;
      updateData.tracking_status = 'order_created';
    }

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
    paymentId: razorpay_payment_id,
    orderNumber: `${checkoutData.paymentMethod}${order.id.toString().padStart(6, '0')}`,
    shipmentData: shipmentData?.data || null,
    message: `${checkoutData.paymentMethod} order created successfully`
  };

  console.log('🎉 Payment verification completed successfully:', {
    orderId: successResponse.orderId,
    paymentMethod: checkoutData.paymentMethod
  });

  return new Response(
    JSON.stringify(successResponse),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  );
    } catch (shipmentError) {
      console.error('💥 Shipment creation error:', shipmentError);
      
      // Handle shipment creation failure gracefully
      if (checkoutData.paymentMethod !== 'COD') {
        try {
          const refundResult = await initiateRefund(razorpay_payment_id, checkoutData.totalAmount);
          
          await supabase
  .from('orders')
  .update({ 
    status: 'cancelled'
  })
  .eq('id', order.id);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Unable to process shipping. Refund has been initiated.',
              orderId: order.id,
              refund_id: refundResult.refund_id
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            },
          );
        } catch (refundError) {
          console.error('❌ Refund failed:', refundError);
        }
      }

      // Return error but with order created (for manual handling)
      await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          shipping_status: 'failed',
          notes: `Shipping issue: ${shipmentError instanceof Error ? shipmentError.message : 'Unknown error'}`
        })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({
          success: true, // Order was created, just shipping failed
          orderId: order.id,
          paymentId: razorpay_payment_id,
          warning: 'Order created but shipping needs manual handling.',
          message: 'We will contact you to arrange delivery.',
          shippingError: shipmentError instanceof Error ? shipmentError.message : 'Shipping service error'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

  } catch (error) {
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
      timestamp: new Date().toISOString(),
      type: 'PAYMENT_VERIFICATION_ERROR',
      // Add debug info in development
      debug: {
        errorType: error instanceof Error ? error.constructor.name : 'unknown',
        hasStack: !!(error instanceof Error && error.stack)
      }
    };

    console.log('❌ Returning error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

// Refund function with better error handling
async function initiateRefund(paymentId: string, amount: number) {
  try {
    console.log('💰 Initiating refund for payment:', paymentId, 'Amount:', amount);
    
    // @ts-ignore
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    // @ts-ignore
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeyId || !razorpaySecret) {
      throw new Error('Razorpay credentials not found for refund');
    }

    const auth = btoa(`${razorpayKeyId}:${razorpaySecret}`);
    
    const refundResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        speed: 'normal',
        notes: {
          reason: 'Shipping unavailable',
          refund_type: 'automatic'
        }
      })
    });

    const refundData = await refundResponse.json();
    
    if (!refundResponse.ok) {
      console.error('❌ Refund API error:', refundData);
      throw new Error(`Refund failed: ${refundData.error?.description || 'Unknown error'}`);
    }

    console.log('✅ Refund initiated successfully:', refundData);
    return {
      refund_id: refundData.id,
      status: refundData.status,
      amount: refundData.amount / 100, // Convert back to rupees
      speed: refundData.speed
    };
  } catch (error) {
    console.error('💥 Refund error:', error);
    return { 
      refund_id: null, 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Refund failed',
      amount: 0
    };
  }
}