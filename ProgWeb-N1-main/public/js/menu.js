document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.menu-toggle').addEventListener('click', () => {
    const dropdown = document.querySelector('.menu-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
});
