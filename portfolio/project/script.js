async function getProjectInformation() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get("name");
    if (!projectName) throw new Error("Project name not provided");
    const project = await fetchProjectByName(projectName);
    if (!project) throw new Error("Project not found: " + projectName);
    return project;
}

function linkButton(link) {
    if (link.type) {
        return `<a class="link-btn" href="${link.url}" target="_blank" rel="noopener">
            <img src="../assets/images/${link.type}.svg" alt="${link.type}">
            ${capitalize(link.type)}
        </a>`;
    }
    if (link.title) {
        return `<a class="link-btn" href="${link.url}" target="_blank" rel="noopener">${link.title}</a>`;
    }
    return "";
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

function showBlock(id) { document.getElementById(id).style.display = ""; }

async function populatePage() {
    const project = await getProjectInformation();

    document.title = project.name + " • Adriel's Portfolio";
    document.getElementById("name").textContent = project.name;
    document.getElementById("headline").textContent = project.headline;
    document.getElementById("description").textContent = project.description;

    if (project.date) {
        document.getElementById("date").textContent = project.date;
    }

    if (project.icon) {
        document.getElementById("icon").src = project.icon;
    }

    // Roles
    if (project.roles && project.roles.length > 0) {
        document.getElementById("roles").innerHTML = project.roles
            .map(r => `<span class="tag tag-accent">${r}</span>`).join("");
        showBlock("roles-block");
    }

    // Tech stack
    if (project.techStack && project.techStack.length > 0) {
        document.getElementById("tech").innerHTML = project.techStack
            .map(t => `<span class="tag">${t}</span>`).join("");
        showBlock("tech-block");
    }

    // Show meta row if either column has content
    if ((project.roles && project.roles.length > 0) || (project.techStack && project.techStack.length > 0)) {
        showBlock("meta-block");
    }

    // Screenshots with horizontal drag scroll and click-to-preview modal
    if (project.images && project.images.length > 0) {
        const imagesBlock = document.getElementById("images-block");
        const imagesContainer = document.getElementById("images");
        imagesContainer.innerHTML = project.images
            .map(url => `<img src="${url}" alt="Screenshot" draggable="false">`).join("");

        // Mouse drag to scroll
        let isDown = false, startX, scrollLeft, didDrag = false;
        imagesContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            didDrag = false;
            imagesContainer.classList.add('dragging');
            startX = e.pageX - imagesContainer.offsetLeft;
            scrollLeft = imagesContainer.scrollLeft;
        });

        document.body.addEventListener('mouseup', () => {
            isDown = false;
            imagesContainer.classList.remove('dragging');
        });

        document.body.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - imagesContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            if (Math.abs(walk) > 4) didDrag = true;
            imagesContainer.scrollLeft = scrollLeft - walk;
        });

        // Image preview modal
        initImageModal(imagesContainer, project.images, () => didDrag);

        showBlock("images-block");
    }

    // Team
    if (project.team && project.team.length > 0) {
        project.team.unshift({ name: "Adriel de Souza", role: project.roles.join(", ")});

        project.team = project.team.sort((a, b) => a.name.localeCompare(b.name));

        document.getElementById("team").innerHTML = project.team.map(member => {
            const inner = `<div class="team-member-info">
                <span class="team-member-name">${escapeHtml(member.name)}</span>
                <span class="team-member-role">${escapeHtml(member.role)}</span>
            </div>`;
            const linkedinUrl = member.linkedin ? safeUrl(member.linkedin) : null;
            if (linkedinUrl) {
                // Use external link arrow image
                const arrow = `<img class="external-arrow" src="../assets/images/arrow.svg" alt="External link" style="margin-left:4px;vertical-align:middle;width:1em;height:1em;">`;
                return `<a class="team-member" href="${linkedinUrl}" target="_blank" rel="noopener">${inner}${arrow}</a>`;
            }
            return `<div class="team-member">${inner}</div>`;
        }).join("");
        showBlock("team-block");
    }

    // Links
    if (project.links && project.links.length > 0) {
        document.getElementById("links").innerHTML = project.links
            .map(linkButton).join("");
        showBlock("links-block");
    }
}

populatePage().catch(err => {
    document.getElementById("name").textContent = "Project not found";
    document.getElementById("headline").textContent = err.message;
});

