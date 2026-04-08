async function getProjectInformation() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get("name");
    if (!projectName) throw new Error("Project name not provided");
    const project = await fetchProjectByName(projectName);
    if (!project) throw new Error("Project not found: " + projectName);
    return project;
}

function linkButton(link) {
    const label = link.title || capitalize(link.type || "Link");
    const iconPath = link.type ? `../assets/images/${link.type}.svg` : null;
    
    return `<a class="link-btn" href="${link.url}" target="_blank" rel="noopener">
        ${iconPath ? `<img src="${iconPath}" alt="${link.type}" onerror="this.style.display='none'">` : ""}
        <span>${label}</span>
    </a>`;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeUrl(url) {
    try {
        const parsed = new URL(url);
        return (parsed.protocol === "https:" || parsed.protocol === "http:") ? url : null;
    } catch { return null; }
}

function showBlock(id) { document.getElementById(id).style.display = "block"; }

async function populatePage() {
    const project = await getProjectInformation();

    document.title = `${project.name} — Adriel`;
    document.getElementById("project-name").textContent = project.name;
    document.getElementById("project-headline").textContent = project.headline;
    document.getElementById("project-description").innerHTML = project.description;

    if (project.icon) {
        document.getElementById("project-icon").src = project.icon;
        document.getElementById("project-icon").alt = project.name;
    }

    // Roles
    if (project.roles && project.roles.length > 0) {
        document.getElementById("project-roles").innerHTML = project.roles
            .map(r => `<span class="detail-tag">${r}</span>`).join("");
        showBlock("roles-block");
    }

    // Tech stack
    if (project.techStack && project.techStack.length > 0) {
        document.getElementById("project-tech").innerHTML = project.techStack
            .map(t => `<span class="detail-tag">${t}</span>`).join("");
        showBlock("tech-block");
    }

    // Media gallery
    const hasImages = project.images && project.images.length > 0;
    const hasVideos = project.videos && project.videos.length > 0;

    if (hasImages || hasVideos) {
        const scrollContainer = document.getElementById("media-scroll");
        let mediaHtml = "";
        
        if (hasVideos) {
            mediaHtml += project.videos.map(url => `
                <video src="${url}" controls autoplay loop muted draggable="false"></video>
            `).join("");
        }

        if (hasImages) {
            mediaHtml += project.images.map(url => `
                <img src="${url}" alt="Screenshot" draggable="false">
            `).join("");
        }

        scrollContainer.innerHTML = mediaHtml;
        showBlock("media-gallery");

        // Drag to scroll
        let isDown = false, startX, scrollLeft;
        scrollContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
        });
        window.addEventListener('mouseup', () => isDown = false);
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            scrollContainer.scrollLeft = scrollLeft - walk;
        });
    }

    // Team
    if (project.team && project.team.length > 0) {
        const teamWithAdriel = [...project.team];
        // Only add Adriel if not already there (though usually he's the one adding himself)
        if (!teamWithAdriel.find(m => m.name.includes("Adriel"))) {
            teamWithAdriel.unshift({ name: "Adriel de Souza", role: project.roles.join(", ")});
        }

        document.getElementById("team-grid").innerHTML = teamWithAdriel.map(member => {
            const linkedinUrl = member.linkedin ? safeUrl(member.linkedin) : null;
            const arrowIcon = `<img src="../assets/images/arrow.svg" class="member-link-icon" style="filter: invert(1); opacity: 0.5;">`;
            
            const content = `
                <span class="member-name">${escapeHtml(member.name)}${linkedinUrl ? arrowIcon : ""}</span>
                <span class="member-role">${escapeHtml(member.role)}</span>
            `;

            return linkedinUrl 
                ? `<a class="team-member" href="${linkedinUrl}" target="_blank" rel="noopener">${content}</a>`
                : `<div class="team-member">${content}</div>`;
        }).join("");
        showBlock("team-section");
    }

    // Links
    if (project.links && project.links.length > 0) {
        document.getElementById("project-links").innerHTML = project.links
            .map(linkButton).join("");
        showBlock("links-block");
    }
}

populatePage().catch(err => {
    document.getElementById("project-name").textContent = "Project not found";
    document.getElementById("project-headline").textContent = err.message;
});
