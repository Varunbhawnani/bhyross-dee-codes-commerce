// supabase/functions/check-cod-serviceability/index.ts
// Enhanced version with proper validation and error handling
 // @ts-ignore
// supabase/functions/check-cod-serviceability/index.ts
// Enhanced version with proper validation and error handling

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// FIXED: Standardized Shiprocket endpoints
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in';
const SHIPROCKET_ENDPOINTS = {
  AUTH: '/v1/external/auth/login',
  COD_SERVICEABILITY: '/v1/external/courier/serviceability/' // Fixed endpoint
};

// Define proper types
interface CourierInfo {
  name: string;
  cod_charge: number;
  freight_charge: number;
  total_charge: number;
  estimated_delivery: string | number;
}

interface CourierCompany {
  courier_name?: string;
  name?: string;
  cod?: number | boolean | string;
  cod_availability?: boolean;
  rate?: string | number;
  freight_charge?: string | number;
  cod_charges?: string | number;
  cod_charge?: string | number;
  estimated_delivery_days?: string | number;
  etd?: string | number;
}

interface ServiceabilityResponse {
  data?: {
    available_courier_companies?: CourierCompany[];
    cod_available?: boolean;
    delivery_available?: boolean;
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders, 
      status: 200 
    });
  }

  try {
    console.log('🔍 COD Serviceability Check Started');
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed');
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      throw new Error('Invalid JSON in request body');
    }

    const { pincode } = requestBody;
    console.log('📍 Checking COD for pincode:', pincode);

    // ENHANCED: Input validation
    if (!pincode) {
      throw new Error('Pincode is required');
    }

    const pincodeStr = pincode.toString().trim();
    if (!/^\d{6}$/.test(pincodeStr)) {
      throw new Error('Invalid pincode format. Must be exactly 6 digits.');
    }

    const pincodeNum = parseInt(pincodeStr);

    // Get credentials
     // @ts-ignore
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
     // @ts-ignore
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');
     // @ts-ignore
    const warehousePincode = Deno.env.get('WAREHOUSE_PINCODE') || '282007';

    if (!shiprocketEmail || !shiprocketPassword) {
      console.warn('⚠️ Shiprocket credentials not configured, using fallback');
      return getFallbackResponse(true, 'Credentials not configured');
    }

    console.log('🔐 Authenticating with Shiprocket...');

    // FIXED: Use standardized auth endpoint
    const authResponse = await fetch(`${SHIPROCKET_BASE_URL}${SHIPROCKET_ENDPOINTS.AUTH}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('❌ Authentication failed:', authResponse.status, authError);
      return getFallbackResponse(true, `Authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const token = authData.token;

    if (!token) {
      console.error('❌ No token received');
      return getFallbackResponse(true, 'No authentication token received');
    }

    console.log('✅ Authentication successful');

    // ENHANCED: Check COD serviceability with proper parameters
    const serviceabilityParams = new URLSearchParams({
      pickup_postcode: warehousePincode.toString(),
      delivery_postcode: pincodeStr,
      weight: '1', // Default 1kg for COD check
      cod: '1' // Check COD availability
    });

    const serviceabilityUrl = `${SHIPROCKET_BASE_URL}${SHIPROCKET_ENDPOINTS.COD_SERVICEABILITY}?${serviceabilityParams.toString()}`;
    
    console.log('🔍 Checking serviceability:', serviceabilityUrl);

    const codResponse = await fetch(serviceabilityUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📊 COD response status:', codResponse.status);

    if (!codResponse.ok) {
      const errorText = await codResponse.text();
      console.error('❌ COD check API failed:', codResponse.status, errorText);
      return getFallbackResponse(true, `API failed: ${codResponse.status}`);
    }

    const codData: ServiceabilityResponse = await codResponse.json();
    console.log('📋 COD response data:', JSON.stringify(codData, null, 2));

    // ENHANCED: Parse COD availability from response
    let codAvailable = false;
    let deliveryAvailable = false;
    let courierInfo: CourierInfo | null = null; // FIXED: Proper type annotation

    if (codData.data && codData.data.available_courier_companies) {
      const couriers = codData.data.available_courier_companies;
      
      // Check if any courier supports COD
      const codCouriers = couriers.filter((courier: CourierCompany) => 
        courier.cod === 1 || 
        courier.cod === true || 
        courier.cod === "1" ||
        courier.cod_availability === true
      );

      codAvailable = codCouriers.length > 0;
      deliveryAvailable = couriers.length > 0;
      
      if (codCouriers.length > 0) {
        // Get the cheapest COD courier
        const cheapestCodCourier = codCouriers.reduce((min: CourierCompany, courier: CourierCompany) => {
          const currentRate = parseFloat(courier.rate?.toString() || courier.freight_charge?.toString() || '0') + 
                            parseFloat(courier.cod_charges?.toString() || courier.cod_charge?.toString() || '0');
          const minRate = parseFloat(min.rate?.toString() || min.freight_charge?.toString() || '0') + 
                         parseFloat(min.cod_charges?.toString() || min.cod_charge?.toString() || '0');
          return currentRate < minRate ? courier : min;
        });

        courierInfo = {
          name: cheapestCodCourier.courier_name || cheapestCodCourier.name || 'Unknown Courier',
          cod_charge: parseFloat(cheapestCodCourier.cod_charges?.toString() || cheapestCodCourier.cod_charge?.toString() || '0'),
          freight_charge: parseFloat(cheapestCodCourier.rate?.toString() || cheapestCodCourier.freight_charge?.toString() || '0'),
          total_charge: parseFloat(cheapestCodCourier.rate?.toString() || cheapestCodCourier.freight_charge?.toString() || '0') + 
                       parseFloat(cheapestCodCourier.cod_charges?.toString() || cheapestCodCourier.cod_charge?.toString() || '0'),
          estimated_delivery: cheapestCodCourier.estimated_delivery_days || cheapestCodCourier.etd || 'Unknown'
        };
      }
    } else if (codData.data && typeof codData.data.cod_available !== 'undefined') {
      // Alternative response structure
      codAvailable = Boolean(codData.data.cod_available);
      deliveryAvailable = Boolean(codData.data.delivery_available);
    }

    console.log(`✅ COD check completed - Available: ${codAvailable}, Delivery: ${deliveryAvailable}`);

    return new Response(
      JSON.stringify({
        success: true,
        available: codAvailable,
        data: {
          pincode: pincodeNum,
          cod_available: codAvailable,
          delivery_available: deliveryAvailable,
          courier_info: courierInfo,
          checked_at: new Date().toISOString()
        },
        meta: {
          pickup_pincode: warehousePincode,
          delivery_pincode: pincodeStr,
          total_couriers_checked: codData.data?.available_courier_companies?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 COD serviceability check error:', error);
    
    // ENHANCED: Categorize errors and provide appropriate fallbacks
    let fallbackAvailable = true; // Conservative default
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // For validation errors, be more restrictive
    if (errorMessage.includes('Invalid pincode') || errorMessage.includes('required')) {
      fallbackAvailable = false;
    }
    
    return getFallbackResponse(fallbackAvailable, errorMessage);
  }
});

// ENHANCED: Fallback response with better logic
function getFallbackResponse(available: boolean, reason?: string) {
  console.log(`🔄 Providing COD fallback response - Available: ${available}, Reason: ${reason}`);
  
  return new Response(
    JSON.stringify({
      success: true, // Always return success to not block checkout
      available: available,
      fallback: true,
      data: {
        cod_available: available,
        delivery_available: true, // Assume delivery is available
        fallback_reason: reason || 'Service temporarily unavailable',
        checked_at: new Date().toISOString()
      },
      message: available 
        ? "COD availability check using fallback - assuming available"
        : "COD availability check failed - assuming not available"
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}