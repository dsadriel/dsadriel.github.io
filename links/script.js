const linksList = document.getElementById('links-list');

function renderMessage(className, text) {
  linksList.innerHTML = `<p class="${className}">${text}</p>`;
}

function makeSafeUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  } catch (_) {}

  return null;
}

function createLinkCard(link) {
  const safeUrl = makeSafeUrl(link.url);
  if (!safeUrl || !link.title) return null;

  const card = document.createElement('a');
  card.className = 'link-card';
  card.href = safeUrl;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  const hasBanner = typeof link.banner === 'string' && link.banner.length > 0;
  const hasIcon = typeof link.icon === 'string' && link.icon.length > 0;
  const hasDescription = typeof link.description === 'string' && link.description.length > 0;

  if (hasBanner) {
    const banner = document.createElement('img');
    banner.className = 'link-banner';
    banner.src = link.banner;
    banner.alt = `${link.title} banner`;
    card.appendChild(banner);
  }

  const row = document.createElement('div');
  row.className = 'link-row';

  if (hasIcon) {
    const icon = document.createElement('img');
    icon.className = 'link-icon';
    icon.src = link.icon;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    row.appendChild(icon);
  }

  const copy = document.createElement('div');
  copy.className = 'link-copy';

  const title = document.createElement('p');
  title.className = 'link-title';
  title.textContent = link.title;
  copy.appendChild(title);

  if (hasDescription) {
    const description = document.createElement('p');
    description.className = 'link-description';
    description.textContent = link.description;
    copy.appendChild(description);
  }

  row.appendChild(copy);
  card.appendChild(row);

  return card;
}

async function loadLinks() {
  try {
    const response = await fetch('links.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load links.json');

    const links = await response.json();
    if (!Array.isArray(links) || links.length === 0) {
      renderMessage('empty', 'No links available yet.');
      return;
    }

    linksList.innerHTML = '';

    links.forEach((link) => {
      const card = createLinkCard(link);
      if (card) linksList.appendChild(card);
    });

    if (!linksList.children.length) renderMessage('empty', 'No valid links found in links.json.');
  } catch (error) {
    renderMessage('error', 'Could not load links right now.');
  }
}

loadLinks();
