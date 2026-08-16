import { handleBackBtn } from "https://scybud.github.io/scybud-ui/js/ui.js";
import {markLinkActive} from "./sidebar.js";

const navBar = document.getElementById("nav-bar");

const loadPageNavs = () => {
  if (!navBar) return;

  const anchors = [
    { text: "Dashboard", href: "dashboard" },
    { text: "Clients", href: "clients" },
        { text: "Assets", href: "assets" },
    { text: "Organisations", href: "orgs" },
  ];

  anchors.forEach((link) => {
    const a = document.createElement("a");
    a.classList.add("anchor-nav-bar");
    a.textContent = link.text;
    a.href = link.href;

    navBar.appendChild(a);
  });
};
loadPageNavs();
markLinkActive();

handleBackBtn();