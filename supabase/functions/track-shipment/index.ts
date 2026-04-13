// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  // IMPORTANT: Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 // Make sure to return 200 status
    });
  }

  try {
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Only accept POST requests for the actual function
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed. Use POST.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        }
      );
    }

    // Parse request body with better error handling
    let requestBody;
    try {
      const textBody = await req.text();
      console.log('Raw request body:', textBody);
      
      if (!textBody || textBody.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      requestBody = JSON.parse(textBody);
      console.log('Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { awbCode, shipmentId, orderId, channelId } = requestBody;

    // Validate input - at least one identifier is required
    if (!awbCode && !shipmentId && !orderId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AWB code, shipment ID, or order ID is required',
          received_params: { awbCode, shipmentId, orderId, channelId }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get Shiprocket credentials
    // @ts-ignore
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
    // @ts-ignore
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');

    console.log('Shiprocket email configured:', !!shiprocketEmail);
    console.log('Shiprocket password configured:', !!shiprocketPassword);

    if (!shiprocketEmail || !shiprocketPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Shiprocket credentials not configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Authenticating with Shiprocket...');

    // 1. Authenticate with Shiprocket
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
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

    console.log('Auth response status:', authResponse.status);

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Shiprocket authentication failed:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Shiprocket authentication failed: ${authResponse.status}`,
          details: authError
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const authData = await authResponse.json();
    const token = authData.token;

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No authentication token received from Shiprocket',
          auth_response: authData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('Authentication successful, tracking shipment...');

    let trackResponse;
    let trackingUrl;

    // 2. Track shipment using the appropriate endpoint based on available data
    if (awbCode) {
      // Use AWB tracking endpoint (most common)
      trackingUrl = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awbCode)}`;
      console.log('Tracking by AWB:', awbCode);
    } else if (shipmentId) {
      // Use shipment ID tracking endpoint
      trackingUrl = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`;
      console.log('Tracking by Shipment ID:', shipmentId);
    } else if (orderId) {
      // Use order ID tracking endpoint
      const queryParams = new URLSearchParams({ order_id: orderId });
      if (channelId) {
        queryParams.append('channel_id', channelId.toString());
      }
      trackingUrl = `https://apiv2.shiprocket.in/v1/external/courier/track?${queryParams.toString()}`;
      console.log('Tracking by Order ID:', orderId, 'Channel ID:', channelId);
    }

    if (!trackingUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unable to construct tracking URL'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Making tracking request to:', trackingUrl);

    trackResponse = await fetch(trackingUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    console.log('Tracking response status:', trackResponse.status);

    if (!trackResponse.ok) {
      const errorText = await trackResponse.text();
      console.error('Tracking request failed:', errorText);
      
      // Handle specific Shiprocket error cases
      let errorMessage = 'Failed to track shipment';
      if (trackResponse.status === 404) {
        errorMessage = 'Shipment not found. Please check the tracking details.';
      } else if (trackResponse.status === 401) {
        errorMessage = 'Authentication failed. Please try again.';
      } else if (trackResponse.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `${errorMessage} (Status: ${trackResponse.status})`,
          shiprocket_error: errorText,
          tracking_url: trackingUrl,
          request_params: { awbCode, shipmentId, orderId, channelId }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const trackingData = await trackResponse.json();
    console.log('Received tracking data:', JSON.stringify(trackingData, null, 2));

    // 3. Transform tracking data based on API response structure
    let transformedData;

    // Check if we have valid tracking data
    if (!trackingData || !trackingData.tracking_data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No tracking data available for this shipment',
          raw_response: trackingData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    const trackData = trackingData.tracking_data;
    
    // Handle different response structures from Shiprocket API
    let shipmentTrack;
    let trackActivities = [];

    if (trackData.shipment_track && Array.isArray(trackData.shipment_track)) {
      shipmentTrack = trackData.shipment_track[0] || {};
    } else {
      shipmentTrack = trackData;
    }

    if (trackData.shipment_track_activities && Array.isArray(trackData.shipment_track_activities)) {
      trackActivities = trackData.shipment_track_activities;
    } else if (trackData.activities && Array.isArray(trackData.activities)) {
      trackActivities = trackData.activities;
    }

    transformedData = {
      awb_code: shipmentTrack.awb_code || awbCode || '',
      courier_name: shipmentTrack.courier_name || 'Unknown',
      current_status: shipmentTrack.current_status || 'No updates available',
      estimated_delivery_date: trackData.etd || shipmentTrack.edd || shipmentTrack.estimated_delivery_date || null,
      delivered_date: shipmentTrack.delivered_date || null,
      pickup_date: shipmentTrack.pickup_date || null,
      weight: shipmentTrack.weight || null,
      packages: shipmentTrack.packages || null,
      destination: shipmentTrack.destination || null,
      origin: shipmentTrack.origin || null,
      consignee_name: shipmentTrack.consignee_name || null,
      track_url: trackData.track_url || null,
      shipment_status: trackData.shipment_status || null,
      track_status: trackData.track_status || null,
      activities: trackActivities.map((activity: Record<string, any>) => ({
        date: activity.date || activity.activity_date || '',
        status: activity.status || activity.tracking_status || '',
        activity: activity.activity || activity.description || '',
        location: activity.location || '',
        sr_status: activity['sr-status'] || activity.sr_status || '',
        sr_status_label: activity['sr-status-label'] || activity.sr_status_label || ''
      })).filter((activity: Record<string, any>) => activity.date && activity.activity), // Filter out invalid activities
      // Additional info from API
      qc_response: trackData.qc_response || null
    };

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        tracking_data: transformedData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Shipment tracking error:', error);
    
    // Ensure we always return a proper CORS response even on error
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});