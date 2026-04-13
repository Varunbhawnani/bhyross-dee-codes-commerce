// supabase/functions/get-shipping-rates/index.ts - NO FALLBACK VERSION
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface ServiceabilityRequest {
  pickup_postcode: number;
  delivery_postcode: number;
  order_id?: number;
  cod?: boolean;
  weight?: number;
  is_new_hyperlocal?: boolean;
  lat_from?: number;
  long_from?: number;
  lat_to?: number;
  long_to?: number;
}

// Define the shape of a transformed shipping rate
interface ShippingRate {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charge: number;
  total_charge: number;
  estimated_delivery_days: string;
  pickup_availability: string;
  cod_availability: boolean;
  delivery_performance: string;
  serviceable: boolean;
  min_weight?: number;
  zone?: string;
  metro?: boolean;
  city?: string;
  state?: string;
  country?: string;
}

// Define the courier company structure from Shiprocket API
interface CourierCompany {
  courier_company_id: number;
  courier_name?: string;
  name?: string;
  rate?: number;
  freight_charge?: number;
  cod_charges?: number;
  cod_charge?: number;
  estimated_delivery_days?: string;
  etd?: string;
  pickup_availability?: string;
  cod?: number | boolean | string;
  cod_availability?: boolean;
  delivery_performance?: string;
  min_weight?: number;
  zone?: string;
  metro?: boolean;
  city?: string;
  state?: string;
  country?: string;
}
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  let body: any;
  try {
    body = await req.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));
  } catch (jsonError) {
    console.error('Invalid JSON in request:', jsonError);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body',
        data: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  try {
    // Handle both pincode and postcode naming conventions
    const pickup_postcode = body.pickup_pincode || body.pickup_postcode;
    const delivery_postcode = body.delivery_pincode || body.delivery_postcode;
    const { weight, cod, declared_value, order_id, is_new_hyperlocal, lat_from, long_from, lat_to, long_to } = body;

    // Use warehouse pincode as default if pickup_postcode not provided
    // @ts-ignore
    const finalPickupPostcode = pickup_postcode || Deno.env.get('WAREHOUSE_PINCODE') || '282007';
    
    // Validate required parameters
    if (!finalPickupPostcode || !delivery_postcode) {
      throw new Error('Pickup postcode and delivery postcode are required');
    }

    // Either order_id OR (cod + weight) is required
    if (!order_id && (!weight || cod === undefined)) {
      throw new Error('Either order_id or (weight + cod) parameters are required');
    }

    // @ts-ignore
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
    // @ts-ignore
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');

    if (!shiprocketEmail || !shiprocketPassword) {
      throw new Error('Shiprocket credentials not configured');
    }

    // 1. Authenticate with Shiprocket
    console.log('Authenticating with Shiprocket...');
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Authentication failed with status:', authResponse.status, 'Response:', authError);
      return getErrorResponse(parseInt(finalPickupPostcode), parseInt(delivery_postcode), weight, cod, `Auth failed: ${authResponse.status}`);
    }

    console.log('Authentication successful');
    const authData = await authResponse.json();
    const token = authData.token;

    if (!token) {
      console.error('No token received from authentication');
      return getErrorResponse(parseInt(finalPickupPostcode), parseInt(delivery_postcode), weight, cod, 'No authentication token received');
    }

    // 2. Build serviceability request parameters
    const serviceabilityParams: Record<string, string> = {
      pickup_postcode: finalPickupPostcode.toString(),
      delivery_postcode: delivery_postcode.toString(),
    };

    // Add order_id if provided
    if (order_id) {
      serviceabilityParams.order_id = order_id.toString();
    } else {
      // Add weight and cod if order_id not provided
      serviceabilityParams.weight = weight.toString();
      serviceabilityParams.cod = cod ? '1' : '0';
    }

    // Add optional hyperlocal parameters if provided
    if (is_new_hyperlocal !== undefined) {
      serviceabilityParams.is_new_hyperlocal = is_new_hyperlocal ? '1' : '0';
    }
    if (lat_from !== undefined) serviceabilityParams.lat_from = lat_from.toString();
    if (long_from !== undefined) serviceabilityParams.long_from = long_from.toString();
    if (lat_to !== undefined) serviceabilityParams.lat_to = lat_to.toString();
    if (long_to !== undefined) serviceabilityParams.long_to = long_to.toString();

    console.log('Serviceability request params:', serviceabilityParams);

    // 3. Call Shiprocket serviceability API
    const serviceabilityUrl = new URL('https://apiv2.shiprocket.in/v1/external/courier/serviceability/');
    Object.entries(serviceabilityParams).forEach(([key, value]) => {
      serviceabilityUrl.searchParams.append(key, value);
    });

    console.log('Calling Shiprocket API:', serviceabilityUrl.toString());

    const serviceabilityResponse = await fetch(serviceabilityUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!serviceabilityResponse.ok) {
      const errorText = await serviceabilityResponse.text();
      console.error('Serviceability API failed with status:', serviceabilityResponse.status, 'Response:', errorText);
      return getErrorResponse(parseInt(finalPickupPostcode), parseInt(delivery_postcode), weight, cod, `API failed: ${serviceabilityResponse.status}`);
    }

    const responseText = await serviceabilityResponse.text();
    console.log('Raw API Response:', responseText);

    let serviceabilityData: any;
    try {
      serviceabilityData = JSON.parse(responseText);
      console.log('Parsed Shiprocket API Response:', JSON.stringify(serviceabilityData, null, 2));
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError, 'Raw response:', responseText);
      return getErrorResponse(parseInt(finalPickupPostcode), parseInt(delivery_postcode), weight, cod, 'Invalid API response format');
    }

    // 4. Transform and validate response
    let transformedRates: ShippingRate[] = [];
    
    if (serviceabilityData.data?.available_courier_companies) {
      console.log('Found courier companies:', serviceabilityData.data.available_courier_companies.length);
      transformedRates = serviceabilityData.data.available_courier_companies.map((courier: CourierCompany): ShippingRate => ({
        courier_company_id: courier.courier_company_id,
        courier_name: courier.courier_name || courier.name || 'Unknown Courier',
        freight_charge: parseFloat((courier.rate || courier.freight_charge || 0).toString()),
        cod_charge: parseFloat((courier.cod_charges || courier.cod_charge || 0).toString()),
        total_charge: parseFloat((courier.rate || courier.freight_charge || 0).toString()) + 
                     parseFloat((courier.cod_charges || courier.cod_charge || 0).toString()),
        estimated_delivery_days: courier.estimated_delivery_days || 
                               courier.etd || '5-7 business days',
        pickup_availability: courier.pickup_availability || 'Available',
        cod_availability: courier.cod === 1 || courier.cod === true || 
                         courier.cod === "1" || courier.cod_availability === true,
        delivery_performance: courier.delivery_performance || 'Standard',
        serviceable: true,
        // Additional details from API
        min_weight: courier.min_weight,
        zone: courier.zone,
        metro: courier.metro,
        city: courier.city,
        state: courier.state,
        country: courier.country
      }));
    } else {
      console.log('No available_courier_companies in response data:', serviceabilityData.data);
    }

    // 5. Handle empty results - no fallback
    if (transformedRates.length === 0) {
      console.log('No courier rates found');
      return new Response(
        JSON.stringify({
          success: false,
          data: [],
          error: "No shipping options available for this pincode",
          request_params: {
            pickup_postcode: finalPickupPostcode,
            delivery_postcode,
            weight,
            cod: cod ? true : false,
            order_id
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    // 6. Sort by total charge (lowest first)
    transformedRates.sort((a: ShippingRate, b: ShippingRate) => a.total_charge - b.total_charge);

    console.log('Successfully processed', transformedRates.length, 'shipping rates');

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedRates,
        request_params: {
          pickup_postcode: finalPickupPostcode,
          delivery_postcode,
          weight,
          cod: cod ? true : false,
          order_id
        },
        meta: {
          total_couriers: transformedRates.length,
          cheapest_rate: transformedRates[0]?.total_charge,
          most_expensive_rate: transformedRates[transformedRates.length - 1]?.total_charge
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error: any) {
    console.error('Shipping serviceability error:', error);
    // @ts-ignore
    let pickup_postcode = (Deno as any).env.get('WAREHOUSE_PINCODE') || '282007';
    let delivery_postcode = '110001'; // Default Delhi pincode
    let weight = 1;
    let cod = false;
    
    // Safely extract parameters if body was parsed successfully
    try {
      if (body) {
        pickup_postcode = body?.pickup_pincode || body?.pickup_postcode || pickup_postcode;
        delivery_postcode = body?.delivery_pincode || body?.delivery_postcode || delivery_postcode;
        weight = body?.weight || weight;
        cod = body?.cod || cod;
      }
    } catch (bodyParseError) {
      console.error('Could not extract parameters from body in error handler:', bodyParseError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        data: [],
        error: error.message || "Shipping service unavailable",
        request_params: {
          pickup_postcode: parseInt(pickup_postcode.toString()),
          delivery_postcode: parseInt(delivery_postcode.toString()),
          weight,
          cod
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  }
});

// Helper function to generate error response (no fallback rates)
function getErrorResponse(pickup_postcode: number, delivery_postcode: number, weight: number, cod: boolean, errorMessage?: string) {
  console.log('No shipping available for:', { pickup_postcode, delivery_postcode, weight, cod, errorMessage });
  
  return new Response(
    JSON.stringify({
      success: false,
      data: [],
      error: errorMessage || "Shipping not available for this pincode",
      request_params: {
        pickup_postcode,
        delivery_postcode,
        weight,
        cod
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  );
}