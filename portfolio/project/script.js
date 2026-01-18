async function getProjectInformation() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get("name");
    if (!projectName) {
        throw new Error("Project name not provided");
    }
    const response = await fetch('../projects.json');
    const projects = await response.json();
    const project = projects.find(p => p.name.toLowerCase() === projectName.toLocaleLowerCase());
    
    if (!project) {
        throw new Error("Project not found");
    }

    return project;
}

function getHtmlForLink(link) {
    if (link.type) {
    return `<a href="${link.url}"><img src="assets/images/${link.type}.svg"></a>` ; 
    } else if (link.title) {
    return `<a href="${link.url}">${link.title}</a>`  ;
    } else {
        return "";
    }
}

async function populatePageWithProjectDetails(){
    const project = await getProjectInformation();

    document.querySelector('title').innerHTML = project.name + " | Adriel's Portfolio";
    document.querySelector('#name').innerText = project.name;
    document.querySelector('#headline').innerText = project.headline;
    document.querySelector('#description').innerText = project.description;

    if (project.icon.length > 0) 
        document.querySelector('#icon').src = project.icon;

    document.querySelector('#images').innerHTML = project.images.map(url => 
        `<img src='${url}'>`
    ).join("")

    document.querySelector('#links').innerHTML = project.links.map(link => 
        getHtmlForLink(link)
    ).join("")
}

populatePageWithProjectDetails().catch((error) => {
    alert(error);
});
