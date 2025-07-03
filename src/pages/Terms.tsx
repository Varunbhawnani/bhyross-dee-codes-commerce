import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FileText, Scale, CreditCard, Truck, RotateCcw, Shield } from "lucide-react";

const Terms = () => {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: "By accessing and using the Imcolus website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      id: "products-services",
      title: "Products and Services",
      icon: Scale,
      content: "Imcolus offers premium formal footwear through our three collections: Imcolus Classics, Dee Codes Modern, and Bhyross Signature. All products are subject to availability. We reserve the right to limit the quantity of items purchased per person, per household, or per order."
    },
    {
      id: "pricing-payment",
      title: "Pricing and Payment",
      icon: CreditCard,
      content: "All prices are listed in USD and are subject to change without notice. Payment is due at the time of purchase. We accept major credit cards, PayPal, and other payment methods as indicated on our website. All transactions are processed securely through encrypted connections."
    },
    {
      id: "shipping-delivery",
      title: "Shipping and Delivery",
      icon: Truck,
      content: "We ship to locations worldwide. Shipping costs and delivery times vary by location and shipping method selected. Risk of loss and title for products purchased pass to you upon delivery to the carrier. Delivery dates are estimates and we are not responsible for delays caused by shipping carriers."
    },
    {
      id: "returns-exchanges",
      title: "Returns and Exchanges",
      icon: RotateCcw,
      content: "We accept returns within 30 days of delivery for unworn items in original packaging. Return shipping is free for domestic orders. Custom or personalized items are final sale. Please refer to our Returns & Exchanges page for complete details on our return policy."
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: Shield,
      content: "All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Imcolus or its content suppliers and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission."
    }
  ];

  const additionalTerms = [
    {
      title: "User Conduct",
      content: "You agree to use our website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the website. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within our website."
    },
    {
      title: "Privacy Policy",
      content: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our services. By using our website, you consent to the collection and use of information in accordance with our Privacy Policy."
    },
    {
      title: "Limitation of Liability",
      content: "Imcolus shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or services. Our total liability to you for any claim arising from your use of our website or products shall not exceed the amount you paid for the specific product or service."
    },
    {
      title: "Force Majeure",
      content: "Imcolus shall not be liable for any failure to perform due to unforeseen circumstances or to causes beyond our reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-muted/30 py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Please read these terms and conditions carefully before using our services. 
              Your use of our website constitutes acceptance of these terms.
            </p>
            <div className="mt-6 md:mt-8 text-xs sm:text-sm text-muted-foreground">
              <p>Last updated: December 8, 2024</p>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-muted/30 p-4 md:p-6 lg:p-8 rounded-lg mb-8 md:mb-12 lg:mb-16">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <Scale className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold">Agreement Overview</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  These Terms of Service ("Terms") govern your use of the Imcolus website, mobile applications, 
                  and related services (collectively, the "Service") operated by Imcolus ("us", "we", or "our"). 
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with 
                  any part of these terms, then you may not access the Service.
                </p>
              </div>

              {/* Table of Contents */}
              <div className="bg-background border rounded-lg p-4 md:p-6 mb-8 md:mb-12 lg:mb-16">
                <h3 className="font-montserrat font-bold text-base md:text-lg mb-3 md:mb-4">Table of Contents</h3>
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sections.map((section, index) => (
                    <a
                      key={index}
                      href={`#${section.id}`}
                      className="block text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm"
                    >
                      {index + 1}. {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Main Terms Sections */}
              <div className="space-y-8 md:space-y-12 lg:space-y-16">
                {sections.map((section, index) => (
                  <section key={index} id={section.id} className="scroll-mt-24">
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                      <section.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                      <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold">{section.title}</h2>
                    </div>
                    <div className="bg-muted/30 p-4 md:p-6 rounded-lg">
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{section.content}</p>
                    </div>
                  </section>
                ))}
              </div>

              {/* Additional Terms */}
              <div className="mt-12 md:mt-16 lg:mt-20 space-y-6 md:space-y-8 lg:space-y-12">
                <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 lg:mb-16">Additional Terms and Conditions</h2>
                {additionalTerms.map((term, index) => (
                  <div key={index} className="bg-background border rounded-lg p-4 md:p-6 lg:p-8">
                    <h3 className="font-montserrat font-bold text-lg md:text-xl mb-3 md:mb-4">{term.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{term.content}</p>
                  </div>
                ))}
              </div>

              {/* Account Terms */}
              <section className="mt-8 md:mt-12 lg:mt-16 bg-muted/30 p-4 md:p-6 lg:p-8 rounded-lg">
                <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Account Registration and Security</h2>
                <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
                  <p>
                    <strong>Account Creation:</strong> To access certain features of our Service, you may be required to create an account. 
                    You must provide accurate, complete, and current information during the registration process.
                  </p>
                  <p>
                    <strong>Account Security:</strong> You are responsible for safeguarding the password and all activities that occur under your account. 
                    You agree to immediately notify us of any unauthorized use of your account.
                  </p>
                  <p>
                    <strong>Account Termination:</strong> We reserve the right to terminate or suspend your account at any time, 
                    with or without cause and with or without notice, for conduct that we believe violates these Terms.
                  </p>
                </div>
              </section>

              {/* Warranty Disclaimer */}
              <section className="mt-8 md:mt-12 lg:mt-16 bg-background border rounded-lg p-4 md:p-6 lg:p-8">
                <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Warranties and Disclaimers</h2>
                <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
                  <p>
                    <strong>Product Quality:</strong> We warrant that our products will be free from defects in materials and workmanship 
                    under normal use for a period of one year from the date of purchase.
                  </p>
                  <p>
                    <strong>Website Availability:</strong> While we strive to ensure our website is available 24/7, we do not guarantee 
                    uninterrupted access. The website may be temporarily unavailable due to maintenance, updates, or technical issues.
                  </p>
                  <p>
                    <strong>Disclaimer:</strong> Except as expressly stated herein, our products and services are provided "as is" 
                    without warranties of any kind, either express or implied, including but not limited to implied warranties of 
                    merchantability, fitness for a particular purpose, or non-infringement.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section className="mt-8 md:mt-12 lg:mt-16 bg-muted/30 p-4 md:p-6 lg:p-8 rounded-lg">
                <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Governing Law and Disputes</h2>
                <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
                  <p>
                    <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the State of New York, 
                    without regard to its conflict of law provisions.
                  </p>
                  <p>
                    <strong>Dispute Resolution:</strong> Any disputes arising from these Terms or your use of our services shall be resolved 
                    through binding arbitration in accordance with the rules of the American Arbitration Association.
                  </p>
                  <p>
                    <strong>Jurisdiction:</strong> You and Imcolus agree that any judicial proceeding brought by either party will be 
                    brought exclusively in the federal or state courts of New York County, New York.
                  </p>
                </div>
              </section>

              {/* Contact and Updates */}
              <section className="mt-8 md:mt-12 lg:mt-16 bg-primary text-primary-foreground p-4 md:p-6 lg:p-8 rounded-lg">
                <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Changes to Terms and Contact Information</h2>
                <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                  <p>
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                    we will try to provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                  <p>
                    <strong>Contact Us:</strong> If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-1 md:space-y-2 text-xs sm:text-sm opacity-90">
                    <p><strong>Email:</strong> legal@imcolus.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>Mail:</strong> Imcolus Legal Department, 123 Premium Plaza, Fashion District, New York, NY 10001</p>
                  </div>
                </div>
              </section>

              {/* Severability */}
              <section className="mt-8 md:mt-12 lg:mt-16 bg-background border rounded-lg p-4 md:p-6 lg:p-8">
                <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Severability and Entire Agreement</h2>
                <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
                  <p>
                    <strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable by a court, 
                    the remaining provisions will remain in effect. The invalid or unenforceable provision will be deemed modified 
                    to the extent necessary to make it valid and enforceable.
                  </p>
                  <p>
                    <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Imcolus regarding 
                    the use of our Service and supersede all prior and contemporaneous agreements, representations, and understandings.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer brand='bhyross' />
    </div>
  );
};

export default Terms;