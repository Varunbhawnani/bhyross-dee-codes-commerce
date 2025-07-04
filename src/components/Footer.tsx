import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Truck, RotateCcw, Heart, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from '@/contexts/SettingsContext';
import BulkInquiryModal from './BulkInquiryModal';

interface FooterProps {
  brand: 'bhyross' | 'deecodes' | 'imcolus';
}

const Footer: React.FC<FooterProps> = ({ brand }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [isCareGuideOpen, setIsCareGuideOpen] = useState(false);
  const [isBulkInquiryOpen, setIsBulkInquiryOpen] = useState(false);

  const { settings } = useSettings();

  const brandName = brand === 'bhyross' ? 'Bhyross' : brand === 'deecodes' ? 'DeeCodes' : 'Imcolus';
  
  // Get social links from settings for the current brand
  const currentSocials = settings.socialMedia[brand];

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ContactModal = () => (
    <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Us
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-600" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-sm text-gray-600">{settings.contactPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-600" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-600">{settings.contactEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-600" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {settings.address}
              </p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-sm text-gray-600">
              <strong>Business Hours:</strong><br />
              Monday - Friday: 9:00 AM - 6:00 PM<br />
              Saturday: 10:00 AM - 4:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ShippingModal = () => (
    <Dialog open={isShippingOpen} onOpenChange={setIsShippingOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Information
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Delivery Options</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Standard Delivery:</strong> 5-7 business days - Free on orders over ₹2,000</p>
              <p><strong>Express Delivery:</strong> 2-3 business days - ₹150</p>
              <p><strong>Same Day Delivery:</strong> Available in Mumbai, Delhi, Bangalore - ₹300</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">International Shipping</h4>
            <p className="text-sm text-gray-600">
              We ship worldwide. International delivery takes 7-14 business days. 
              Customs duties and taxes may apply and are the responsibility of the recipient.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Order Processing</h4>
            <p className="text-sm text-gray-600">
              Orders are processed within 1-2 business days. You'll receive a tracking number once your order ships.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ReturnsModal = () => (
    <Dialog open={isReturnsOpen} onOpenChange={setIsReturnsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Returns & Exchanges
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Return Policy</h4>
            <p className="text-sm text-gray-600">
              We offer hassle-free returns within 30 days of purchase. Items must be in original condition with tags attached.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">How to Return</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Contact our support team</li>
              <li>Receive a return authorization</li>
              <li>Package your items securely</li>
              <li>Drop off at any courier location</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">Refund Process</h4>
            <p className="text-sm text-gray-600">
              Refunds are processed within 5-7 business days after we receive your return. 
              Original payment method will be credited.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Exchange Policy</h4>
            <p className="text-sm text-gray-600">
              Free exchanges for different sizes or colors within 30 days. 
              Subject to availability.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const CareGuideModal = () => (
    <Dialog open={isCareGuideOpen} onOpenChange={setIsCareGuideOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Care Guide
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Washing Instructions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Machine wash cold with like colors</li>
              <li>• Use mild detergent, avoid bleach</li>
              <li>• Turn garments inside out before washing</li>
              <li>• Separate delicate items for gentle cycle</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Drying</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Air dry when possible</li>
              <li>• Use low heat for tumble drying</li>
              <li>• Avoid direct sunlight for colored items</li>
              <li>• Reshape while damp</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Storage Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Hang or fold properly to avoid wrinkles</li>
              <li>• Store in cool, dry place</li>
              <li>• Use cedar blocks to prevent moths</li>
              <li>• Avoid overcrowding in closets</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Special Care</h4>
            <p className="text-sm text-gray-600">
              For leather, silk, and delicate fabrics, we recommend professional dry cleaning. 
              Check individual product labels for specific care instructions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section - Full width on mobile, single column on desktop */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">{brandName}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Premium formal footwear crafted for the modern professional. Step into your best with our three distinctive collections.
              </p>
            </div>

            {/* Collections Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Collections</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/imcolus" 
                    onClick={handleLinkClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Imcolus Classics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/deecodes" 
                    onClick={handleLinkClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Dee Codes Modern
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/bhyross" 
                    onClick={handleLinkClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Bhyross Signature
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setIsContactOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsShippingOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                  >
                    Shipping Info
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsReturnsOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                  >
                    Returns & Exchanges
                  </button>
                </li>
                <li>
                  <Link 
                    to="/size-guide" 
                    onClick={handleLinkClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Size Guide
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => setIsBulkInquiryOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-left flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    For Bulk Purchases
                  </button>
                </li>
              </ul>
            </div>

            {/* Company/Social Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 mb-6">
                <li>
                   <Link to="/privacy" onClick={handleLinkClick} className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
                  
                </li>
                <li>
                  <Link 
                    to="/terms" 
                    onClick={handleLinkClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
              <div className="flex space-x-3">
                {currentSocials.instagram && (
                  <a 
                    href={currentSocials.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </a>
                )}
                {currentSocials.facebook && (
                  <a 
                    href={currentSocials.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                  </a>
                )}
                {currentSocials.twitter && (
                  <a 
                    href={currentSocials.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Twitter className="w-4 h-4 text-gray-700" />
                  </a>
                )}
                {currentSocials.linkedin && (
                  <a 
                    href={currentSocials.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Linkedin className="w-4 h-4 text-blue-700" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>
              &copy; 2024 {brandName}. All rights reserved. Crafted with precision and care.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactModal />
      <ShippingModal />
      <ReturnsModal />
      <CareGuideModal />
      <BulkInquiryModal 
        isOpen={isBulkInquiryOpen} 
        onClose={() => setIsBulkInquiryOpen(false)} 
      />
    </>
  );
};

export default Footer;