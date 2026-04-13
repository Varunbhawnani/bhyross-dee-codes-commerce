import React, { useState } from 'react';
import { Building2, User, Mail, Phone, Package, MessageCircle, CheckCircle, ArrowLeft, Sparkles, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface BulkInquiryFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  estimatedQuantity: string;
  message: string;
}

const BulkInquiryPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BulkInquiryFormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    estimatedQuantity: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!formData.contactName.trim()) {
      setError('Contact name is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('bulk_inquiries')
        .insert([
          {
            company_name: formData.companyName,
            contact_name: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            estimated_quantity: formData.estimatedQuantity,
            message: formData.message,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      
      // Reset form after success
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        estimatedQuantity: '',
        message: ''
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Error submitting bulk inquiry:', err);
      setError('Failed to submit inquiry. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewInquiry = () => {
    setIsSuccess(false);
    setError(null);
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      estimatedQuantity: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
      
          <div className="container mx-auto px-4 lg:px-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6 font-montserrat font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
                <Building2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  Bulk Purchase Inquiry
                </h1>
              </div>
              <p className="font-montserrat text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Looking to place a large order? Fill out the form below and <strong className="text-foreground">we'll get back to you within 24 hours.</strong>
              </p>
            </div>
          </div>
      

        {/* Form Section */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              {/* Success State */}
              {isSuccess ? (
                <div className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8 text-center animate-fade-in">
                  <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-4">Thank You!</h2>
                  <p className="font-montserrat text-base md:text-lg text-muted-foreground mb-6">
                    Your bulk purchase inquiry has been submitted successfully.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 md:p-6 mb-8">
                    <p className="text-green-800 dark:text-green-200 font-montserrat font-medium text-base md:text-lg">
                      We will reach out to you within 24 hours with detailed information about bulk pricing and availability.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={handleStartNewInquiry}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-montserrat font-semibold"
                    >
                      Submit Another Inquiry
                    </button>
                    <div>
                      <Link 
                        to="/" 
                        className="block sm:inline text-primary hover:text-primary/80 transition-colors font-montserrat"
                      >
                        Return to Home Page
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form Section */
                <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6 lg:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200 font-montserrat text-sm sm:text-base">{error}</p>
                      </div>
                    )}

                    {/* Company Name */}
                    <div className="group">
                      <label htmlFor="companyName" className="block font-montserrat text-sm font-semibold text-foreground mb-2">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Enter your company name"
                          className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-background font-montserrat text-sm sm:text-base hover:border-primary/50"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Name */}
                    <div className="group">
                      <label htmlFor="contactName" className="block font-montserrat text-sm font-semibold text-foreground mb-2">
                        Contact Person Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          id="contactName"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          placeholder="Enter contact person name"
                          className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-background font-montserrat text-sm sm:text-base hover:border-primary/50"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    {/* Email and Phone Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="group">
                        <label htmlFor="email" className="block font-montserrat text-sm font-semibold text-foreground mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-background font-montserrat text-sm sm:text-base hover:border-primary/50"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label htmlFor="phone" className="block font-montserrat text-sm font-semibold text-foreground mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-background font-montserrat text-sm sm:text-base hover:border-primary/50"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Estimated Quantity - Now Optional */}
                    <div className="group">
                      <label htmlFor="estimatedQuantity" className="block font-montserrat text-sm font-semibold text-foreground mb-2">
                        Estimated Quantity (Optional)
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          id="estimatedQuantity"
                          name="estimatedQuantity"
                          value={formData.estimatedQuantity}
                          onChange={handleInputChange}
                          placeholder="e.g., 100 pairs, 500+ units"
                          className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-background font-montserrat text-sm sm:text-base hover:border-primary/50"
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="font-montserrat text-xs sm:text-sm text-muted-foreground mt-1">
                        Please specify the approximate number of units you're interested in purchasing
                      </p>
                    </div>

                    {/* Message */}
                    <div className="group">
                      <label htmlFor="message" className="block font-montserrat text-sm font-semibold text-foreground mb-2">
                        Additional Message (Optional)
                      </label>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us about your specific requirements, preferred sizes, timeline, budget range, or any other details that would help us provide you with the best quote..."
                          rows={6}
                          className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all bg-background font-montserrat text-sm sm:text-base hover:border-primary/50"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Link
                        to="/"
                        className="w-full sm:flex-1 px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors text-center font-montserrat font-medium text-sm sm:text-base"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-montserrat font-semibold text-sm sm:text-base shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                            Submitting Inquiry...
                          </>
                        ) : (
                          'Submit Bulk Inquiry'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer brand="imcolus" />
    </div>
  );
};

export default BulkInquiryPage;