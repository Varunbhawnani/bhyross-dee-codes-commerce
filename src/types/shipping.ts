// src/types/shipping.ts - Enhanced with better validation and error handling

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  size: number;
  price: number;
  created_at?: string;
  products?: {
    id: string;
    name: string;
    sku?: string;
    weight?: number;
    images?: string[];
    price: number;
    brand?: string;
    category?: string;
  };
}

// ENHANCED: More comprehensive shipping rate interface
export interface ShippingRate {
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
  // ADDED: Additional fields from Shiprocket API
  min_weight?: number;
  zone?: string;
  metro?: boolean;
  city?: string;
  state?: string;
  country?: string;
  etd?: string;
  base_courier_id?: number;
  pickup_performance?: string;
  delivery_performance_rating?: number;
  cod_performance?: string;
  volumetric_weight?: number;
  // ADDED: Our calculated fields
  is_surface?: boolean;
  is_express?: boolean;
  is_hyperlocal?: boolean;
}

// ENHANCED: More robust shipping rate request
export interface ShippingRateRequest {
  pickup_postcode: string | number;
  delivery_postcode: string | number;
  weight: string | number;
  cod: boolean | number;
  declared_value?: number;
  order_id?: number;
  // ADDED: Optional hyperlocal parameters
  is_new_hyperlocal?: boolean;
  lat_from?: number;
  long_from?: number;
  lat_to?: number;
  long_to?: number;
}

// ENHANCED: COD serviceability response
export interface CodServiceabilityResponse {
  success: boolean;
  available: boolean;
  data?: {
    pincode: number;
    cod_available: boolean;
    delivery_available: boolean;
    courier_info?: {
      name: string;
      cod_charge: number;
      freight_charge: number;
      total_charge: number;
      estimated_delivery: string;
    };
    checked_at: string;
  };
  fallback?: boolean;
  error?: string;
  meta?: {
    pickup_pincode: string;
    delivery_pincode: string;
    total_couriers_checked: number;
  };
}

// ENHANCED: Shiprocket order with comprehensive validation
export interface ShiprocketOrder {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id: string;
  comment: string;
  
  // Billing details with length constraints
  billing_customer_name: string; // max 50 chars
  billing_last_name: string; // max 50 chars
  billing_address: string; // max 200 chars
  billing_city: string; // max 50 chars
  billing_pincode: number;
  billing_state: string; // max 50 chars
  billing_country: string;
  billing_email: string; // max 100 chars
  billing_phone: string; // max 15 chars
  
  // Shipping details
  shipping_is_billing: boolean;
  shipping_customer_name: string; // max 50 chars
  shipping_last_name: string; // max 50 chars
  shipping_address: string; // max 200 chars
  shipping_city: string; // max 50 chars
  shipping_pincode: number;
  shipping_state: string; // max 50 chars
  shipping_country: string;
  shipping_email: string; // max 100 chars
  shipping_phone: string; // max 15 chars
  
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

// ENHANCED: Shiprocket order item with validation
export interface ShiprocketOrderItem {
  name: string; // max 200 chars
  sku: string; // max 100 chars
  units: number; // min 1
  selling_price: number; // min 1
  discount: number;
  tax: number;
  hsn: number;
  // ADDED: Additional optional fields
  brand?: string;
  category?: string;
  weight?: number;
}

// ENHANCED: Tracking info with comprehensive data
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
  activities: TrackingActivity[];
  qc_response?: {
    qc_image?: string;
    qc_failed_reason?: string;
  } | null;
  // ADDED: Additional tracking fields
  order_id?: string;
  shipment_id?: number;
  courier_company_id?: number;
  last_updated?: string;
  delivery_boy?: {
    name?: string;
    phone?: string;
  } | null;
}

// ENHANCED: Tracking activity with more details
export interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  sr_status?: string;
  sr_status_label?: string;
  // ADDED: Additional activity fields
  time?: string;
  activity_code?: string;
  courier_remarks?: string;
  delivery_boy?: string;
  proof_of_delivery?: string;
  exception_code?: string;
  rto_reason?: string;
}

// ENHANCED: Shiprocket API response types
export interface ShiprocketResponse {
  order_id: number;
  shipment_id: number;
  awb_code?: string;
  status: string;
  courier_company_id?: number;
  courier_name?: string;
  estimated_delivery_date?: string;
  // ADDED: Additional response fields
  pickup_token?: string;
  manifest_url?: string;
  label_url?: string;
  invoice_url?: string;
  pickup_scheduled_date?: string;
  routing_code?: string;
  assigned_date_time?: string;
  applied_weight?: number;
  pickup_token_number?: string;
  cod_amount?: number;
  // Error handling
  message?: string;
  errors?: Record<string, string[]>;
  error?: string;
  status_code?: number;
}

// ENHANCED: Return order interface
export interface ReturnOrder {
  order_id: string;
  order_date: string;
  pickup_customer_name: string;
  pickup_last_name: string;
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_country: string;
  pickup_pincode: string;
  pickup_email: string;
  pickup_phone: string;
  shipping_customer_name: string;
  shipping_last_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_pincode: string;
  shipping_email: string;
  shipping_phone: string;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  // ADDED: Return specific fields
  return_reason?: string;
  return_type?: 'CUSTOMER_RETURN' | 'QUALITY_ISSUE' | 'WRONG_ITEM' | 'DAMAGED';
  pickup_date?: string;
  return_awb?: string;
}

// ADDED: Service response wrapper for better error handling
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  error_category?: 'WALLET_INSUFFICIENT' | 'AUTHENTICATION_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'API_ERROR' | 'UNKNOWN';
  fallback?: boolean;
  retry_after?: number;
  timestamp?: string;
}

// ADDED: Bulk tracking response
export interface BulkTrackingResponse {
  [awbCode: string]: {
    tracking_data: TrackingInfo;
  };
}

// ADDED: Package dimensions calculation result
export interface PackageDimensions {
  length: number;
  breadth: number;
  height: number;
  weight: number;
  volumetric_weight?: number;
  is_oversize?: boolean;
}

// ADDED: Courier performance metrics
export interface CourierPerformance {
  courier_company_id: number;
  courier_name: string;
  delivery_performance: 'Poor' | 'Average' | 'Good' | 'Excellent';
  pickup_performance: 'Poor' | 'Average' | 'Good' | 'Excellent';
  cod_performance: 'Poor' | 'Average' | 'Good' | 'Excellent';
  rating: number; // 1-5
  reviews_count: number;
  average_delivery_time: number; // in days
  cod_remittance_days: number;
  rto_percentage: number;
  fake_attempt_percentage: number;
}

// ADDED: Pickup scheduling
export interface PickupSchedule {
  pickup_date: string;
  pickup_time: string;
  pickup_location: string;
  pickup_token?: string;
  expected_package_count: number;
  ready_time?: string;
  closing_time?: string;
  special_instructions?: string;
}

// ADDED: Manifest generation
export interface ManifestRequest {
  shipment_ids: number[];
  pickup_date?: string;
  pickup_time?: string;
}

export interface ManifestResponse {
  manifest_url: string;
  manifest_id: string;
  pickup_token: string;
  pickup_scheduled_date: string;
  total_shipments: number;
}

// ADDED: AWB assignment response
export interface AwbAssignmentResponse {
  awb_assign_status: number;
  response?: {
    data?: {
      awb_code: string;
      courier_company_id: number;
      courier_name: string;
      assigned_date_time: string;
      pickup_scheduled_date?: string;
      expected_delivery_date?: string;
      routing_code?: string;
    };
  };
  message?: string;
  error?: string;
}

// ADDED: Validation schemas
export interface ValidationSchema {
  pincode: {
    pattern: RegExp;
    message: string;
  };
  phone: {
    pattern: RegExp;
    message: string;
  };
  email: {
    pattern: RegExp;
    message: string;
  };
  weight: {
    min: number;
    max: number;
    message: string;
  };
  dimensions: {
    min: number;
    max: number;
    message: string;
  };
}

// ADDED: Default validation patterns
export const SHIPPING_VALIDATION: ValidationSchema = {
  pincode: {
    pattern: /^\d{6}$/,
    message: 'Pincode must be exactly 6 digits'
  },
  phone: {
    pattern: /^[6-9]\d{9}$/,
    message: 'Phone number must be 10 digits starting with 6-9'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  weight: {
    min: 0.1,
    max: 50,
    message: 'Weight must be between 0.1kg and 50kg'
  },
  dimensions: {
    min: 1,
    max: 200,
    message: 'Dimensions must be between 1cm and 200cm'
  }
};

// ADDED: Error codes from Shiprocket API
export enum ShiprocketErrorCodes {
  INSUFFICIENT_WALLET = 'insufficient_wallet_balance',
  INVALID_PICKUP_LOCATION = 'invalid_pickup_location',
  AUTHENTICATION_FAILED = 'authentication_failed',
  INVALID_PINCODE = 'invalid_pincode',
  WEIGHT_EXCEEDED = 'weight_exceeded',
  DIMENSIONS_EXCEEDED = 'dimensions_exceeded',
  INVALID_PHONE = 'invalid_phone_number',
  INVALID_EMAIL = 'invalid_email',
  COURIER_NOT_SERVICEABLE = 'courier_not_serviceable',
  ORDER_NOT_FOUND = 'order_not_found',
  SHIPMENT_NOT_FOUND = 'shipment_not_found'
}

// ADDED: Status mappings
export const ORDER_STATUS_MAPPING = {
  'NEW': 'Order Created',
  'AWB': 'Label Generated', 
  'PICKUP': 'Pickup Scheduled',
  'INTRANSIT': 'In Transit',
  'OFD': 'Out for Delivery',
  'DEL': 'Delivered',
  'RTO-OFD': 'RTO Out for Delivery',
  'RTO-DEL': 'RTO Delivered',
  'LOST': 'Lost',
  'DAMAGED': 'Damaged'
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_MAPPING;