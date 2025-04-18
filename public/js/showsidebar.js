function showSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.style.display = sidebar.style.display === 'flex' ? 'none' : 'flex';
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.style.display = 'none';
}