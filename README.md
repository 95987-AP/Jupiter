<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Jupiter Experience - Interactive 3D Space Exploration

An immersive, highly animated web experience showcasing Jupiter with stunning 3D graphics, parallax effects, and engaging animations powered by Three.js and React.

## ✨ Features

### 🪐 Realistic Jupiter Model
- **High-Resolution Texture**: Real 2K Jupiter texture showing atmospheric bands and the Great Red Spot
- **Multi-Layer Atmosphere**: Three atmospheric layers with different opacities and glow effects
- **Dynamic Lighting**: Multiple light sources including directional, point, and hemisphere lights
- **Realistic Rotation**: Accurate rotation speed matching Jupiter's ~10-hour day
- **Atmospheric Animation**: Counter-rotating atmosphere layer for dynamic gas giant effect
- **Volumetric Glow**: Inner and outer glow layers simulating atmospheric scattering
- **Zoom-Responsive Effects**: Atmosphere opacity and light intensity increase as camera approaches
- **Scale Animation**: Jupiter grows 1.5x during zoom for impressive close-up views

### 🌙 Orbiting Galilean Moons
- **4 Major Moons**: Io, Europa, Ganymede, and Callisto with accurate relative sizes
- **Realistic Orbits**: Each moon has unique orbital radius and speed
- **Orbit Visualization**: Subtle orbital path lines with moon-colored glow
- **Dynamic Visibility**: Moons fade out gracefully as camera zooms past them (70% scroll)
- **Individual Colors**: Gold (Io), Ice Blue (Europa), Grey (Ganymede), Brown (Callisto)
- **Point Light Halos**: Each moon emits colored glow matching its surface
- **Smooth Animation**: Vertical oscillation and rotation for lifelike movement

### ☄️ Advanced Asteroid Field System
- **60+ Realistic Asteroids**: High-detail rock texture with procedural normal mapping
- **Complex Orbital Mechanics**: 
  - Elliptical 3D orbits with orbital resonance
  - Gravitational perturbations simulating Jupiter's influence
  - Counter-rotating asteroids with varied speeds
  - Dynamic tumbling rotation with chaotic drift
- **Cinematic Lens Flares**:
  - Multi-layer flare system (main, ring, hexagonal, ghost)
  - Chromatic aberration effects
  - Screen-space positioning with perspective
  - Distance and angle-based fade
  - Pulsing and flickering animation
- **800+ Debris Particles**: Small particles orbiting between asteroids
- **Enhanced Parallax**: Multi-depth scrolling based on orbital distance
- **Atmospheric Scattering**: Distance-based color and brightness adjustment
- **Dynamic Lighting**: Point lights on brightest asteroids
- **Performance Optimized**: Instanced rendering for 60 FPS

### 🎨 Enhanced Visual Experience
- **Advanced 3D Galaxy Background**: Spiral galaxy with 40,000+ particles featuring multiple color branches (orange, purple, deep blue)
- **Animated Jupiter Sphere**: Procedurally generated texture with atmospheric bands and the Great Red Spot
- **Dynamic Lighting**: Multiple light sources including point lights and directional lights with pulsing effects
- **Multi-layer Stars**: Depth-based star fields with different speeds and intensities
- **Atmospheric Effects**: Fog effects and gradient overlays for enhanced depth

### 🌊 Parallax & Scroll Effects
- **Cinematic Zoom Parallax**: Camera zooms from distance (z=12) to close-up (z=3.5) as you scroll
- **Orbital Camera Movement**: 90-degree rotation around Jupiter during scroll
- **Dynamic FOV**: Field of view narrows from 45° to 35° for dramatic close-up effect
- **Jupiter Scale Effect**: Planet appears 1.5x larger when fully zoomed in
- **Dynamic Fog**: Fog adjusts from (15-50) to (5-30) for clarity at close range
- **Smooth Interpolation**: All camera movements use lerp for buttery smooth transitions
- **Hero Section Fade**: Dynamic opacity and scale transformations based on scroll position
- **Animated Progress Line**: Timeline with scroll-triggered progress indicator
- **Multi-Depth Parallax**: All elements move at different speeds creating depth

### 🎭 Engaging Animations
- **Hero Section**:
  - Letter-spacing animation on subtitle
  - Spring-based scale animation on title with gradient text
  - Pulsing call-to-action button with glow effect
  - Infinite bouncing scroll indicator

- **Info Cards**:
  - Staggered fade-in with 3D rotation effect
  - Icon rotation on hover
  - Background gradient reveals
  - Floating background blobs with parallax

- **Moon Gallery**:
  - 3D flip transitions between moons
  - Rotating orbital ring effects
  - Pulsing moon surfaces with lighting
  - Smooth layout animations with Framer Motion

- **Timeline**:
  - Scroll-based progress line animation
  - Pulsing timeline dots with expanding halos
  - Staggered content reveals from alternating sides
  - Hover effects with scale and translation

- **Navigation**:
  - Slide-in entrance animation
  - Underline reveal on hover
  - Mobile menu with slide animations
  - Logo hover with glow effect

- **Footer**:
  - Animated gradient line
  - Link hover effects with vertical movement

### 🎯 Additional Enhancements
- **Custom CSS Animations**: Gradient shifts, glow pulses, shimmer effects
- **Performance Optimizations**: GPU acceleration and reduced motion support
- **Smooth Scrolling**: Native smooth scroll behavior
- **Responsive Design**: Fully optimized for mobile and desktop

## 🚀 Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## 🛠️ Technology Stack

- **React 19** - UI framework
- **Three.js** - 3D graphics engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **Framer Motion** - Animation library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type safety

## 🎨 Color Palette

- Jupiter Orange: `#FF6B35`
- Jupiter Gold: `#F7931E`
- Jupiter Cream: `#FFF8E7`
- Deep Space Blue: `#0B1929`
- Space Navy: `#152538`
- Accent Purple: `#9D4EDD`

## 📱 Browser Support

Optimized for modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎓 Credits

Inspired by NASA's Jupiter missions and space visualization techniques.

View your app in AI Studio: https://ai.studio/apps/drive/1EfnvBx4x2_gj1xfwHqyxlHAQUL6dm6tL
