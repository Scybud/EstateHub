/**
 * Builds and injects real estate cards cleanly inside your layout grid target container
 * @param {Array} clientsArray - Collection array matching properties row schemas
 * @param {Function} onDeleteClick - Action callback forwarding the unique instance target UUID
 */

      import { loadComponent, createEmptyState } from "https://scybud.github.io/scybud-ui/js/ui.js";
import { handlePersonalClientSubmit } from "../create/add-client.js";
import { initClients } from "./clients.js";


export async function renderClientsCards(clientsData, onDeleteCallback, userId) {
  const container = document.getElementById("container");
  if (!container) return;

  // Use your standard empty state UI pattern if no records exist
  if (!clientsData || clientsData.length === 0) {
    await createEmptyState({
      container: container,
      icon: "💼",
      title: "Nothing here yet",
      description: "No corporate clients found for this organization.",
      actionText: "Add Client",
      onAction: async () => {
        await loadComponent(
          "../components/modals/create/add-client",
          "modalContainer",
        );
        await handlePersonalClientSubmit(userId, async () => {
         await initClients();
        });
      },
    });
    return;
  }

  //Consistent structure using ONE single grid container OUTSIDE the loop
  const twoColumnGrid = document.createElement("div");
  twoColumnGrid.classList.add("two-column-grid");

  clientsData.forEach((client) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card"); // Fixed to match your standard CSS module styling

    cardDiv.innerHTML = `
  <h3>${client.name || "Unknown Client"}</h3>
  <p><b>Email:</b> <a href="mailto:${client.email}">${client.email || "N/A"}</a></p>
  <p><b>Phone:</b> ${client.phone || "N/A"}</p>
  <div style="margin-top: 15px; display: flex; gap: 8px;">
      <a href="client?c=${client.id}" type="button" class="btn view-btn">View</a>
      <button type="button" class="danger btn delete-btn" style="background: #ff4444; color: white;">🗑 Delete</button>
  </div>
`;


    cardDiv.querySelector(".delete-btn").addEventListener("click", () => {
      onDeleteCallback(client.id);
    });
    
    cardDiv.querySelector(".delete-btn").addEventListener("click", () => {
      onDeleteCallback(client.id);
    });

    // Append each individual client card into the parent layout grid
    twoColumnGrid.appendChild(cardDiv);
  });

  //  Appends the fully populated layout target node safely without overwriting headers
  container.appendChild(twoColumnGrid);
}