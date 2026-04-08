const translations = {
    en: {
        "nav.work": "work",
        "nav.about": "about",
        "nav.contact": "contact",
        "hero.eyebrow": "Software Engineer",
        "hero.desc": "Developer based in Porto Alegre, studying Computer Science at UFRGS. I build apps and tools aiming to make life simpler and more enjoyable — from native iOS apps to full-stack platforms.",
        "hero.work": "View my work",
        "work.label": "my work",
        "work.all": "all projects",
        "work.mobile": "mobile apps",
        "work.uni": "uni projects",
        "work.other": "others",
        "work.empty": "no work for this category so far.",
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
        "contact.headline": "Let's build something<br><span>great together.</span>",
        "contact.sub": "Open to freelance projects, job opportunities, or just a good conversation about software.",
        "contact.email": "Send me an email",
        "footer.address": "Porto Alegre, Brazil"
    },
    pt: {
        "nav.work": "projetos",
        "nav.about": "sobre",
        "nav.contact": "contato",
        "hero.eyebrow": "Engenheiro de Software",
        "hero.desc": "Desenvolvedor de Porto Alegre, estudando Ciência da Computação na UFRGS. Crio aplicativos e ferramentas com o objetivo de tornar a vida mais simples e agradável — de apps iOS nativos a plataformas full-stack.",
        "hero.work": "Ver meus projetos",
        "work.label": "meu trabalho",
        "work.all": "todos",
        "work.mobile": "apps mobile",
        "work.uni": "projetos acadêmicos",
        "work.other": "outros",
        "work.empty": "nenhum projeto nesta categoria por enquanto.",
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
        "contact.headline": "Vamos construir algo<br><span>incrível juntos.</span>",
        "contact.sub": "Aberto a projetos freelance, oportunidades de trabalho ou apenas uma boa conversa sobre software.",
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
        langToggle.textContent = currentLang === 'en' ? 'PT-BR' : 'EN';
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
