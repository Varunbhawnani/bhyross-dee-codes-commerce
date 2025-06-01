import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Truck, RotateCcw, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FooterProps {
  brand: 'bhyross' | 'deecodes';
}

const Footer: React.FC<FooterProps> = ({ brand }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [isCareGuideOpen, setIsCareGuideOpen] = useState(false);

  const brandName = brand === 'bhyross' ? 'Bhyross' : 'DeeCodes';
  
  const socialLinks = {
    bhyross: {
      facebook: 'https://facebook.com/bhyross',
      instagram: 'https://instagram.com/bhyross',
      twitter: 'https://twitter.com/bhyross',
      linkedin: 'https://linkedin.com/company/bhyross'
    },
    deecodes: {
      facebook: 'https://facebook.com/deecodes',
      instagram: 'https://instagram.com/deecodes',
      twitter: 'https://twitter.com/deecodes',
      linkedin: 'https://linkedin.com/company/deecodes'
    }
  };

  const currentSocials = socialLinks[brand];

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
              <p className="text-sm text-gray-600">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-600" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-600">support@{brand}.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-600" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-sm text-gray-600">
                123 Fashion Street<br />
                Mumbai, Maharashtra 400001<br />
                India
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{brandName}</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/about" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/craftsmanship" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Craftsmanship
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/collections" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/size-guide" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Size Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
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
                    Returns
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsCareGuideOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                  >
                    Care Guide
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a 
                  href={currentSocials.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                </a>
                <a 
                  href={currentSocials.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <Instagram className="w-5 h-5 text-pink-600" />
                </a>
                <a 
                  href={currentSocials.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <Twitter className="w-5 h-5 text-gray-700" />
                </a>
                <a 
                  href={currentSocials.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>
              &copy; 2024 {brandName}. All rights reserved. | 
              <button className="ml-1 hover:text-gray-900 transition-colors">Privacy Policy</button> | 
              <button className="ml-1 hover:text-gray-900 transition-colors">Terms of Service</button>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactModal />
      <ShippingModal />
      <ReturnsModal />
      <CareGuideModal />
    </>
  );
};

export default Footer;