import { fetchClientById } from "../data/clientsDb.js";
import {
  fetchPropertiesByClientId,
  removePropertyFromDb,
} from "../data/propertiesDb.js";
import { renderPropertyCards } from "../dashboard/render.js";
import { escapeHTML } from "../utils/escapeHTML.js";
import { loadComponent } from "https://scybud.github.io/scybud-ui/js/ui.js";
import { handleFormSteps } from "../create/add-property.js";

document.addEventListener("DOMContentLoaded", async () => {
  const detailsDiv = document.getElementById("clientDetails");
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("c");

  if (!clientId) {
    detailsDiv.innerHTML = `<p style="text-align:center; color:#ef4444;">No client selected. Please return to your client list.</p>`;
    return;
  }

  try {
    const client = await fetchClientById(clientId);

    detailsDiv.innerHTML = `
      <h3>${escapeHTML(client.name || "Unknown Client")}</h3>
      <p><strong>Email:</strong> <a href="mailto:${escapeHTML(client.email)}">${escapeHTML(client.email) || "N/A"}</a></p>
      <p><strong>Phone:</strong> ${escapeHTML(client.phone) || "N/A"}</p>
    `;

    await loadClientProperties(clientId);

    const addPropertyBtn = document.querySelector(".add-property");
    if (addPropertyBtn) {
      addPropertyBtn.addEventListener("click", async () => {
        await loadComponent(
          "../components/modals/create/add-property",
          "modalContainer",
        );
        await handleFormSteps(null, clientId);
      });
    }
  } catch (err) {
    console.error("Failed to load client profile:", err.message);
    detailsDiv.innerHTML = `<p style="text-align:center; color:#ef4444;">Error fetching client: ${escapeHTML(err.message)}</p>`;
  }
});

async function loadClientProperties(clientId) {
  const properties = await fetchPropertiesByClientId(clientId);
  renderPropertyCards(
    properties,
    async (id) => {
      if (confirm("Are you sure you want to delete this asset row?")) {
        await removePropertyFromDb(id);
        await loadClientProperties(clientId);
      }
    },
    null,
    clientId,
  );
}
