import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Sparkles, Leaf, Zap } from 'lucide-react';

const CollectionsPage: React.FC = () => {
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
            Our Collections
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Curated collections that define contemporary fashion. From timeless classics 
            to cutting-edge designs, explore our diverse range of styles.
          </p>
        </div>

        {/* Brand Collections */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Bhyross Collections */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Bhyross Collections</h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold">Heritage Elegance</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Timeless pieces inspired by classic tailoring and refined aesthetics. 
                  Perfect for formal occasions and sophisticated everyday wear.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Formal Wear</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Business Casual</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Evening Wear</span>
                </div>
                <Link 
                  to="/bhyross/formal" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                <div className="flex items-center mb-4">
                  <Leaf className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold">Sustainable Luxury</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Eco-conscious fashion that doesn't compromise on style. Crafted from 
                  organic and recycled materials for the environmentally aware.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Organic Cotton</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Recycled Materials</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Carbon Neutral</span>
                </div>
                <Link 
                  to="/bhyross/casual" 
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-100">
                <div className="flex items-center mb-4">
                  <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold">Seasonal Capsule</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Limited edition pieces that capture the essence of each season. 
                  Exclusive designs with premium materials and unique details.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Limited Edition</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Premium Materials</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Seasonal</span>
                </div>
                <Link 
                  to="/bhyross/accessories" 
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>

          {/* DeeCodes Collections */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">DeeCodes Collections</h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-100">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600 mr-3" />
                  <h3 className="text-xl font-semibold">Digital Nomad</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Tech-enabled fashion for the modern professional. Smart fabrics 
                  and functional designs for those who work anywhere, anytime.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Smart Fabrics</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Multi-functional</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Travel-friendly</span>
                </div>
                <Link 
                  to="/deecodes/casual" 
                  className="inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-100">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-6 h-6 text-pink-600 mr-3" />
                  <h3 className="text-xl font-semibold">Street Culture</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Urban-inspired designs that blend comfort with bold aesthetics. 
                  For those who make the streets their runway.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">Streetwear</span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">Bold Graphics</span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">Urban Style</span>
                </div>
                <Link 
                  to="/deecodes/streetwear" 
                  className="inline-block bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>

              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-100">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-cyan-600 mr-3" />
                  <h3 className="text-xl font-semibold">Future Forward</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Experimental designs that push the boundaries of conventional fashion. 
                  For innovators and early adopters who embrace tomorrow's trends today.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">Experimental</span>
                  <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">Tech Integration</span>
                  <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">Avant-garde</span>
                </div>
                <Link 
                  to="/deecodes/accessories" 
                  className="inline-block bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Our Collections Special</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Curated Selection</h3>
              <p className="text-gray-600">
                Each piece is carefully selected and designed to complement your lifestyle 
                and personal style preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Sustainable Focus</h3>
              <p className="text-gray-600">
                Every collection incorporates sustainable practices and materials 
                to minimize environmental impact.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Seasonal Updates</h3>
              <p className="text-gray-600">
                Fresh designs and new pieces added regularly to keep your wardrobe 
                current with the latest trends.
              </p>
            </div>
          </div>
        </div>

        {/* Current Season Highlight */}
        <div className="bg-gray-900 text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Current Season: Spring/Summer 2024</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Embrace the season with our latest collections featuring lightweight fabrics, 
            vibrant colors, and innovative designs perfect for warmer weather.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Trending Now</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Lightweight linen blends</li>
                <li>• Bold floral patterns</li>
                <li>• Sustainable denim</li>
                <li>• Minimalist accessories</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Featured Colors</h3>
              <div className="flex space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-400"></div>
                <div className="w-6 h-6 rounded-full bg-green-400"></div>
                <div className="w-6 h-6 rounded-full bg-yellow-400"></div>
                <div className="w-6 h-6 rounded-full bg-pink-400"></div>
              </div>
              <p className="text-sm text-gray-300">Ocean blues, fresh greens, sunset yellows, and coral pinks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;