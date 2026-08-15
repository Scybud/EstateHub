import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/ui.js";
import { handleFormSteps } from "./components/form.js";
import { attachSignoutEvents } from "./auth/login.js";
import { toggleSidebar } from "./components/sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
    const addProperty = document.querySelectorAll(".add-property");
    addProperty.forEach((btn) => {
        btn.addEventListener("click", async() => {
            await loadComponent(
              "../components/modals/create/add-property",
              "modalContainer",
            );

            await handleFormSteps();
        })
    })

    document.querySelector(".menu-icon")?.addEventListener("click", () => {
      toggleSidebar();
    })
    attachSignoutEvents();
})