import Navigation from '@/components/Navigation';
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Award, Users, Globe, Heart } from "lucide-react";

const About = () => {
  const milestones = [
    { year: "2024", event: "Aditya International established in Agra with a vision to craft exceptional formal footwear" },
    { year: "2024", event: "Built production facilities with skilled local artisans" },
    { year: "2024", event: "Launched first collection of premium formal shoes" },
    { year: "2024", event: "Introduced sustainable leather sourcing and quality control processes" },
    { year: "2024", event: "Expanded product range to include diverse formal shoe styles" },
    { year: "2025", event: "Developed distinctive collections - Imcolus, Dee Codes, and Bhyross" },
    { year: "2025", event: "Launched comprehensive online platform for direct customer access" },
    { year: "2025", event: "Expanding reach to serve professionals across India" }
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
      title: "National Vision",
      description: "Bringing premium formal footwear to professionals across India from Aditya International's base in Agra."
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
              Crafting Excellence Since 2024
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Based in the historic city of Agra, Aditya International specializes in creating 
              premium formal footwear that combines traditional Indian craftsmanship with modern design. 
              We believe that the right pair of shoes can transform how you feel and perform.
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
                    Founded in 2024 by visionary entrepreneur Murlidhar Bhawnani, Aditya International 
                    was established in Agra, Uttar Pradesh, with a mission to create the finest formal 
                    footwear that would stand the test of time.
                  </p>
                  <p>
                    Drawing inspiration from Agra's rich heritage of craftsmanship - the same city that 
                    gave birth to the magnificent Taj Mahal - Aditya International has developed 
                    distinctive collections including Imcolus, Dee Codes, and Bhyross, each catering to 
                    different aspects of the modern Indian professional's lifestyle.
                  </p>
                  <p>
                    Today, Aditya International continues to honor our founder's vision while embracing 
                    innovation, ensuring that every pair of shoes delivers both style and substance to 
                    discerning professionals across India.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://rfssuewzrvhatnwolmnp.supabase.co/storage/v1/object/public/products//ChatGPT%20Image%20Jul%202,%202025,%2006_05_00%20PM.png"
                    alt="Heritage Craftsmanship"
                    className="w-full h-full object-cover"
                  />
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
              Experience the Aditya International Difference
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto opacity-90">
              Discover why professionals across India trust Aditya International for their most important moments.
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
