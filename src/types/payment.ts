// src/types/payment.ts

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
}

export interface ShiprocketOrderData {
  orderId: string;
  orderDate: string;
  shippingAddress: any;
  billingAddress: any;
  items: any[];
  paymentMethod: 'Prepaid' | 'COD';
  totalAmount: number;
}

export interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
}

export interface TrackingInfo {
  tracking_id: string;
  courier_name: string;
  current_status: string;
  activities: TrackingActivity[];
  delivered_date?: string;
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}