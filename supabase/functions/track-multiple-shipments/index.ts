// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { awbs } = await req.json();

    // Validate input
    if (!Array.isArray(awbs) || awbs.length === 0) {
      throw new Error('AWB codes array is required and cannot be empty');
    }

    if (awbs.length > 50) {
      throw new Error('Maximum 50 AWB codes are supported at a time');
    }

    // Validate that all AWBs are strings
    const validAwbs = awbs.filter(awb => typeof awb === 'string' && awb.trim().length > 0);
    if (validAwbs.length === 0) {
      throw new Error('No valid AWB codes provided');
    }

    // Get Shiprocket credentials
    // @ts-ignore
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
    // @ts-ignore
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');

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
      const authError = await authResponse.json();
      throw new Error(`Shiprocket authentication failed: ${JSON.stringify(authError)}`);
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // 2. Track multiple shipments using bulk tracking endpoint
    const trackResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/track/awbs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        awbs: validAwbs
      })
    });

    if (!trackResponse.ok) {
      const errorData = await trackResponse.json().catch(() => ({}));
      throw new Error(`Failed to track shipments: ${trackResponse.status} ${JSON.stringify(errorData)}`);
    }

    const bulkTrackingData = await trackResponse.json();

    // 3. Transform bulk tracking data
    const transformedResults: Record<string, any> = {};

    for (const [awbCode, trackingResponse] of Object.entries(bulkTrackingData)) {
      try {
        const trackData = (trackingResponse as any).tracking_data;
        
        if (!trackData) {
          transformedResults[awbCode] = {
            tracking_data: {
              error: 'No tracking data available',
              awb_code: awbCode
            }
          };
          continue;
        }

        const shipmentTrack = trackData.shipment_track?.[0] || {};
        const trackActivities = trackData.shipment_track_activities || [];

        transformedResults[awbCode] = {
          tracking_data: {
            awb_code: shipmentTrack.awb_code || awbCode,
            courier_name: shipmentTrack.courier_name || 'Unknown',
            current_status: shipmentTrack.current_status || 'No updates',
            estimated_delivery_date: trackData.etd || shipmentTrack.edd || null,
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
            activities: trackActivities.map((activity: any) => ({
              date: activity.date,
              status: activity.status,
              activity: activity.activity,
              location: activity.location,
              sr_status: activity['sr-status'],
              sr_status_label: activity['sr-status-label']
            })),
            qc_response: trackData.qc_response || null
          }
        };
      } catch (error) {
        // Handle individual AWB processing errors
        transformedResults[awbCode] = {
          tracking_data: {
            error: `Failed to process tracking data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            awb_code: awbCode
          }
        };
      }
    }

    return new Response(
      JSON.stringify(transformedResults),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Bulk shipment tracking error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});