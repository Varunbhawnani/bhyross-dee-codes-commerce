import React, { useState } from 'react';
import { ArrowLeft, Ruler, User, Shirt, Users } from 'lucide-react';

const SizeGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('women');
  const [selectedCategory, setSelectedCategory] = useState('tops');

  const sizingData = {
    women: {
      tops: {
        headers: ['Size', 'Chest (inches)', 'Waist (inches)', 'Hip (inches)', 'Length (inches)'],
        rows: [
          ['XS', '32-34', '26-28', '36-38', '24'],
          ['S', '34-36', '28-30', '38-40', '25'],
          ['M', '36-38', '30-32', '40-42', '26'],
          ['L', '38-40', '32-34', '42-44', '27'],
          ['XL', '40-42', '34-36', '44-46', '28'],
          ['XXL', '42-44', '36-38', '46-48', '29']
        ]
      },
      bottoms: {
        headers: ['Size', 'Waist (inches)', 'Hip (inches)', 'Inseam (inches)', 'Rise (inches)'],
        rows: [
          ['XS', '26-28', '36-38', '28', '8'],
          ['S', '28-30', '38-40', '29', '8.5'],
          ['M', '30-32', '40-42', '30', '9'],
          ['L', '32-34', '42-44', '31', '9.5'],
          ['XL', '34-36', '44-46', '32', '10'],
          ['XXL', '36-38', '46-48', '33', '10.5']
        ]
      },
      dresses: {
        headers: ['Size', 'Chest (inches)', 'Waist (inches)', 'Hip (inches)', 'Length (inches)'],
        rows: [
          ['XS', '32-34', '26-28', '36-38', '38'],
          ['S', '34-36', '28-30', '38-40', '39'],
          ['M', '36-38', '30-32', '40-42', '40'],
          ['L', '38-40', '32-34', '42-44', '41'],
          ['XL', '40-42', '34-36', '44-46', '42'],
          ['XXL', '42-44', '36-38', '46-48', '43']
        ]
      }
    },
    men: {
      tops: {
        headers: ['Size', 'Chest (inches)', 'Waist (inches)', 'Shoulder (inches)', 'Length (inches)'],
        rows: [
          ['XS', '34-36', '28-30', '17', '27'],
          ['S', '36-38', '30-32', '18', '28'],
          ['M', '38-40', '32-34', '19', '29'],
          ['L', '40-42', '34-36', '20', '30'],
          ['XL', '42-44', '36-38', '21', '31'],
          ['XXL', '44-46', '38-40', '22', '32']
        ]
      },
      bottoms: {
        headers: ['Size', 'Waist (inches)', 'Hip (inches)', 'Inseam (inches)', 'Rise (inches)'],
        rows: [
          ['XS', '28-30', '36-38', '30', '9'],
          ['S', '30-32', '38-40', '31', '9.5'],
          ['M', '32-34', '40-42', '32', '10'],
          ['L', '34-36', '42-44', '33', '10.5'],
          ['XL', '36-38', '44-46', '34', '11'],
          ['XXL', '38-40', '46-48', '35', '11.5']
        ]
      },
      suits: {
        headers: ['Size', 'Chest (inches)', 'Waist (inches)', 'Shoulder (inches)', 'Jacket Length (inches)'],
        rows: [
          ['36R', '36', '30', '18', '29'],
          ['38R', '38', '32', '18.5', '30'],
          ['40R', '40', '34', '19', '31'],
          ['42R', '42', '36', '19.5', '32'],
          ['44R', '44', '38', '20', '33'],
          ['46R', '46', '40', '20.5', '34']
        ]
      }
    }
  };

  // Define the derived variables here
  const currentData = sizingData[activeTab as keyof typeof sizingData];
  const currentCategoryData = currentData[selectedCategory as keyof typeof currentData];

  const measurementTips = [
    {
      title: "Chest/Bust",
      description: "Measure around the fullest part of your chest, keeping the tape parallel to the floor."
    },
    {
      title: "Waist",
      description: "Measure around your natural waistline, typically the narrowest part of your torso."
    },
    {
      title: "Hip",
      description: "Measure around the fullest part of your hips, approximately 8 inches below your waist."
    },
    {
      title: "Inseam",
      description: "Measure from the crotch seam to the bottom of the leg along the inner seam."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Size Guide
          </h1>
       <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find your perfect fit with our comprehensive sizing guide. 
            Accurate measurements ensure comfort and confidence in every garment.
          </p>
        </div>

        {/* Gender Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('women')}
              className={`px-6 py-2 rounded-md transition-colors flex items-center ${
                activeTab === 'women'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Women
            </button>
            <button
              onClick={() => setActiveTab('men')}
              className={`px-6 py-2 rounded-md transition-colors flex items-center ${
                activeTab === 'men'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Men
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            {Object.keys(currentData).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Size Chart */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
=
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Regular Fit</h3>
              <p className="text-gray-600 text-sm">
                Classic comfortable fit with room to move. Perfect balance 
                between fitted and relaxed for everyday wear.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Relaxed Fit</h3>
              <p className="text-gray-600 text-sm">
                Loose, comfortable fit with extra room throughout. 
                Great for casual wear and maximum comfort.
              </p>
            </div>
          </div>
        </div>

        {/* Size Conversion */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">International Size Conversion</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Women's Sizing</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">US</th>
                        <th className="text-left py-2">UK</th>
                        <th className="text-left py-2">EU</th>
                        <th className="text-left py-2">AU</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="py-1">XS</td><td>6</td><td>32</td><td>6</td></tr>
                      <tr><td className="py-1">S</td><td>8</td><td>34</td><td>8</td></tr>
                      <tr><td className="py-1">M</td><td>10</td><td>36</td><td>10</td></tr>
                      <tr><td className="py-1">L</td><td>12</td><td>38</td><td>12</td></tr>
                      <tr><td className="py-1">XL</td><td>14</td><td>40</td><td>14</td></tr>
                      <tr><td className="py-1">XXL</td><td>16</td><td>42</td><td>16</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Men's Sizing</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">US</th>
                        <th className="text-left py-2">UK</th>
                        <th className="text-left py-2">EU</th>
                        <th className="text-left py-2">AU</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="py-1">XS</td><td>32</td><td>42</td><td>XS</td></tr>
                      <tr><td className="py-1">S</td><td>34</td><td>44</td><td>S</td></tr>
                      <tr><td className="py-1">M</td><td>36</td><td>46</td><td>M</td></tr>
                      <tr><td className="py-1">L</td><td>38</td><td>48</td><td>L</td></tr>
                      <tr><td className="py-1">XL</td><td>40</td><td>50</td><td>XL</td></tr>
                      <tr><td className="py-1">XXL</td><td>42</td><td>52</td><td>XXL</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Our sizing experts are here to help you find the perfect fit. 
            Contact us for personalized sizing advice.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => alert('Contact support feature coming soon!')}
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Contact Support
            </button>
            <button 
              onClick={() => alert('Redirecting to shop...')}
              className="inline-block border border-gray-900 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;