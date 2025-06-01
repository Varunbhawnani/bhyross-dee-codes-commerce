
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Professional Trust Colors
				trust: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617'
				},
				// Professional Blue (Primary Brand)
				professional: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					950: '#172554'
				},
				// Warm Accent (Secondary)
				warm: {
					50: '#fef7ed',
					100: '#fdedd3',
					200: '#fcd9a5',
					300: '#fbbf6d',
					400: '#f89c33',
					500: '#f67e0b',
					600: '#e76506',
					700: '#c04f08',
					800: '#9a3f0f',
					900: '#7c3510',
					950: '#431a06'
				},
				// Success/Trust Green
				success: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
					950: '#052e16'
				},
				// Brand-specific colors
				bhyross: {
					50: '#fef7ed',
					100: '#fdedd3',
					200: '#fcd9a5',
					300: '#fbbf6d',
					400: '#f89c33',
					500: '#f67e0b',
					600: '#e76506',
					700: '#c04f08',
					800: '#9a3f0f',
					900: '#7c3510',
					950: '#431a06'
				},
				deecodes: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					950: '#172554'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(40px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'slide-in-left': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shine': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' 
					},
					'50%': { 
						boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' 
					}
				},
				'stagger-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.7s ease-out',
				'slide-in-left': 'slide-in-left 0.7s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'shine': 'shine 2s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'stagger-in': 'stagger-in 0.6s ease-out'
			},
			// Animation delays
			animationDelay: {
				'100': '100ms',
				'200': '200ms',
				'300': '300ms',
				'400': '400ms',
				'500': '500ms',
				'600': '600ms',
				'700': '700ms',
				'800': '800ms',
				'900': '900ms',
				'1000': '1000ms',
			},
			backdropBlur: {
				xs: '2px',
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		// Custom plugin for professional animations and interactions
		function({ addUtilities, theme }) {
			const delays = theme('animationDelay');
			const delayUtilities = Object.entries(delays).reduce((acc, [key, value]) => {
				acc[`.animation-delay-${key}`] = {
					'animation-delay': value,
				};
				return acc;
			}, {});

			addUtilities({
				...delayUtilities,
				// Professional Card Hover Effects
				'.card-hover': {
					'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					'&:hover': {
						'transform': 'translateY(-8px) scale(1.02)',
						'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
					}
				},
				// Button Micro-interactions
				'.btn-professional': {
					'transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
					'&:hover': {
						'transform': 'translateY(-2px)',
						'box-shadow': '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
					},
					'&:active': {
						'transform': 'translateY(0)',
						'transition': 'all 0.1s',
					}
				},
				// Shine Effect
				'.shine-effect': {
					'position': 'relative',
					'overflow': 'hidden',
					'&::before': {
						'content': '""',
						'position': 'absolute',
						'top': '0',
						'left': '-100%',
						'width': '100%',
						'height': '100%',
						'background': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
						'transition': 'left 0.6s ease-in-out',
					},
					'&:hover::before': {
						'left': '100%',
					}
				},
				// Stagger Animation Classes
				'.stagger-item': {
					'opacity': '0',
					'animation': 'stagger-in 0.6s ease-out forwards',
				},
				'.stagger-1': { 'animation-delay': '0.1s' },
				'.stagger-2': { 'animation-delay': '0.2s' },
				'.stagger-3': { 'animation-delay': '0.3s' },
				'.stagger-4': { 'animation-delay': '0.4s' },
				'.stagger-5': { 'animation-delay': '0.5s' },
				'.stagger-6': { 'animation-delay': '0.6s' },
				// Glass Morphism
				'.glass': {
					'background': 'rgba(255, 255, 255, 0.1)',
					'backdrop-filter': 'blur(10px)',
					'border': '1px solid rgba(255, 255, 255, 0.2)',
				},
				// Professional Gradients
				'.gradient-professional': {
					'background': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
				},
				'.gradient-warm': {
					'background': 'linear-gradient(135deg, #f67e0b 0%, #c04f08 100%)',
				},
				'.gradient-trust': {
					'background': 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
				}
			});
		}
	],
} satisfies Config;
