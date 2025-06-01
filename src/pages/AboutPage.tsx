
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Award, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen professional-page">
      {/* Header */}
      <div className="bg-trust-100 border-b border-trust-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-trust-600 hover:text-trust-900 transition-colors btn-professional"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-trust-900 mb-6">
            About Our Story
          </h1>
          <p className="text-xl text-trust-600 max-w-3xl mx-auto">
            Two distinct brands, one shared vision of creating exceptional fashion 
            that speaks to diverse lifestyles and personal expressions.
          </p>
        </div>

        {/* Brand Stories */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Bhyross */}
          <div className="professional-card rounded-lg p-8 brand-card-bhyross animate-fade-in-up animation-delay-200">
            <h2 className="text-2xl font-semibold mb-4 brand-bhyross-modern">Bhyross</h2>
            <p className="text-trust-600 mb-4">
              Born from a passion for timeless elegance, Bhyross represents the 
              perfect fusion of contemporary design and classic sophistication. 
              Our collections are crafted for those who appreciate refined aesthetics 
              and quality that endures.
            </p>
            <p className="text-trust-600">
              Every piece in our collection tells a story of meticulous attention 
              to detail, from the selection of premium materials to the final 
              finishing touches that make each garment truly special.
            </p>
          </div>

          {/* DeeCodes */}
          <div className="professional-card rounded-lg p-8 brand-card-deecodes animate-fade-in-up animation-delay-400">
            <h2 className="text-2xl font-semibold mb-4 brand-deecodes-modern">DeeCodes</h2>
            <p className="text-trust-600 mb-4">
              DeeCodes embodies the spirit of modern innovation and bold expression. 
              We create fashion for the digitally native generation that values 
              authenticity, sustainability, and cutting-edge design.
            </p>
            <p className="text-trust-600">
              Our designs decode the language of contemporary culture, translating 
              trends into wearable art that resonates with creative minds and 
              forward-thinking individuals.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-trust-900 animate-fade-in-up animation-delay-600">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center professional-card p-6 rounded-xl stagger-item stagger-1">
              <div className="w-16 h-16 bg-gradient-professional rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-trust-800">Quality First</h3>
              <p className="text-trust-600 text-sm">
                We never compromise on quality, ensuring every piece meets our 
                highest standards of craftsmanship and durability.
              </p>
            </div>
            
            <div className="text-center professional-card p-6 rounded-xl stagger-item stagger-2">
              <div className="w-16 h-16 bg-gradient-trust rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-trust-800">Customer Centric</h3>
              <p className="text-trust-600 text-sm">
                Our customers are at the heart of everything we do. We listen, 
                adapt, and continuously improve based on your feedback.
              </p>
            </div>
            
            <div className="text-center professional-card p-6 rounded-xl stagger-item stagger-3">
              <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-trust-800">Innovation</h3>
              <p className="text-trust-600 text-sm">
                We embrace new technologies and sustainable practices to create 
                fashion that's both beautiful and responsible.
              </p>
            </div>
            
            <div className="text-center professional-card p-6 rounded-xl stagger-item stagger-4">
              <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-trust-800">Global Vision</h3>
              <p className="text-trust-600 text-sm">
                We design for a global audience while celebrating local craftsmanship 
                and cultural diversity in our creations.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-trust-900 text-white rounded-lg p-8 md:p-12 text-center professional-scale-in animation-delay-800">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto text-trust-100">
            To create fashion that empowers individuals to express their unique 
            identity while building a more sustainable and inclusive industry. 
            We believe that great design should be accessible, responsible, and 
            inspiring for generations to come.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-8 mt-16 text-center">
          <div className="professional-card p-6 rounded-xl stagger-item stagger-1">
            <div className="text-3xl font-bold text-professional-600 mb-2">2019</div>
            <div className="text-trust-600">Founded</div>
          </div>
          <div className="professional-card p-6 rounded-xl stagger-item stagger-2">
            <div className="text-3xl font-bold text-warm-600 mb-2">50,000+</div>
            <div className="text-trust-600">Happy Customers</div>
          </div>
          <div className="professional-card p-6 rounded-xl stagger-item stagger-3">
            <div className="text-3xl font-bold text-success-600 mb-2">500+</div>
            <div className="text-trust-600">Unique Designs</div>
          </div>
          <div className="professional-card p-6 rounded-xl stagger-item stagger-4">
            <div className="text-3xl font-bold text-professional-700 mb-2">25+</div>
            <div className="text-trust-600">Countries Served</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
