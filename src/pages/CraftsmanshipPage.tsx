import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scissors, Palette, CheckCircle, Clock } from 'lucide-react';

const CraftsmanshipPage: React.FC = () => {
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
            The Art of Craftsmanship
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every stitch tells a story. Every detail reflects our commitment to 
            excellence. Discover the meticulous process behind our exceptional garments.
          </p>
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Design Conception</h3>
              <p className="text-gray-600 text-sm">
                Skilled artisans hand-assemble each garment with care, 
                ensuring every seam is perfect and every detail is refined.
              </p>
            </div>
          </div>
        </div>

        {/* Materials Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Premium Materials</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Organic Cotton</h3>
              <p className="text-gray-600 mb-4">
                Sourced from certified organic farms, our cotton is grown without 
                harmful pesticides, ensuring comfort and sustainability.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GOTS certified organic cotton</li>
                <li>• Superior breathability and softness</li>
                <li>• Hypoallergenic and chemical-free</li>
                <li>• Supports sustainable farming practices</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Premium Wool</h3>
              <p className="text-gray-600 mb-4">
                Our wool collection features Merino and cashmere from ethically 
                managed farms, offering luxury and warmth.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Responsibly sourced Merino wool</li>
                <li>• Natural temperature regulation</li>
                <li>• Odor-resistant properties</li>
                <li>• Cruelty-free certification</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Sustainable Blends</h3>
              <p className="text-gray-600 mb-4">
                Innovative fabric blends that combine performance with 
                environmental responsibility for modern lifestyles.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recycled polyester blends</li>
                <li>• Moisture-wicking properties</li>
                <li>• Enhanced durability</li>
                <li>• Reduced environmental impact</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quality Standards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Quality Standards</h2>
          <div className="bg-gray-900 text-white rounded-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Testing & Inspection</h3>
                <p className="text-gray-300 mb-4">
                  Every garment undergoes rigorous quality control, from initial 
                  fabric inspection to final finishing checks.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Multi-point quality inspections</li>
                  <li>• Fabric durability testing</li>
                  <li>• Color fastness verification</li>
                  <li>• Fit and finish validation</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Artisan Standards</h3>
                <p className="text-gray-300 mb-4">
                  Our craftsmen maintain traditional techniques while embracing 
                  modern innovations for superior results.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• 15+ years average experience</li>
                  <li>• Continuous skill development</li>
                  <li>• Heritage technique preservation</li>
                  <li>• Innovation integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Commitment */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Sustainability Commitment</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Eco-Friendly Practices</h3>
              <p className="text-gray-600 mb-6">
                We're committed to reducing our environmental impact through 
                responsible manufacturing and sustainable business practices.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Zero Waste Initiative</h4>
                    <p className="text-sm text-gray-600">All fabric scraps are recycled or upcycled into new products</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Water Conservation</h4>
                    <p className="text-sm text-gray-600">Advanced dyeing techniques reduce water usage by 40%</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Carbon Neutral Shipping</h4>
                    <p className="text-sm text-gray-600">All deliveries offset through renewable energy projects</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Impact Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">95%</div>
                  <div className="text-sm text-gray-600">Sustainable Materials Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">40%</div>
                  <div className="text-sm text-gray-600">Water Usage Reduction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600">Carbon Neutral Operations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">5,000+</div>
                  <div className="text-sm text-gray-600">Trees Planted This Year</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Experience the Difference</h2>
          <p className="text-gray-600 mb-6">
            Discover how our commitment to craftsmanship translates into 
            exceptional quality you can feel and see.
          </p>
          <div className="space-x-4">
            <Link 
              to="/collections" 
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Collections
            </Link>
            <Link 
              to="/bhyross" 
              className="inline-block border border-gray-900 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanshipPage;
            
      