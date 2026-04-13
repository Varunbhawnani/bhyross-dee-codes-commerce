import { supabase } from '@/integrations/supabase/client';
import { ShippingRate, ShippingRateRequest, ReturnOrder } from '@/types/shipping';

export interface TrackingInfo {
  awb_code: string;
  courier_name: string;
  current_status: string;
  estimated_delivery_date?: string | null;
  delivered_date?: string | null;
  pickup_date?: string | null;
  weight?: string | null;
  packages?: number | null;
  destination?: string | null;
  origin?: string | null;
  consignee_name?: string | null;
  track_url?: string | null;
  shipment_status?: number | null;
  track_status?: number | null;
  activities: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
    sr_status?: string;
    sr_status_label?: string;
  }>;
  qc_response?: {
    qc_image?: string;
    qc_failed_reason?: string;
  } | null;
}

export interface BulkTrackingResponse {
  [awbCode: string]: {
    tracking_data: TrackingInfo;
  };
}

// ENHANCED: Service response interface
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  error_category?: 'WALLET_INSUFFICIENT' | 'AUTHENTICATION_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'API_ERROR' | 'UNKNOWN';
  fallback?: boolean;
  retry_after?: number;
}

class ShiprocketService {
  private readonly maxRetries = 3;
  private readonly baseRetryDelay = 1000; // 1 second

  // ENHANCED: Better error categorization and retry logic
  private async invokeFunction(
    functionName: string, 
    payload: any, 
    retryCount = 0
  ): Promise<ServiceResponse> {
    try {
      console.log(`[${functionName}] Attempt ${retryCount + 1} with payload:`, payload);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      // Handle Supabase client errors
      if (error) {
        console.error(`[${functionName}] Supabase error:`, error);
        
        // Determine if this is retryable
        const isRetryable = error.message?.includes('network') || 
                           error.message?.includes('timeout') ||
                           error.message?.includes('502') ||
                           error.message?.includes('503');
        
        if (isRetryable && retryCount < this.maxRetries) {
          const delay = this.baseRetryDelay * Math.pow(2, retryCount);
          console.log(`⏳ Retrying ${functionName} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.invokeFunction(functionName, payload, retryCount + 1);
        }
        
        return { 
          success: false, 
          error: error.message || 'Service error',
          error_category: isRetryable ? 'NETWORK_ERROR' : 'API_ERROR'
        };
      }

      // Handle empty response
      if (!data) {
        return { 
          success: false, 
          error: 'No response received from service.',
          error_category: 'API_ERROR'
        };
      }

      // Handle service-level errors with categorization
      if (typeof data === 'object' && data.success === false) {
        let errorCategory: ServiceResponse['error_category'] = 'UNKNOWN';
        const errorMessage = data.error || 'Service request failed.';
        
        // Categorize errors
        if (errorMessage.includes('WALLET') || errorMessage.includes('insufficient')) {
          errorCategory = 'WALLET_INSUFFICIENT';
        } else if (errorMessage.includes('Authentication') || errorMessage.includes('401')) {
          errorCategory = 'AUTHENTICATION_ERROR';
        } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
          errorCategory = 'VALIDATION_ERROR';
        }
        
        return { 
          success: false, 
          error: errorMessage,
          error_category: errorCategory
        };
      }

      return { success: true, data };
    } catch (e) {
      console.error(`[${functionName}] Exception:`, e);
      
      // Retry on network exceptions
      if (retryCount < this.maxRetries && e instanceof Error && 
          (e.message.includes('fetch') || e.message.includes('network'))) {
        const delay = this.baseRetryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.invokeFunction(functionName, payload, retryCount + 1);
      }
      
      return { 
        success: false, 
        error: e instanceof Error ? e.message : 'Unexpected client error',
        error_category: 'NETWORK_ERROR'
      };
    }
  }

  // ENHANCED: Connection test with better diagnostics
  async testConnection(): Promise<ServiceResponse> {
    try {
      console.log('🔍 Testing Shiprocket service connection...');
      
      const result = await this.invokeFunction('track-shipment', {
        awbCode: 'TEST123' // This should trigger a graceful "not found" response
      });
      
      // Even an error response indicates the service is reachable
      if (result.error && !result.error.includes('Failed to send') && !result.error.includes('CORS')) {
        return { 
          success: true, 
          data: { status: 'reachable', message: 'Service is responding' }
        };
      }
      
      return result.success ? result : { 
        success: false, 
        error: result.error,
        error_category: 'NETWORK_ERROR'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
        error_category: 'NETWORK_ERROR'
      };
    }
  }

  // ENHANCED: COD serviceability with better validation
  async checkCodServiceability(pincode: string): Promise<ServiceResponse<{ available: boolean }>> {
    console.log('🔍 Checking COD serviceability for pincode:', pincode);
    
    // ADDED: Input validation
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return {
        success: false,
        error: 'Invalid pincode format. Must be 6 digits.',
        error_category: 'VALIDATION_ERROR'
      };
    }
    
    try {
      const result = await this.invokeFunction('check-cod-serviceability', { 
        pincode: parseInt(pincode.trim()) 
      });
      
      if (result.success && result.data) {
        return { 
          success: true, 
          data: { available: result.data.available || false }
        };
      }
      
      // ENHANCED: Graceful fallback with warning
      console.warn('COD check failed, using fallback:', result.error);
      return { 
        success: true, 
        data: { available: true }, // Conservative fallback
        fallback: true,
        error: result.error 
      };
    } catch (error) {
      return { 
        success: true, // Don't block checkout
        data: { available: true },
        fallback: true,
        error: error instanceof Error ? error.message : 'COD check failed',
        error_category: 'NETWORK_ERROR'
      };
    }
  }

  // ENHANCED: Order creation with better error handling
  // Create Shiprocket order using adhoc endpoint only
async createOrder(orderId: string): Promise<ServiceResponse> {
  console.log('Creating Shiprocket order for:', orderId);
  
  if (!orderId?.trim()) {
    return {
      success: false,
      error: 'Valid order ID is required',
      error_category: 'VALIDATION_ERROR'
    };
  }

  const result = await this.invokeFunction('create-shiprocket-order', { 
    orderId: orderId.trim(),
    useAdhoc: true 
  });
  
  if (result.error_category === 'WALLET_INSUFFICIENT') {
    return {
      ...result,
      error: `${result.error} Please add funds to your Shiprocket wallet to enable shipping.`,
      retry_after: 300
    };
  }
  
  return result;
}

  // NEW: Create Shiprocket order using adhoc endpoint
async createShiprocketOrder(orderId: string, useAdhoc: boolean = false): Promise<ServiceResponse> {
  console.log('📦 Creating Shiprocket order for:', orderId, 'using adhoc:', useAdhoc);
  
  if (!orderId?.trim()) {
    return {
      success: false,
      error: 'Valid order ID is required',
      error_category: 'VALIDATION_ERROR'
    };
  }

  const result = await this.invokeFunction('create-shiprocket-order', { 
    orderId: orderId.trim(),
    useAdhoc: useAdhoc 
  });
  
  // Handle specific wallet insufficient error
  if (result.error_category === 'WALLET_INSUFFICIENT') {
    return {
      ...result,
      error: `${result.error} Please add funds to your Shiprocket wallet to enable shipping.`,
      retry_after: 300
    };
  }
  
  return result;
}

  // ENHANCED: Shipping rates with comprehensive validation
  async getShippingRates(
    pickupPincode: string, 
    deliveryPincode: string, 
    weight: number, 
    cod: boolean = false,
    declaredValue?: number
  ): Promise<ServiceResponse<ShippingRate[]>> {
    console.log('💰 Getting shipping rates with params:', {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight,
      cod,
      declared_value: declaredValue
    });

    // ADDED: Comprehensive input validation
    const validationErrors: string[] = [];
    
    if (!pickupPincode || !/^\d{6}$/.test(pickupPincode.trim())) {
      validationErrors.push('Invalid pickup pincode format');
    }
    
    if (!deliveryPincode || !/^\d{6}$/.test(deliveryPincode.trim())) {
      validationErrors.push('Invalid delivery pincode format');
    }
    
    if (!weight || weight <= 0 || weight > 50) {
      validationErrors.push('Weight must be between 0.1kg and 50kg');
    }
    
    if (declaredValue && (declaredValue <= 0 || declaredValue > 1000000)) {
      validationErrors.push('Declared value must be between ₹1 and ₹10,00,000');
    }
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join('; '),
        error_category: 'VALIDATION_ERROR'
      };
    }

    const requestPayload = {
      pickup_postcode: parseInt(pickupPincode.trim()),
      delivery_postcode: parseInt(deliveryPincode.trim()),
      weight: weight.toString(),
      cod: cod ? 1 : 0,
      declared_value: declaredValue ? parseInt(declaredValue.toString()) : undefined
    };

    console.log('📤 Shipping rates request payload:', requestPayload);

    const result = await this.invokeFunction('get-shipping-rates', requestPayload);

    if (result.success && result.data) {
      const rates = Array.isArray(result.data) ? result.data : result.data.data;
      
      // ADDED: Validate and sort rates
      const validRates = (rates || [])
        .filter((rate: any) => rate.total_charge && rate.total_charge > 0)
        .sort((a: any, b: any) => a.total_charge - b.total_charge);
      
      if (validRates.length > 0) {
        return { 
          success: true, 
          data: validRates
        };
      }
    }

    // No fallback - just return failure
    return {
      success: false,
      error: 'Shipping not available for this pincode',
      error_category: 'API_ERROR'
    };
  }

  // ENHANCED: Smart tracking with better error handling
  async smartTrackShipment(params: {
    awbCode?: string;
    shipmentId?: number;
    orderId?: string;
    channelId?: number;
  }): Promise<ServiceResponse<TrackingInfo>> {
    const { awbCode, shipmentId, orderId, channelId } = params;

    console.log('🔍 Smart tracking with params:', params);

    // Validate input
    if (!awbCode && !shipmentId && !orderId) {
      return {
        success: false,
        error: 'At least one identifier (AWB code, shipment ID, or order ID) is required',
        error_category: 'VALIDATION_ERROR'
      };
    }

    // Test connection first
    const connectionTest = await this.testConnection();
    if (!connectionTest.success) {
      return {
        success: false,
        error: `Tracking service unavailable: ${connectionTest.error}`,
        error_category: 'NETWORK_ERROR'
      };
    }

    // Try different tracking methods in priority order
    const trackingMethods = [
      { method: 'AWB', param: awbCode, fn: () => this.trackShipment(awbCode!) },
      { method: 'Shipment ID', param: shipmentId, fn: () => this.trackShipmentById(shipmentId!) },
      { method: 'Order ID', param: orderId, fn: () => this.trackShipmentByOrderId(orderId!, channelId) }
    ].filter(method => method.param);

    for (const method of trackingMethods) {
      try {
        console.log(`📍 Trying ${method.method} tracking:`, method.param);
        const result = await method.fn();
        
        if (result.success && result.data) {
          console.log(`✅ Successfully tracked via ${method.method}`);
          return result;
        }
        
        console.warn(`⚠️ ${method.method} tracking failed:`, result.error);
      } catch (error) {
        console.warn(`⚠️ ${method.method} tracking exception:`, error);
      }
    }

    return {
      success: false,
      error: 'All tracking methods failed. Shipment may not be created yet or tracking data is not available.',
      error_category: 'API_ERROR'
    };
  }

  // ENHANCED: Individual tracking methods
  async trackShipment(awbCode: string): Promise<ServiceResponse<TrackingInfo>> {
    if (!awbCode?.trim()) {
      return {
        success: false,
        error: 'Valid AWB code is required',
        error_category: 'VALIDATION_ERROR'
      };
    }

    console.log('📦 Tracking shipment with AWB:', awbCode.trim());
    
    const result = await this.invokeFunction('track-shipment', { awbCode: awbCode.trim() });
    
    if (result.success && result.data) {
      return { 
        success: true, 
        data: result.data.tracking_data || result.data 
      };
    }
    
    return {
      success: false,
      error: result.error || 'Failed to track shipment',
      error_category: result.error_category || 'API_ERROR'
    };
  }

  async trackShipmentById(shipmentId: number): Promise<ServiceResponse<TrackingInfo>> {
    if (!shipmentId || shipmentId <= 0) {
      return {
        success: false,
        error: 'Valid shipment ID is required',
        error_category: 'VALIDATION_ERROR'
      };
    }

    console.log('🆔 Tracking shipment with ID:', shipmentId);
    
    const result = await this.invokeFunction('track-shipment', { shipmentId });
    
    if (result.success && result.data) {
      return { 
        success: true, 
        data: result.data.tracking_data || result.data 
      };
    }
    
    return {
      success: false,
      error: result.error || 'Failed to track shipment',
      error_category: result.error_category || 'API_ERROR'
    };
  }

  async trackShipmentByOrderId(
    orderId: string, 
    channelId?: number
  ): Promise<ServiceResponse<TrackingInfo>> {
    if (!orderId?.trim()) {
      return {
        success: false,
        error: 'Valid order ID is required',
        error_category: 'VALIDATION_ERROR'
      };
    }

    console.log('📋 Tracking shipment with Order ID:', orderId, 'Channel ID:', channelId);
    
    const payload = channelId ? { orderId: orderId.trim(), channelId } : { orderId: orderId.trim() };
    const result = await this.invokeFunction('track-shipment', payload);
    
    if (result.success && result.data) {
      return { 
        success: true, 
        data: result.data.tracking_data || result.data 
      };
    }
    
    return {
      success: false,
      error: result.error || 'Failed to track shipment',
      error_category: result.error_category || 'API_ERROR'
    };
  }

  // ENHANCED: Database operations with better error handling
  async updateTrackingInDatabase(
    orderId: string, 
    trackingInfo: TrackingInfo
  ): Promise<ServiceResponse> {
    try {
      if (!orderId?.trim()) {
        return {
          success: false,
          error: 'Valid order ID is required',
          error_category: 'VALIDATION_ERROR'
        };
      }

      console.log('💾 Updating tracking in database for order:', orderId);
      
      const updateData: any = {
        tracking_status: trackingInfo.current_status,
        courier_name: trackingInfo.courier_name,
        updated_at: new Date().toISOString()
      };

      // Add optional fields if available
      if (trackingInfo.estimated_delivery_date) {
        updateData.estimated_delivery_date = trackingInfo.estimated_delivery_date;
      }
      if (trackingInfo.delivered_date) {
        updateData.actual_delivery_date = trackingInfo.delivered_date;
      }

      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId.trim());

      if (orderUpdateError) {
        throw orderUpdateError;
      }

      // ENHANCED: Better activity management
      if (trackingInfo.activities && trackingInfo.activities.length > 0) {
        await this.syncTrackingActivities(orderId.trim(), trackingInfo);
      }

      return { success: true };
    } catch (error) {
      console.error('Database tracking update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tracking in database',
        error_category: 'API_ERROR'
      };
    }
  }

  // ADDED: Separate method for activity syncing
  private async syncTrackingActivities(orderId: string, trackingInfo: TrackingInfo): Promise<void> {
    try {
      console.log('📝 Syncing tracking activities, count:', trackingInfo.activities.length);
      
      // Get existing activities efficiently
      const { data: existingActivities, error: fetchError } = await supabase
        .from('shipping_tracking')
        .select('activity_date, activity, location')
        .eq('order_id', orderId)
        .order('activity_date', { ascending: false });

      if (fetchError) {
        console.warn('Could not fetch existing activities:', fetchError);
      }

      // Create a more robust duplicate check
      const existingSet = new Set(
        (existingActivities || []).map(activity => 
          `${activity.activity_date}-${activity.activity}-${activity.location}`
        )
      );

      // Filter and validate new activities
      const newActivities = trackingInfo.activities
        .filter(activity => {
          if (!activity.date || !activity.activity) return false;
          
          const activityKey = `${activity.date}-${activity.activity}-${activity.location || ''}`;
          return !existingSet.has(activityKey);
        })
        .map(activity => ({
          order_id: orderId,
          awb_code: trackingInfo.awb_code,
          activity_date: activity.date,
          activity: activity.activity.substring(0, 500), // Prevent overflow
          location: (activity.location || '').substring(0, 200),
          tracking_status: (activity.status || '').substring(0, 100)
        }));

      if (newActivities.length > 0) {
        const { error: insertError } = await supabase
          .from('shipping_tracking')
          .insert(newActivities);

        if (insertError) {
          console.error('Failed to insert tracking activities:', insertError);
        } else {
          console.log(`✅ Inserted ${newActivities.length} new tracking activities`);
        }
      } else {
        console.log('📄 No new tracking activities to insert');
      }
    } catch (error) {
      console.error('Activity sync error:', error);
      // Don't throw - this is non-critical
    }
  }

  // ENHANCED: Comprehensive tracking info
  async getComprehensiveTrackingInfo(orderId: string): Promise<ServiceResponse> {
    try {
      if (!orderId?.trim()) {
        return {
          success: false,
          error: 'Valid order ID is required',
          error_category: 'VALIDATION_ERROR'
        };
      }

      // Get order details from database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_tracking (*)
        `)
        .eq('id', orderId.trim())
        .single();

      if (orderError) {
        return {
          success: false,
          error: orderError.message,
          error_category: 'API_ERROR'
        };
      }

      if (!orderData) {
        return {
          success: false,
          error: 'Order not found',
          error_category: 'VALIDATION_ERROR'
        };
      }

      // Try to get latest tracking from API
      let apiTrackingResult: ServiceResponse<TrackingInfo> | null = null;
      
      if (orderData.awb_code) {
        apiTrackingResult = await this.trackShipment(orderData.awb_code);
      } else if (orderData.shipment_id) {
        apiTrackingResult = await this.trackShipmentById(orderData.shipment_id);
      }

      // Update database if API call was successful
      if (apiTrackingResult?.success && apiTrackingResult.data) {
        await this.updateTrackingInDatabase(orderId.trim(), apiTrackingResult.data);
      }

      const comprehensiveInfo = {
        order: orderData,
        latest_tracking: apiTrackingResult?.data || null,
        tracking_history: orderData.shipping_tracking || [],
        last_updated: new Date().toISOString(),
        api_status: apiTrackingResult?.success ? 'success' : 'failed',
        api_error: apiTrackingResult?.error || null
      };

      return { success: true, data: comprehensiveInfo };
    } catch (error) {
      console.error('Comprehensive tracking info error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get comprehensive tracking info',
        error_category: 'API_ERROR'
      };
    }
  }

  // ENHANCED: Package dimensions with validation
  calculatePackageDimensions(quantity: number) {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }

    const baseDimensions = {
      length: 34,
      breadth: 19,
      height: 11.5,
      weight: 0.9
    };

    let dimensions;
    if (quantity === 1) {
      dimensions = baseDimensions;
    } else if (quantity === 2) {
      dimensions = {
        length: 34,
        breadth: 19,
        height: 23,
        weight: 1.8
      };
    } else {
      dimensions = {
        length: Math.min(50, 34 + Math.ceil(quantity / 2) * 5),
        breadth: Math.min(35, 19 + Math.ceil(quantity / 3) * 3),
        height: Math.min(40, 11.5 * Math.ceil(quantity / 2)),
        weight: 0.9 * quantity
      };
    }

    dimensions.weight += 0.2; // Packaging weight

    // Validate against carrier limits
    if (dimensions.weight > 50) {
      throw new Error('Package exceeds maximum weight limit of 50kg');
    }

    return dimensions;
  }
}

export const shiprocketService = new ShiprocketService();