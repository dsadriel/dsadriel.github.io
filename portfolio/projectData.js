async function fetchProjects() {
    const response = await fetch('/portfolio/projects.json');
    const projects = await response.json();
    return projects.map(project => {
        const name = project.name.toLowerCase().replace(/\s/g, '-');
        // If autoImages is present, generate icon and screenshots
        if (project.autoImages) {
            if (project.autoImages.icon) {
                project.icon = `/portfolio/assets/projects/${name}/icon.png`;
            }
            if (project.autoImages.screenshotCount > 0) {
                project.images = Array.from({ length: project.autoImages.screenshotCount }, (_, i) =>
                    `/portfolio/assets/projects/${name}/${i + 1}.png`
                );
            }
            if (project.autoImages.videoCount > 0) {
                project.videos = Array.from({ length: project.autoImages.videoCount }, (_, i) =>
                    `/portfolio/assets/projects/${name}/${i + 1}.mp4`
                );
            }
        }
        return project;
    });
}

async function fetchProjectByName(name) {
    const projects = await fetchProjects();
    return projects.find(p => p.name.toLowerCase() === name.toLowerCase());
}