function showSection(sectionId) {
    const section = document.getElementById(sectionId); // ✅ Correct spelling
    if (!section) return;

    const detailsElements = section.querySelectorAll('details');
    detailsElements.forEach(detail => detail.open = true);

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
