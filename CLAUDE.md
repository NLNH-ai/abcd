# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**하나비 (Hanabi) - Indie Rock Band Official Website**

This is a single-page application (SPA) website for the indie rock band "하나비". The site showcases the band's identity, member profiles, music videos, and contact information with cinematic animations and visual effects.

**Tech Stack:**
- Pure HTML/CSS/JavaScript (no build system)
- Tailwind CSS (via CDN)
- Anime.js for advanced animations
- Custom CSS animations and effects

## Commands

### Development
```bash
# No build required - open index.html directly in browser
# On Windows:
start index.html

# Or use a local server (recommended):
npx http-server -p 8080
# or
python -m http.server 8080
```

### Testing
```bash
# No automated tests configured
# Manual testing: open index.html in browser
```

## Architecture & Structure

### File Organization
```
project-root/
├── index.html           # Main application (2476 lines, ~98KB)
├── images/              # Band member photos and album artwork
│   ├── 윤태.png         # Yuntae (guitarist)
│   ├── 진호.png         # Jinho (guitarist)
│   ├── 찬희.png         # Chanhee (bassist)
│   ├── 경준.jpeg        # Kyungjun
│   ├── 건희.png         # Geonhee
│   ├── 고양이.jpg       # Band mascot cat
│   ├── 앨범 표지 1.png   # Album cover
│   ├── 앨범 소개 2.png   # Album intro
│   ├── 앨범 소개 3.png   # Album info
│   └── 현상금 윤태.png   # Yuntae bounty poster
├── videos/              # Performance videos
│   ├── band-performance.mp4
│   ├── 윤태_guitar_performance.mp4
│   ├── 진호_guitar_performance.mp4
│   └── 하나비_밴드_오프닝_영상_제작.mp4
└── package.json         # Minimal config (no dependencies)
```

### Core Architecture (index.html)

**The entire application is self-contained in a single HTML file with three main sections:**

#### 1. **Inline Styles** (Lines 49-997)
- **Custom Animations**: fade-in, slide, scale, rotate, glitch, RGB split, hologram effects
- **Background Effects**: starfield, aurora, light beams, morphing geometric patterns
- **Interactive Effects**: liquid transitions, card hover states, parallax scrolling
- **Responsive Design**: Mobile-first grid system with breakpoints at 768px, 1024px
- **Special Layout**: Five-member grid with custom positioning for asymmetric layout

#### 2. **HTML Structure** (Lines 998-1551)
Main sections in order:
1. **Navigation** (`#nav`) - Sticky header with mobile menu
2. **Hero Section** (`#hero`) - Landing with animated background, band mascot, video
3. **Band Section** (`#band`) - Five member cards with flip animation
   - Each card has front (image + name/role) and back (bio + social links + video button)
   - Members: 윤태 (Guitar), 김진호 (Guitar), 황찬희 (Bass), 이경준 (unknown role), 김건희 (unknown role)
4. **Music Section** (`#music`) - Embedded YouTube video + album artwork gallery
5. **Contact Section** (`#contact`) - Email addresses for booking, press, general inquiries
6. **Footer** - Copyright and social links

#### 3. **JavaScript Logic** (Lines 1552-2296)

**Initialization Flow:**
```javascript
DOMContentLoaded → initializeApp() → [
  initializeNavigation(),
  initializeScrollAnimations(),
  initializeVideoModal(),
  initializeImageModal(),
  initializeAnimeJS()
]
```

**Key Functions:**

- **`createGuitarStrum()`** (line 1557): Welcome sound effect triggered on first user interaction
- **`initializeNavigation()`** (line 1713): Mobile menu toggle + smooth scroll navigation
- **`toggleMobileMenu()`** (line 1743): Show/hide mobile navigation panel
- **`initializeScrollAnimations()`** (line 1757): Intersection Observer for scroll-triggered animations + parallax effects
- **`initializeVideoModal()`** (line 1844): Video player modal for member performance videos
- **`initializeImageModal()`** (line ~1900): Lightbox for album artwork images
- **`initializeAnimeJS()`** (line ~1950): Complex entrance animations using Anime.js library

**Animation System:**
- **Intersection Observer** for scroll-triggered animations (threshold: 0.15)
- **Anime.js** for entrance sequences, button hovers, floating shapes
- **Custom CSS transitions** for card flips, parallax, glitch effects
- **Scroll progress indicator** (fixed top bar showing page scroll percentage)

### Key Technical Patterns

#### Modal System
Two modal types share similar patterns:
1. **Video Modal**: Plays local MP4 files from `/videos/` directory
2. **Image Modal**: Displays full-size images from `/images/` directory

Both use:
- Overlay with backdrop blur
- Click-outside-to-close functionality
- Proper cleanup on close (stop video, reset state)

#### Member Card Flip Animation
```html
<div class="member-card">           <!-- Perspective container -->
  <div class="member-inner">        <!-- 3D transform container -->
    <div class="member-front">...</div>
    <div class="member-back">...</div>
  </div>
</div>
```
- Hover triggers 180° Y-axis rotation
- `backface-visibility: hidden` for clean flip
- Front: member photo + name/role
- Back: bio + Instagram link + video button

#### Responsive Grid System
**Five-member layout logic:**
- Mobile (<768px): 1 column
- Tablet (769-1024px): 2 columns
- Desktop (1025px+): 3 columns with special positioning for 4th and 5th members (grid positioning in specific cells)

### State Management
No formal state management. Uses:
- DOM manipulation via `querySelector` / `getElementById`
- CSS classes for visibility (`visible`, `transform` states)
- Global variables: `isMobileMenuOpen` (line 1554)

### External Dependencies (CDN)
1. **Tailwind CSS** (v3+) - Utility-first CSS framework
2. **Anime.js** (v3.2.1) - Animation library for complex sequences
3. **Google Fonts**: Inter (body), Playfair Display (headers)

### Visual Effects Architecture

**Layered Background System:**
1. Static gradient base
2. Animated starfield (CSS keyframes)
3. Aurora overlay (blur + animation)
4. Floating geometric shapes
5. Dynamic light beams

**Performance Considerations:**
- `will-change` for animated elements
- `transform` and `opacity` for GPU acceleration
- Passive scroll listeners
- RequestAnimationFrame for parallax

## Development Guidelines

### Adding New Band Members
1. Add member image to `/images/` directory (PNG recommended, use `contain` object-fit)
2. Duplicate member card HTML structure (lines 1210-1238 as template)
3. Update card content: name, role, bio, Instagram URL, video button ID
4. If adding video: add video file to `/videos/`, add button ID, register in `initializeVideoModal()`
5. Update grid class if exceeding 5 members (currently uses `five-member-grid`)

### Adding New Sections
Follow existing section pattern:
```html
<section id="section-name" class="py-20 bg-dark">
  <div class="container mx-auto px-6">
    <h2 class="section-title font-display text-4xl md:text-6xl text-gradient">
      SECTION TITLE
    </h2>
    <!-- Content -->
  </div>
</section>
```
- All sections use `.section-title` for scroll animations
- Update navigation links in header and mobile menu

### Modifying Animations
**CSS Animations:**
- Keyframes defined in `<style>` block (lines 49-997)
- Animation classes: `.fade-in`, `.slide-left`, `.slide-right`, `.scale-up`, `.glitch-effect`

**Anime.js Animations:**
- Located in `initializeAnimeJS()` function (line ~1950)
- Use stagger for sequential effects: `delay: anime.stagger(100)`
- Easing options: `'easeOutElastic'`, `'easeInOutCubic'`, `'easeOutQuad'`

### Color System
Tailwind custom colors (line 37-42):
- `primary`: #FF6B6B (coral red)
- `secondary`: #4ECDC4 (turquoise)
- `dark`: #1A1A1A
- `darker`: #0A0A0A
- Gradient: `linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)`

### Testing Checklist
When making changes:
1. Test mobile menu (viewport < 768px)
2. Test member card flip on hover
3. Test video modal (both video buttons)
4. Test image modal (album artwork click)
5. Test smooth scroll navigation
6. Test parallax effects while scrolling
7. Verify guitar strum sound on first interaction
8. Check animation performance (60fps target)

## Known Limitations

1. **No Build System**: All code in single 2297-line HTML file. Consider splitting for maintainability.
2. **Tailwind CDN**: Production warning suppressed (line 19). Consider switching to build-time Tailwind.
3. **No Lazy Loading**: All images loaded upfront. Consider lazy loading for performance.
4. **Hard-coded Content**: All text and URLs embedded. Consider externalizing to JSON.
5. **No Internationalization**: Korean text hard-coded. English metadata in `<head>`.
6. **Browser Audio Restrictions**: Guitar strum requires user interaction due to autoplay policies.
7. **No Version Control**: Project not in git repository.

## Important Notes

- **Language**: Site is in Korean (ko) with English metadata
- **Band Name**: 하나비 (Hanabi) - means "fireworks" in Japanese
- **Email Placeholders**: Contact emails use format `name@하나비.com` (likely placeholders)
- **Backup Files**: `index_backup.html` and `index_old.html` exist - review before deleting
- **Video File Size**: Videos are 75-95MB each - consider compression or CDN hosting
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.