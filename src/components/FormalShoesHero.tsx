import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MousePosition {
  x: number;
  y: number;
}

const FormalShoesHero: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [buttonState, setButtonState] = useState<string>('Shop Collection');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  
  const heroRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const shoeModelRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const lastScrollY = useRef<number>(0);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(500, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Camera position
    camera.position.set(0, 0, 5);
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, -5, 5);
    scene.add(directionalLight2);
    
    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 5, 0);
    spotLight.angle = 0.6;
    spotLight.penumbra = 1;
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Create 3D shoe model
    createShoeModel(scene);
    
    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (shoeModelRef.current) {
        // Smooth rotation based on mouse position
        const targetRotationY = mousePosition.x * 0.5;
        const targetRotationX = mousePosition.y * 0.3;
        
        shoeModelRef.current.rotation.y += (targetRotationY - shoeModelRef.current.rotation.y) * 0.1;
        shoeModelRef.current.rotation.x += (targetRotationX - shoeModelRef.current.rotation.x) * 0.1;
        
        // Floating animation
        shoeModelRef.current.position.y = Math.sin(Date.now() * 0.0005) * 0.1;
        
        // Scale based on activation
        const targetScale = isActive ? 1 : 0.8;
        const currentScale = shoeModelRef.current.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.1;
        shoeModelRef.current.scale.setScalar(newScale);
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mousePosition, isActive]);

  // Create detailed shoe model using basic geometries
  const createShoeModel = (scene: THREE.Scene) => {
    const shoeGroup = new THREE.Group();
    
    // Main shoe sole
    const soleGeometry = new THREE.CylinderGeometry(0.8, 1.0, 0.2, 16);
    const soleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2c1810,
      shininess: 30,
      specular: 0x111111
    });
    const sole = new THREE.Mesh(soleGeometry, soleMaterial);
    sole.position.y = -0.5;
    sole.scale.set(1.5, 1, 2.2);
    sole.castShadow = true;
    sole.receiveShadow = true;
    shoeGroup.add(sole);
    
    // Shoe upper - main body
    const upperGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const upperMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1a1a1a,
      shininess: 80,
      specular: 0x444444
    });
    const upper = new THREE.Mesh(upperGeometry, upperMaterial);
    upper.position.y = -0.1;
    upper.scale.set(1.3, 0.8, 2.0);
    upper.castShadow = true;
    upper.receiveShadow = true;
    shoeGroup.add(upper);
    
    // Shoe toe cap
    const toeCapGeometry = new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const toeCapMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0f0f0f,
      shininess: 100,
      specular: 0x666666
    });
    const toeCap = new THREE.Mesh(toeCapGeometry, toeCapMaterial);
    toeCap.position.set(0, 0.1, 1.2);
    toeCap.scale.set(1.1, 0.6, 1.0);
    toeCap.castShadow = true;
    toeCap.receiveShadow = true;
    shoeGroup.add(toeCap);
    
    // Shoe heel
    const heelGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8);
    const heelMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2c1810,
      shininess: 40,
      specular: 0x222222
    });
    const heel = new THREE.Mesh(heelGeometry, heelMaterial);
    heel.position.set(0, -0.7, -1.2);
    heel.scale.set(1.2, 1, 1);
    heel.castShadow = true;
    heel.receiveShadow = true;
    shoeGroup.add(heel);
    
    // Shoe laces area
    const lacesGeometry = new THREE.BoxGeometry(0.8, 0.3, 1.2);
    const lacesMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0a0a0a,
      shininess: 60,
      specular: 0x333333
    });
    const laces = new THREE.Mesh(lacesGeometry, lacesMaterial);
    laces.position.set(0, 0.3, 0.2);
    laces.castShadow = true;
    laces.receiveShadow = true;
    shoeGroup.add(laces);
    
    // Decorative stitching lines
    for (let i = 0; i < 8; i++) {
      const stitchGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 4);
      const stitchMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
      const stitch = new THREE.Mesh(stitchGeometry, stitchMaterial);
      stitch.position.set(0.6 * Math.cos(i * 0.3), 0.1, 0.6 * Math.sin(i * 0.3));
      stitch.rotation.x = Math.PI / 2;
      stitch.scale.set(0.5, 0.5, 0.5);
      shoeGroup.add(stitch);
    }
    
    // Shoe eyelets
    for (let i = 0; i < 6; i++) {
      const eyeletGeometry = new THREE.RingGeometry(0.05, 0.08, 8);
      const eyeletMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 100,
        specular: 0x888888
      });
      const eyelet = new THREE.Mesh(eyeletGeometry, eyeletMaterial);
      eyelet.position.set(
        0.4 * (i % 2 === 0 ? 1 : -1),
        0.4 - (i * 0.1),
        0.3 - (i * 0.1)
      );
      eyelet.rotation.y = Math.PI / 2;
      shoeGroup.add(eyelet);
    }
    
    // Position and rotate the entire shoe
    shoeGroup.position.set(0, 0, 0);
    shoeGroup.rotation.y = Math.PI / 6;
    shoeGroup.rotation.x = -Math.PI / 12;
    shoeGroup.scale.setScalar(0.8);
    
    scene.add(shoeGroup);
    shoeModelRef.current = shoeGroup;
    setModelLoaded(true);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current && mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll and mouse handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroSection = heroRef.current;
      
      if (!heroSection) return;
      
      const heroTop = heroSection.offsetTop;
      const heroBottom = heroTop + heroSection.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const scrollIntoHero = Math.max(0, currentScrollY - heroTop);
      const progressPercent = Math.min(100, (scrollIntoHero / viewportHeight) * 100);
      
      setScrollProgress(progressPercent);
      
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      setScrollDirection(direction);
      lastScrollY.current = currentScrollY;
      
      if (currentScrollY + viewportHeight > heroTop && currentScrollY < heroBottom) {
        const scrollProgressNormalized = scrollIntoHero / viewportHeight;
        if (scrollProgressNormalized > 0.1) {
          setIsActive(true);
        }
      } else {
        setIsActive(false);
      }
    };

    const handleMouseMove = (e: MouseEvent): void => {
      const heroSection = heroRef.current;
      if (!heroSection) return;
      
      const rect = heroSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        setMousePosition({ x: mouseX, y: mouseY });
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousemove', handleMouseMove);
    
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleButtonClick = (): void => {
    setButtonState('Loading...');
    setTimeout(() => {
      setButtonState('Shop Collection');
      // Replace with actual navigation logic
      console.log('Navigate to shop collection');
    }, 600);
  };

  return (
    <div className="relative">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-black opacity-10 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main interactive section */}
      <section ref={heroRef} className="relative h-[120vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-100">
        <div className="sticky top-0 h-screen flex items-center justify-center">
          {/* Enhanced scroll progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-black to-gray-600 transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          
          {/* Ambient lighting effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(0,0,0,0.02) 0%, transparent 50%)`
            }}
          />
          
          <div className="flex w-[90%] max-w-[1400px] h-[80vh] items-center justify-between relative">
            {/* Enhanced Text Panel */}
            <div className={`flex-1 pr-24 z-10 transition-all duration-1000 ${
              isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            } ${scrollDirection === 'up' ? 'translate-x-5' : ''}`}>
              
              <div className={`text-sm tracking-[6px] uppercase mb-6 text-gray-600 transition-all duration-800 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                <span className="inline-block animate-pulse">✦</span> Handcrafted Excellence
              </div>
              
              <h1 className={`text-8xl font-extralight leading-none mb-8 text-black transition-all duration-800 delay-200 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                  TIMELESS<br/>
                  ELEGANCE
                </span>
              </h1>
              
              <p className={`text-xl leading-relaxed mb-10 text-gray-700 max-w-lg transition-all duration-800 delay-400 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                Discover our collection of premium formal shoes, 
                meticulously crafted by master artisans using 
                traditional techniques and the finest materials.
              </p>
              
              <div className={`grid grid-cols-2 gap-8 mb-12 transition-all duration-800 delay-600 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}>
                {[
                  { value: '50+', label: 'Years Experience' },
                  { value: '100%', label: 'Hand Crafted' },
                  { value: 'Premium', label: 'Italian Leather' },
                  { value: '24/7', label: 'Support' }
                ].map((stat, index) => (
                  <div key={index} className="border-l-2 border-gray-300 pl-5 hover:border-black transition-colors duration-300">
                    <div className="text-3xl font-light mb-1 text-black">{stat.value}</div>
                    <div className="text-sm opacity-70 text-gray-600 uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleButtonClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group relative bg-transparent border-2 border-black text-black px-12 py-5 text-sm uppercase tracking-[2px] cursor-pointer transition-all duration-500 hover:bg-black hover:text-white hover:shadow-2xl transform ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                } ${buttonState === 'Loading...' ? 'scale-95' : 'scale-100'} ${isHovered ? 'scale-105' : ''}`}
                style={{ transitionDelay: isActive ? '800ms' : '0ms' }}
              >
                <span className="relative z-10">{buttonState}</span>
                <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>
            </div>
            
            {/* 3D Shoe Display */}
            <div className="flex-1 relative h-full">
              <div className={`h-full w-full transition-all duration-1000 ${
                isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-60'
              }`}>
                <div 
                  ref={mountRef}
                  className="w-full h-full flex items-center justify-center"
                  style={{ minHeight: '400px' }}
                />
              </div>
              
              {/* Enhanced Price Tag */}
              <div className={`absolute bottom-8 right-8 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg transition-all duration-800 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <div className="text-2xl font-light text-black">
                  <span className="text-sm opacity-70 text-gray-600">From </span>
                  <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">$395</span>
                </div>
              </div>
              
              {/* Model Loading Indicator */}
              {!modelLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading 3D Model...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Scroll Indicator */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-800 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="text-xs uppercase tracking-[2px] mb-2 opacity-60 text-gray-600">
              Scroll to Explore
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-black to-transparent animate-pulse" />
          </div>
        </div>
      </section>
      
      {/* Additional content section for scroll demonstration */}
      <section className="min-h-screen bg-white p-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-light mb-8 text-center text-black">Our Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Oxford Classic', price: '$395', image: '👞' },
              { name: 'Derby Deluxe', price: '$445', image: '👞' },
              { name: 'Brogue Premium', price: '$495', image: '👞' }
            ].map((shoe, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
                <div className="text-6xl mb-4">{shoe.image}</div>
                <h3 className="text-xl font-light mb-2 text-black">{shoe.name}</h3>
                <p className="text-gray-600 text-lg">{shoe.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormalShoesHero;