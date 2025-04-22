// generate-icon.js
const svgToIco = require('svg-to-ico');
const fs = require('fs');
const path = require('path');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Path to the SVG file
const svgPath = path.join(__dirname, 'public', 'todo-icon.svg');

// Write the SVG content to a file
const svgContent = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="#1a73e8" />
  
  <!-- Notepad Base -->
  <rect x="106" y="76" width="300" height="360" rx="20" fill="white" />
  
  <!-- Lines -->
  <line x1="146" y1="176" x2="366" y2="176" stroke="#e0e0e0" stroke-width="4" />
  <line x1="146" y1="226" x2="366" y2="226" stroke="#e0e0e0" stroke-width="4" />
  <line x1="146" y1="276" x2="366" y2="276" stroke="#e0e0e0" stroke-width="4" />
  <line x1="146" y1="326" x2="366" y2="326" stroke="#e0e0e0" stroke-width="4" />
  <line x1="146" y1="376" x2="366" y2="376" stroke="#e0e0e0" stroke-width="4" />
  
  <!-- Completed Task 1 -->
  <circle cx="166" cy="176" r="15" fill="#4caf50" />
  <path d="M158 176 L166 184 L174 168" stroke="white" stroke-width="3" fill="none" />
  <line x1="196" y1="176" x2="286" y2="176" stroke="#4caf50" stroke-width="4" />
  
  <!-- Task 2 -->
  <circle cx="166" cy="226" r="15" fill="#1a73e8" />
  
  <!-- Checkmark in Progress -->
  <path d="M166 226 m-6 0 l4 4 l8 -8" stroke="white" stroke-width="3" fill="none" />
  
  <!-- Task 3 -->
  <circle cx="166" cy="276" r="15" stroke="#e0e0e0" stroke-width="3" fill="white" />
  
  <!-- Notepad Top with Binding -->
  <path d="M106 96 Q106 76 126 76 L386 76 Q406 76 406 96 L406 116 L106 116 Z" fill="#ff5252" />
  
  <!-- Binding Holes -->
  <circle cx="156" cy="96" r="8" fill="white" />
  <circle cx="256" cy="96" r="8" fill="white" />
  <circle cx="356" cy="96" r="8" fill="white" />
</svg>`;

fs.writeFileSync(svgPath, svgContent);

// Generate ICO file
svgToIco(svgPath, path.join(__dirname, 'public', 'icon.ico'), {
  sizes: [16, 24, 32, 48, 64, 128, 256]
})
.then(() => {
  console.log('Icon generated successfully!');
  
  // Generate PNG for Linux
  // Note: You would need to add a PNG generation library like sharp
  // npm install sharp
  // const sharp = require('sharp');
  // sharp(svgPath).resize(256, 256).toFile(path.join(__dirname, 'public', 'icon.png'));
})
.catch(err => {
  console.error('Error generating icon:', err);
});