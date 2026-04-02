const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://dsadriel.github.io';

const staticPages = [
    '/',
    '/portfolio/',
    '/suporte/',
];

function getProjectPages() {
    const projectsPath = path.join(__dirname, '../../portfolio/projects.json');
    if (!fs.existsSync(projectsPath)) return [];
    
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    return projects.map(p => `/portfolio/project/?name=${encodeURIComponent(p.name)}`);
}

function getSupportPages() {
    const supportPath = path.join(__dirname, '../../suporte/appInformation.json');
    if (!fs.existsSync(supportPath)) return [];
    
    const supportInfo = JSON.parse(fs.readFileSync(supportPath, 'utf8'));
    return Object.keys(supportInfo).map(bundle => `/suporte/?bundle=${bundle}`);
}

function xmlEscape(str) {
    return str.replace(/[<>&"']/g, function (m) {
        switch (m) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return m;
        }
    });
}

function generateSitemap() {
    const allPages = [
        ...staticPages,
        ...getProjectPages(),
        ...getSupportPages(),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${xmlEscape(BASE_URL + page)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(__dirname, '../../sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
}

generateSitemap();
