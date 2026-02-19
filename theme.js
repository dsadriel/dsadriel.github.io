(() => {
    const KEY = "theme";
    const root = document.documentElement;

    function getEffective() {
        const stored = localStorage.getItem(KEY);
        if (stored) return stored;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function apply(theme) {
        root.setAttribute("data-theme", theme);
        const btn = document.getElementById("theme-toggle");
        if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌑";
    }

    function toggle() {
        const next = getEffective() === "dark" ? "light" : "dark";
        localStorage.setItem(KEY, next);
        apply(next);
    }

    // Apply immediately to avoid flash
    apply(getEffective());

    // Re-apply once DOM is ready (updates button label)
    document.addEventListener("DOMContentLoaded", () => {
        apply(getEffective());
        const btn = document.getElementById("theme-toggle");
        if (btn) btn.addEventListener("click", toggle);
    });

    // Follow system changes unless user has made a manual choice
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (!localStorage.getItem(KEY)) apply(getEffective());
    });
})();
