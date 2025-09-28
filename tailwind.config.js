/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clean White-Black Theme (matching login page)
        'primary': '#000000',        // Pure black
        'secondary': '#ffffff',      // Pure white
        'secondary-light': '#f8f9fa', // Very light gray
        'surface': '#ffffff',        // White surface
        'surface-hover': '#f8f9fa',  // Light hover
        'border': '#e5e7eb',         // Light border
        'text': '#000000',           // Black text
        'text-secondary': '#6b7280', // Gray text
        'text-muted': '#9ca3af',     // Muted text
        'accent': '#000000',         // Black accent
        'accent-hover': '#1a1a1a',   // Dark hover
        'success': '#10b981',        // Green
        'warning': '#f59e0b',        // Orange
        'error': '#ef4444',          // Red
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'modern-gradient': 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        'subtle-gradient': 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
      },
      boxShadow: {
        'modern': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modern-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elegant': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
}
