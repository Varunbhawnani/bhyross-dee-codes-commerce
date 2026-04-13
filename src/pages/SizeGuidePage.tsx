import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Ruler, Footprints, AlertCircle, CheckCircle } from "lucide-react";

const SizeGuide = () => {
  const sizeChart = [
    { us: "6", uk: "5.5", eu: "39", cm: "24.1" },
    { us: "6.5", uk: "6", eu: "39.5", cm: "24.5" },
    { us: "7", uk: "6.5", eu: "40", cm: "24.9" },
    { us: "7.5", uk: "7", eu: "40.5", cm: "25.4" },
    { us: "8", uk: "7.5", eu: "41", cm: "25.8" },
    { us: "8.5", uk: "8", eu: "42", cm: "26.2" },
    { us: "9", uk: "8.5", eu: "42.5", cm: "26.7" },
    { us: "9.5", uk: "9", eu: "43", cm: "27.1" },
    { us: "10", uk: "9.5", eu: "44", cm: "27.5" },
    { us: "10.5", uk: "10", eu: "44.5", cm: "27.9" },
    { us: "11", uk: "10.5", eu: "45", cm: "28.4" },
    { us: "11.5", uk: "11", eu: "45.5", cm: "28.8" },
    { us: "12", uk: "11.5", eu: "46", cm: "29.2" },
  ];

  const measurementSteps = [
    {
      step: 1,
      title: "Prepare for Measurement",
      description: "Measure your feet in the evening when they're at their largest. Wear the type of socks you'll wear with your dress shoes."
    },
    {
      step: 2,
      title: "Trace Your Foot",
      description: "Stand on a piece of paper and trace around your foot with a pen held vertically. Keep the pen close to your foot."
    },
    {
      step: 3,
      title: "Measure Length",
      description: "Measure from the longest toe to the back of your heel. This is your foot length in centimeters."
    },
    {
      step: 4,
      title: "Measure Width",
      description: "Measure the widest part of your foot across the ball area for proper width fitting."
    }
  ];

  const fitTips = [
    {
      icon: CheckCircle,
      title: "Perfect Fit Indicators",
      tips: [
        "Thumb's width of space between longest toe and shoe front",
        "Heel doesn't slip when walking",
        "No pinching at the widest part of your foot",
        "Comfortable from the moment you put them on"
      ]
    },
    {
      icon: AlertCircle,
      title: "Warning Signs",
      tips: [
        "Toes touching the front of the shoe",
        "Foot spilling over the sides",
        "Heel sliding up and down",
        "Any pinching or pressure points"
      ]
    }
  ];

  const widthGuide = [
    { width: "B", description: "Narrow", note: "For slim feet" },
    { width: "D", description: "Standard", note: "Most common width" },
    { width: "E", description: "Wide", note: "For broader feet" },
    { width: "EE", description: "Extra Wide", note: "For very wide feet" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-muted/30 py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
              Size Guide
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Find your perfect fit with our comprehensive sizing guide. 
              Proper fit ensures comfort and confidence all day long.
            </p>
          </div>
        </section>

        {/* Measurement Instructions */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
              How to Measure Your Feet
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12 lg:mb-16">
              {measurementSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-montserrat font-bold text-lg md:text-xl mx-auto mb-3 md:mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-montserrat font-bold text-base md:text-lg mb-2 md:mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/30 p-4 md:p-6 lg:p-8 rounded-lg max-w-4xl mx-auto">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <Ruler className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <h3 className="font-montserrat font-bold text-lg md:text-xl">Pro Tip</h3>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                Measure both feet! It's normal for one foot to be slightly larger than the other. 
                Always use the measurement of your larger foot when selecting your size.
              </p>
            </div>
          </div>
        </section>

        {/* Size Chart */}
        <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
              Size Conversion Chart
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-background rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="px-3 py-3 md:px-4 md:py-4 lg:px-6 text-center font-montserrat font-bold text-sm md:text-base">US Size</th>
                        <th className="px-3 py-3 md:px-4 md:py-4 lg:px-6 text-center font-montserrat font-bold text-sm md:text-base">UK Size</th>
                        <th className="px-3 py-3 md:px-4 md:py-4 lg:px-6 text-center font-montserrat font-bold text-sm md:text-base">EU Size</th>
                        <th className="px-3 py-3 md:px-4 md:py-4 lg:px-6 text-center font-montserrat font-bold text-sm md:text-base">Length (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.map((size, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                          <td className="px-3 py-2 md:px-4 md:py-3 lg:px-6 font-montserrat font-semibold text-sm md:text-base text-center">{size.us}</td>
                          <td className="px-3 py-2 md:px-4 md:py-3 lg:px-6 text-sm md:text-base text-center">{size.uk}</td>
                          <td className="px-3 py-2 md:px-4 md:py-3 lg:px-6 text-sm md:text-base text-center">{size.eu}</td>
                          <td className="px-3 py-2 md:px-4 md:py-3 lg:px-6 text-sm md:text-base text-center">{size.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Width Guide */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
              Width Guide
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              {widthGuide.map((width, index) => (
                <div key={index} className="bg-muted/30 p-4 md:p-6 rounded-lg text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-montserrat font-bold text-base md:text-lg mx-auto mb-2 md:mb-3">
                    {width.width}
                  </div>
                  <h3 className="font-montserrat font-bold text-sm md:text-base lg:text-lg mb-1 md:mb-2">{width.description}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">{width.note}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8 md:mt-12">
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                Most of our shoes are available in D (standard) width. If you typically need a different width, 
                please contact our customer service team to check availability for specific styles.
              </p>
            </div>
          </div>
        </section>

        {/* Fit Tips */}
        <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
              Finding the Perfect Fit
            </h2>
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
              {fitTips.map((section, index) => (
                <div key={index} className="bg-background p-6 md:p-8 rounded-lg">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <section.icon className={`w-6 h-6 md:w-8 md:h-8 ${index === 0 ? 'text-green-600' : 'text-amber-600'}`} />
                    <h3 className="font-montserrat font-bold text-lg md:text-xl">{section.title}</h3>
                  </div>
                  <ul className="space-y-2 md:space-y-3">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 md:gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1 md:mt-2 flex-shrink-0 ${index === 0 ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                        <span className="text-muted-foreground text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collection-Specific Notes */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
              Collection Fit Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <div className="text-center p-4 md:p-6 rounded-lg border border-classics">
                <div className="w-full h-2 bg-classics mb-3 md:mb-4 rounded"></div>
                <h3 className="font-playfair font-bold text-lg md:text-xl mb-2 md:mb-3">Imcolus Classics</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">"Timeless Elegance"</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Traditional last with generous toe box. Runs true to size. 
                  Ideal for those who prefer classic proportions.
                </p>
              </div>
              <div className="text-center p-4 md:p-6 rounded-lg border border-modern">
                <div className="w-full h-2 bg-modern mb-3 md:mb-4 rounded"></div>
                <h3 className="font-playfair font-bold text-lg md:text-xl mb-2 md:mb-3">Dee Codes Modern</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">"Everyday Refined"</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Contemporary fit with sleek silhouette. Runs slightly narrow. 
                  Consider sizing up if you have wider feet.
                </p>
              </div>
              <div className="text-center p-4 md:p-6 rounded-lg border border-luxury">
                <div className="w-full h-2 bg-luxury mb-3 md:mb-4 rounded"></div>
                <h3 className="font-playfair font-bold text-lg md:text-xl mb-2 md:mb-3">Bhyross Signature</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">"Signature Luxury"</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  European last with precision fit. Runs true to size. 
                  Premium leather conforms to foot over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-12 md:py-16 lg:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <Footprints className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-4 md:mb-6 opacity-90" />
            <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-4 md:mb-6">Still Need Help?</h2>
            <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto opacity-90">
              Our sizing experts are here to help you find the perfect fit. 
              Contact us for personalized sizing recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <button className="bg-primary-foreground text-primary px-6 py-2 md:px-8 md:py-3 rounded-lg font-montserrat font-semibold hover:opacity-90 transition-opacity text-sm md:text-base">
                Chat with Expert
              </button>
              <button className="border border-primary-foreground px-6 py-2 md:px-8 md:py-3 rounded-lg font-montserrat font-semibold hover:bg-primary-foreground hover:text-primary transition-colors text-sm md:text-base">
                Call (555) 123-4567
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer brand="imcolus" />
    </div>
  );
};

export default SizeGuide;