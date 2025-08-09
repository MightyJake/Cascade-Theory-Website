# Cascade Theory Website - Project Structure

## Overview
This is a static website for Cascade Theory, a multimedia marketing agency based in Bend, Oregon. The website has been reorganized for better maintainability and logical file structure.

## Directory Structure

```
/app/
├── index.html                 # Main homepage
├── CNAME                     # GitHub Pages configuration
├── pages/                    # HTML pages (except homepage)
│   ├── about.html           # About page
│   ├── shop.html            # Shop/products page
│   ├── case-studies.html    # Case studies showcase
│   └── coming-soon.html     # Coming soon placeholder
├── assets/                   # All static assets
│   ├── css/                 # Stylesheets
│   │   ├── main.css         # Main styles (formerly style.css)
│   │   └── shop.css         # Shop-specific styles
│   ├── js/                  # JavaScript files
│   │   ├── main.js          # Main JavaScript (formerly script.js)
│   │   └── shop.js          # Shop-specific JavaScript
│   ├── images/              # General images
│   │   └── jake_1.jpg       # Profile photo
│   ├── videos/              # Video files
│   │   └── cannonbeach_web.mp4
│   └── logos/               # Logo and branding assets
│       ├── logo_light.svg   # Main logo
│       ├── mark.svg         # Logo mark
│       └── *.png/*.webp     # Company logos
├── case-studies/            # Case study content
│   ├── covers/              # Case study cover images/videos
│   └── content/             # Case study detailed content
└── docs/                    # Documentation
    └── README.md            # This file
```

## Key Changes Made

### 1. File Organization
- Moved HTML pages (except index.html) to `pages/` directory
- Created dedicated `assets/` folder with subfolders by type
- Organized case studies into dedicated folder structure
- Created `docs/` folder for documentation

### 2. Asset Restructuring
- Consolidated all CSS files in `assets/css/`
- Moved JavaScript files to `assets/js/`
- Organized images by type and purpose
- Unified logo assets in `assets/logos/`

### 3. Naming Conventions
- Standardized to kebab-case for all files and folders
- Renamed `style.css` to `main.css` for clarity
- Renamed `script.js` to `main.js` for consistency
- Updated case study folder from `case_studies/` to `case-studies/`

### 4. Path Updates
- Updated all relative paths in HTML files
- Fixed CSS and JavaScript imports
- Corrected asset references throughout the codebase
- Updated navigation links to work with new structure

## File Dependencies

### CSS Dependencies
- All pages depend on `assets/css/main.css`
- Shop page additionally uses `assets/css/shop.css`

### JavaScript Dependencies
- All pages use `assets/js/main.js`
- Shop page additionally uses `assets/js/shop.js`

### External Dependencies
- Tailwind CSS (CDN)
- AOS (Animate On Scroll) library
- Google Fonts (Sora font family)

## Development Notes

### Relative Paths
- Pages in `/pages/` directory use `../` prefix to reference root-level assets
- All asset references updated to maintain functionality
- Navigation links properly point to sections on main page

### Asset Management
- Images optimized and organized by usage
- Videos stored in dedicated folder
- Logos separated from general images for better organization

### Maintainability
- Clear separation of concerns
- Logical folder structure
- Consistent naming conventions
- Centralized asset management

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS + custom CSS
- **Animations**: AOS (Animate On Scroll)
- **Typography**: Google Fonts (Sora)
- **Hosting**: GitHub Pages compatible

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement approach