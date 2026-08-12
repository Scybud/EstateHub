import { loadComponent } from "https://scybud.github.io/scybud-ui/js/ui.js";

export async function toastMsg(message, typeClass) {
  // Load modal only when needed
  await loadComponent(
    "/components/modals/toast",
    "toast",
  );

  const msg = document.querySelector(".modalMessage");
  const toast = document.getElementById("toast");

  toast.classList.remove("success", "error", "warning", "info");

  toast.classList.add(typeClass);

  toast.classList.remove("slideIn");
  void toast.offsetWidth; // <-- reflow trick
  toast.classList.add("slideIn");

  msg.textContent = message;

  if (toast._timeout) {
    clearTimeout(toast._timeout);
  }

  // Set new timeout
  toast._timeout = setTimeout(() => {
    toast.classList.remove("slideIn");
  }, 5000);
}
