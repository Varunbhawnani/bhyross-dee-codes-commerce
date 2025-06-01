import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Award, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Our Story
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Two distinct brands, one shared vision of creating exceptional fashion 
            that speaks to diverse lifestyles and personal expressions.
          </p>
        </div>

        {/* Brand Stories */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Bhyross */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Bhyross</h2>
            <p className="text-gray-600 mb-4">
              Born from a passion for timeless elegance, Bhyross represents the 
              perfect fusion of contemporary design and classic sophistication. 
              Our collections are crafted for those who appreciate refined aesthetics 
              and quality that endures.
            </p>
            <p className="text-gray-600">
              Every piece in our collection tells a story of meticulous attention 
              to detail, from the selection of premium materials to the final 
              finishing touches that make each garment truly special.
            </p>
          </div>

          {/* DeeCodes */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">DeeCodes</h2>
            <p className="text-gray-600 mb-4">
              DeeCodes embodies the spirit of modern innovation and bold expression. 
              We create fashion for the digitally native generation that values 
              authenticity, sustainability, and cutting-edge design.
            </p>
            <p className="text-gray-600">
              Our designs decode the language of contemporary culture, translating 
              trends into wearable art that resonates with creative minds and 
              forward-thinking individuals.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality First</h3>
              <p className="text-gray-600 text-sm">
                We never compromise on quality, ensuring every piece meets our 
                highest standards of craftsmanship and durability.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer Centric</h3>
              <p className="text-gray-600 text-sm">
                Our customers are at the heart of everything we do. We listen, 
                adapt, and continuously improve based on your feedback.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">
                We embrace new technologies and sustainable practices to create 
                fashion that's both beautiful and responsible.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Global Vision</h3>
              <p className="text-gray-600 text-sm">
                We design for a global audience while celebrating local craftsmanship 
                and cultural diversity in our creations.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gray-900 text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto">
            To create fashion that empowers individuals to express their unique 
            identity while building a more sustainable and inclusive industry. 
            We believe that great design should be accessible, responsible, and 
            inspiring for generations to come.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">2019</div>
            <div className="text-gray-600">Founded</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Unique Designs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
            <div className="text-gray-600">Countries Served</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;