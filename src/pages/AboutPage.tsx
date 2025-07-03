import Navigation from '@/components/Navigation';
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Award, Users, Globe, Heart } from "lucide-react";

const About = () => {
  const milestones = [
    { year: "1985", event: "Founded with a vision to craft exceptional formal footwear" },
    { year: "1995", event: "Launched our first international collection" },
    { year: "2010", event: "Introduced sustainable leather sourcing practices" },
    { year: "2018", event: "Expanded to three distinctive brand collections" },
    { year: "2024", event: "Serving professionals worldwide with premium footwear" }
  ];

  const values = [
    {
      icon: Award,
      title: "Craftsmanship Excellence",
      description: "Every pair is meticulously crafted using traditional techniques passed down through generations."
    },
    {
      icon: Users,
      title: "Customer First",
      description: "We believe in building lasting relationships with our customers through exceptional service."
    },
    {
      icon: Globe,
      title: "Global Vision",
      description: "Bringing premium formal footwear to professionals around the world."
    },
    {
      icon: Heart,
      title: "Passion Driven",
      description: "Our love for fine footwear drives everything we do, from design to delivery."
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
              Crafting Excellence Since 1985
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in">
              For nearly four decades, Imcolus has been synonymous with premium formal footwear. 
              We've built our reputation on uncompromising quality, timeless design, and the belief 
              that the right pair of shoes can transform how you feel and perform.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">Our Story</h2>
                <div className="space-y-4 md:space-y-6 text-muted-foreground text-sm sm:text-base">
                  <p>
                    Founded in 1985 by master craftsman Alessandro Imcolus, our company began as a small 
                    workshop in Milan with a simple yet ambitious goal: to create the finest formal shoes 
                    that would stand the test of time.
                  </p>
                  <p>
                    What started as a passion project has evolved into three distinct collections, each 
                    representing a different aspect of the modern professional's lifestyle. From the 
                    timeless elegance of Imcolus Classics to the contemporary sophistication of Dee Codes 
                    Modern and the luxurious craftsmanship of Bhyross Signature.
                  </p>
                  <p>
                    Today, we continue to honor our founder's vision while embracing innovation, 
                    ensuring that every pair of Imcolus shoes delivers both style and substance to 
                    discerning professionals worldwide.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-4 md:p-6 lg:p-8">
                    <h3 className="font-playfair text-lg sm:text-xl lg:text-2xl font-bold mb-2 md:mb-4">Heritage Craftsmanship</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Every pair tells a story of dedication, skill, and passion for excellence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">Our Journey</h2>
            <div className="max-w-4xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-10 lg:mb-12 last:mb-0 animate-fade-in">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-montserrat font-bold text-sm md:text-base">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <div className="pt-1 md:pt-2">
                    <h3 className="font-montserrat font-bold text-base md:text-lg mb-1 md:mb-2">{milestone.year}</h3>
                    <p className="text-muted-foreground text-sm md:text-base">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-4 md:p-6 rounded-lg hover:bg-muted/30 transition-colors animate-fade-in">
                  <value.icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mx-auto mb-3 md:mb-4 text-primary" />
                  <h3 className="font-montserrat font-bold text-base md:text-lg mb-2 md:mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Experience the Imcolus Difference
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto opacity-90">
              Discover why professionals worldwide trust Imcolus for their most important moments.
            </p>
            <Button variant="secondary" size="lg" className="font-montserrat font-semibold" onClick={() => window.location.href = `/`}>
              
              Explore Collections
            </Button>


          </div>
        </section>
      </main>

      
    
     <Footer brand="bhyross" />
        
      
    </div>
    );
};

export default About;