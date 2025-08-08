
function showSection(section) {
  const sections = document.querySelectorAll('.collection-section');
  sections.forEach(s => s.style.display = 'none');
  document.getElementById(section).style.display = 'block';
}
