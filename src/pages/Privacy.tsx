
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Shield, Eye, Lock, Users, FileText, Mail } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: FileText,
      content: [
        {
          subtitle: "Personal Information",
          details: "When you create an account, make a purchase, or contact us, we may collect personal information such as your name, email address, phone number, billing and shipping addresses, and payment information."
        },
        {
          subtitle: "Automatically Collected Information", 
          details: "We automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and information about your usage of our website."
        },
        {
          subtitle: "Cookies and Tracking Technologies",
          details: "We use cookies, web beacons, and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content."
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Users,
      content: [
        {
          subtitle: "Order Processing",
          details: "We use your personal information to process and fulfill your orders, communicate with you about your purchases, and provide customer support."
        },
        {
          subtitle: "Marketing Communications",
          details: "With your consent, we may send you promotional emails about new products, special offers, and other information we think you may find interesting."
        },
        {
          subtitle: "Website Improvement",
          details: "We use collected data to analyze website usage, improve our services, and enhance user experience through personalization and optimization."
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Shield,
      content: [
        {
          subtitle: "Service Providers", 
          details: "We may share your information with trusted third-party service providers who assist us in operating our website, conducting business, or serving you."
        },
        {
          subtitle: "Legal Requirements",
          details: "We may disclose your information when required by law, regulation, legal process, or governmental request, or to protect our rights and safety."
        },
        {
          subtitle: "Business Transfers",
          details: "In the event of a merger, acquisition, or sale of business assets, your information may be transferred as part of the transaction."
        }
      ]
    },
    {
      id: "data-security", 
      title: "Data Security",
      icon: Lock,
      content: [
        {
          subtitle: "Security Measures",
          details: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          subtitle: "Payment Security",
          details: "All payment transactions are processed through secure, encrypted connections. We do not store complete credit card information on our servers."
        },
        {
          subtitle: "Data Retention",
          details: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law."
        }
      ]
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      icon: Eye,
      content: [
        {
          subtitle: "Access and Correction",
          details: "You have the right to access, update, or correct your personal information. You can do this by logging into your account or contacting us directly."
        },
        {
          subtitle: "Marketing Opt-out",
          details: "You can unsubscribe from our marketing communications at any time by clicking the unsubscribe link in our emails or contacting us."
        },
        {
          subtitle: "Data Deletion",
          details: "You may request deletion of your personal information, subject to certain legal limitations and business requirements."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-muted/30 py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information.
            </p>
            <div className="mt-8 text-sm text-muted-foreground">
              <p>Last updated: December 8, 2024</p>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-muted/30 p-8 rounded-lg mb-16">
                <div className="flex items-center gap-4 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="font-playfair text-2xl font-bold">Our Commitment to Privacy</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  At Imcolus, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy describes our practices concerning the collection, use, and disclosure of information that 
                  you may provide via our website, mobile applications, or any related services. By using our services, 
                  you consent to the data practices described in this statement.
                </p>
              </div>

              {/* Table of Contents */}
              <div className="bg-background border rounded-lg p-6 mb-16">
                <h3 className="font-montserrat font-bold text-lg mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {sections.map((section, index) => (
                    <a
                      key={index}
                      href={`#${section.id}`}
                      className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {index + 1}. {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Privacy Sections */}
              <div className="space-y-16">
                {sections.map((section, index) => (
                  <section key={index} id={section.id} className="scroll-mt-24">
                    <div className="flex items-center gap-4 mb-8">
                      <section.icon className="w-8 h-8 text-primary" />
                      <h2 className="font-playfair text-3xl font-bold">{section.title}</h2>
                    </div>
                    <div className="space-y-6">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="bg-muted/30 p-6 rounded-lg">
                          <h3 className="font-montserrat font-semibold text-lg mb-3">{item.subtitle}</h3>
                          <p className="text-muted-foreground leading-relaxed">{item.details}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* Cookies Section */}
              <section className="mt-16 bg-muted/30 p-8 rounded-lg">
                <h2 className="font-playfair text-2xl font-bold mb-6">Cookie Policy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off. 
                    They are usually only set in response to actions made by you which amount to a request for services.
                  </p>
                  <p>
                    <strong>Analytics Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure 
                    and improve the performance of our site. They help us know which pages are the most popular.
                  </p>
                  <p>
                    <strong>Marketing Cookies:</strong> These cookies may be set through our site by our advertising partners. 
                    They may be used to build a profile of your interests and show you relevant ads on other sites.
                  </p>
                  <p>
                    You can control cookie settings through your browser preferences. However, if you disable cookies, 
                    some features of our website may not function properly.
                  </p>
                </div>
              </section>

              {/* International Transfers */}
              <section className="mt-16 bg-background border rounded-lg p-8">
                <h2 className="font-playfair text-2xl font-bold mb-6">International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and maintained on computers located outside of your state, province, 
                  country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. 
                  We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance 
                  with this Privacy Policy and no transfer of your personal data will take place to an organization or a country 
                  unless there are adequate controls in place including the security of your data.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mt-16 bg-muted/30 p-8 rounded-lg">
                <h2 className="font-playfair text-2xl font-bold mb-6">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not intended for children under the age of 13. We do not knowingly collect personally 
                  identifiable information from children under 13. If you are a parent or guardian and you are aware that 
                  your child has provided us with personal information, please contact us. If we become aware that we have 
                  collected personal information from children under age 13 without verification of parental consent, 
                  we take steps to remove that information from our servers.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mt-16 bg-primary text-primary-foreground p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <Mail className="w-8 h-8" />
                  <h2 className="font-playfair text-2xl font-bold">Contact Us About Privacy</h2>
                </div>
                <div className="space-y-4">
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2 text-sm opacity-90">
                    <p><strong>Email:</strong> privacy@imcolus.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>Mail:</strong> Imcolus Privacy Team, 123 Premium Plaza, Fashion District, New York, NY 10001</p>
                  </div>
                  <p className="text-sm opacity-90 mt-6">
                    We will respond to your inquiry within 30 days of receiving your request.
                  </p>
                </div>
              </section>

              {/* Updates */}
              <section className="mt-16 bg-background border rounded-lg p-8">
                <h2 className="font-playfair text-2xl font-bold mb-6">Policy Updates</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
                  legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on 
                  this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically 
                  to stay informed about our information practices.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer brand='bhyross'/>
    </div>
  );
};

export default Privacy;