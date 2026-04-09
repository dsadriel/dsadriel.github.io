const fs = require('fs');

// Read the projects data
const rawData = fs.readFileSync('portfolio/projects.json');
const projects = JSON.parse(rawData).slice(0, 4); // Get first 4 projects

// Utility to escape XML characters and strip HTML
function cleanText(text) {
  return text.replace(/<[^>]*>?/gm, '') // Strip HTML tags like <br>
             .replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
}

// Utility to wrap text into maximum 3 lines of ~40 characters
function wrapText(text, maxChars) {
  const words = cleanText(text).split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  if (currentLine) lines.push(currentLine.trim());
  return lines.slice(0, 3); // Return max 3 lines
}

// Grid coordinates for 2 rows, 2 columns
const positions = [
  { x: 0, y: 0 },
  { x: 352, y: 0 },
  { x: 0, y: 170 },
  { x: 352, y: 170 }
];

let cardsSvg = '';

projects.forEach((proj, index) => {
  const pos = positions[index];
  const title = cleanText(proj.name);
  const tag = cleanText(proj.type === 'mobile-apps' ? 'iOS / Mobile' : 'Project');
  
  // Create up to 3 lines of description from the English text
  const descLines = wrapText(proj.description.en, 43);
  let descSvg = '';
  descLines.forEach((line, i) => {
     descSvg += `<text x="0" y="${56 + (i * 22)}" class="project-desc">${line}${i === 2 && descLines.length === 3 ? '...' : ''}</text>\n`;
  });

  cardsSvg += `
    <g transform="translate(${pos.x}, ${pos.y})">
      <rect x="0" y="0" width="320" height="150" rx="4" class="surface border" />
      <g transform="translate(24, 32)">
        <text x="0" y="0" class="tag">${tag}</text>
        <text x="0" y="28" class="project-title">${title}</text>
        ${descSvg}
      </g>
      <path d="M280 24 L292 24 L292 36 M292 24 L280 36" fill="none" stroke="#5A9BF5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  `;
});

// Full SVG Template with 510px height to fit 2 rows
const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 510" width="100%" height="100%">
  <defs>
    <style>
      /* <![CDATA[ */
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      .bg { fill: #121212; }
      .surface { fill: #1A1A1A; }
      .border { stroke: #242424; stroke-width: 1; }
      .section-title { font-family: 'Syne', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 800; font-size: 32px; fill: #FFFFFF; letter-spacing: -1px; }
      .accent { fill: #5A9BF5; }
      .project-title { font-family: 'Syne', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; font-size: 20px; fill: #FFFFFF; }
      .project-desc { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; fill: rgba(255, 255, 255, 0.75); }
      .tag { font-family: 'Syne', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 800; font-size: 10px; fill: #5A9BF5; letter-spacing: 0.08em; text-transform: uppercase; }
      /* ]]> */
    </style>
  </defs>
  <rect width="100%" height="100%" class="bg" />
  <line x1="0" y1="24" x2="800" y2="24" class="border" />
  <line x1="0" y1="486" x2="800" y2="486" class="border" />
  <g transform="translate(64, 80)">
    <text x="0" y="0" class="section-title">latest work</text>
  </g>
  <g transform="translate(64, 120)">
    ${cardsSvg}
  </g>
</svg>`;

// Write the file
fs.writeFileSync('latest-projects.svg', svgTemplate);
console.log('Successfully generated latest-projects.svg');