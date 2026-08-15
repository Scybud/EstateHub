//For side bar display
const sidebar = document.querySelector(".sidebar");
export function toggleSidebar() {
  if(!sidebar) return;
  sidebar.classList.toggle("show");
}

//to move between pages if using select element
function goToLink(selectElement) {
  const selectedValue = selectElement.value;
  if (selectedValue) {
    window.location.href = selectedValue;
  }
}

// Link glows slightly when active
export function markLinkActive() {

  const links = document.querySelectorAll(".sidebar a");
  const currentPath = window.location.pathname;
  

  links.forEach((link) => {
  const linkPath = new URL(link.href).pathname;

  if(!linkPath) return;
  if (currentPath === linkPath) {
    link.classList.add("active");
  }
});
}


const dotContainer = document.querySelector(".dot-container");

const span = document.createElement("span");

for(let i = 0; i < 3; i++) {
  const copy = span.cloneNode("true");
  
  dotContainer.appendChild(copy);
}

   window.addEventListener("load", () => {
     dotContainer.remove()
   });