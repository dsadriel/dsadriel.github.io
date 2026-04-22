const translations = {
    en: {
        "nav.work": "work",
        "nav.about": "about",
        "nav.contact": "contact",
        "hero.eyebrow": "Software Engineer",
        "hero.title": "Adriel",
        "hero.desc": "Based in Porto Alegre and studying Computer Science at UFRGS, I specialize in crafting native iOS apps and full-stack platforms that solve problems with elegant, human-first solutions.",
        "hero.connect": "Let's Connect",
        "hero.github": "GitHub",
        "work.label": "my work",
        "work.caption": "A collection of projects ranging from native iOS development to full-stack platforms and academic research.",
        "work.featured": "featured",
        "work.all": "all",
        "work.mobile": "mobile apps",
        "work.uni": "uni projects",
        "work.other": "other",
        "work.empty": "no work for this category so far.",
        "work.viewAll": "View all projects",
        "work.useFilters": "or use the filters above",
        "skills.label": "skills",
        "edu.label": "education",
        "exp.label": "experience",
        "exp.download": "Download CV",
        "nav.back": "back",
        "project.gallery": "Gallery",
        "project.about": "About the project",
        "project.links": "Links",
        "project.tech": "Technologies",
        "project.roles": "My Roles",
        "project.team": "The Team",
        "contact.headline": "Let’s build something<br><span>people love to use.</span>",
        "contact.sub": "Because at the end of the day, software is about making someone’s life a little easier and more enjoyable.",
        "contact.email": "Send me an email",
        "footer.address": "Porto Alegre, Brazil"
    },
    pt: {
        "nav.work": "projetos",
        "nav.about": "sobre",
        "nav.contact": "contato",
        "hero.eyebrow": "Engenheiro de Software",
        "hero.title": "Adriel",
        "hero.desc": "Residente em Porto Alegre e estudante de Ciência da Computação na UFRGS, sou especializado na criação de aplicativos nativos para iOS e plataformas full-stack que resolvem problemas com soluções elegantes e centradas no usuário.",
        "hero.connect": "Vamos conversar",
        "hero.github": "GitHub",
        "work.label": "meu trabalho",
        "work.caption": "Uma coleção de projetos que abrangem desde o desenvolvimento iOS nativo até plataformas full-stack e pesquisa acadêmica.",
        "work.featured": "em destaque",
        "work.all": "todos",
        "work.mobile": "apps mobile",
        "work.uni": "projetos acadêmicos",
        "work.other": "outros",
        "work.empty": "nenhum projeto nesta categoria por enquanto.",
        "work.viewAll": "Ver todos os projetos",
        "work.useFilters": "ou use os filtros acima",
        "skills.label": "habilidades",
        "edu.label": "formação",
        "exp.label": "experiência",
        "exp.download": "Baixar CV",
        "nav.back": "voltar",
        "project.gallery": "Galeria",
        "project.about": "Sobre o projeto",
        "project.links": "Links",
        "project.tech": "Tecnologias",
        "project.roles": "Minhas Funções",
        "project.team": "A Equipe",
        "contact.headline": "Vamos construir algo que<br><span>as pessoas amem usar.</span>",
        "contact.sub": "Porque, no fim das contas, software é sobre tornar a vida de alguém um pouco mais fácil e agradável.",
        "contact.email": "Me envie um e-mail",
        "footer.address": "Porto Alegre, Brasil"
    }
};

let currentLang = localStorage.getItem('lang') || 'en';
let isTransitioning = false;

// Create swipe overlay
const swipeOverlay = document.createElement('div');
swipeOverlay.className = 'lang-swipe';
document.body.appendChild(swipeOverlay);

function triggerFullSwipe(callback) {
    if (isTransitioning) return;
    isTransitioning = true;

    swipeOverlay.classList.remove('active-full', 'active-to-center', 'active-from-center');
    void swipeOverlay.offsetWidth;
    swipeOverlay.classList.add('active-full');

    setTimeout(() => {
        if (callback) callback();
    }, 400);

    setTimeout(() => {
        isTransitioning = false;
    }, 800);
}

function triggerSwipeToCenter(callback) {
    if (isTransitioning) return;
    isTransitioning = true;

    // Signal next page to animate in
    sessionStorage.setItem('playEntryAnimation', 'true');

    swipeOverlay.classList.remove('active-full', 'active-to-center', 'active-from-center');
    void swipeOverlay.offsetWidth;
    swipeOverlay.classList.add('active-to-center');

    setTimeout(() => {
        if (callback) callback();
    }, 400);
}

function triggerSwipeFromCenter() {
    if (sessionStorage.getItem('playEntryAnimation') !== 'true') {
        return;
    }
    sessionStorage.removeItem('playEntryAnimation');

    // Set initial state to covered
    swipeOverlay.style.left = '0';
    
    // Wait a tiny bit for page to be ready
    setTimeout(() => {
        swipeOverlay.classList.remove('active-full', 'active-to-center', 'active-from-center');
        void swipeOverlay.offsetWidth;
        swipeOverlay.style.left = ''; // Clear manual override
        swipeOverlay.classList.add('active-from-center');
        
        setTimeout(() => {
            isTransitioning = false;
        }, 400);
    }, 100);
}

function toggleLanguage() {
    triggerFullSwipe(() => {
        currentLang = currentLang === 'en' ? 'pt' : 'en';
        localStorage.setItem('lang', currentLang);
        updateLanguage();
    });
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            const icon = el.querySelector('img');
            if (icon) {
                // Preserve the icon and update text
                el.innerHTML = '';
                el.appendChild(icon);
                el.appendChild(document.createTextNode(' ' + translations[currentLang][key]));
            } else {
                el.innerHTML = translations[currentLang][key];
            }
        }
    });

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.textContent = currentLang === 'en' ? 'EN' : 'PT-BR';
    }

    // Update dynamic content if needed
    if (typeof renderResume === 'function') {
        renderResume();
    }
    if (typeof populatePage === 'function') {
        populatePage();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggleLanguage);
    updateLanguage();
    
    // Smooth entry animation
    triggerSwipeFromCenter();
});
