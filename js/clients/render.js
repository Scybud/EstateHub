import {
  loadComponent,
  createEmptyState,
} from "https://ui.scybud.com/js/ui.js";
import {
  handlePersonalClientSubmit,
  handleOrgClientSubmit,
} from "../create/add-client.js";

export async function renderClientsCards(
  clientsData,
  onDeleteCallback,
  userId,
  onAddedCallback,
  orgId = null,
) {
  const container = document.getElementById("container");
  if (!container) return;

  container.innerHTML = "";

  if (!clientsData || clientsData.length === 0) {
    await createEmptyState({
      container: container,
      icon: "💼",
      title: "Nothing here yet",
      description: orgId
        ? "No clients found for this organization."
        : "No clients found.",
      actionText: "Add Client",
      onAction: async () => {
        await loadComponent(
          "../components/modals/create/add-client",
          "modalContainer",
        );
        if (orgId) {
          await handleOrgClientSubmit(userId, orgId, onAddedCallback);
        } else {
          await handlePersonalClientSubmit(userId, onAddedCallback);
        }
      },
    });
    return;
  }

  const twoColumnGrid = document.createElement("div");
  twoColumnGrid.classList.add("two-column-grid");

  clientsData.forEach((client) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    cardDiv.innerHTML = `
      <h3>${client.name || "Unknown Client"}</h3>
      <p><b>Email:</b> <a href="mailto:${client.email}">${client.email || "N/A"}</a></p>
      <p><b>Phone:</b> ${client.phone || "N/A"}</p>
      <div style="margin-top: 15px; display: flex; gap: 8px;">
          <a href="client?client=${client.id}" class="btn view-btn">👀 View</a>
          <button type="button" class="danger btn delete-btn" style="background: #ff4444; color: white;">🗑 Delete</button>
      </div>
    `;

    cardDiv.querySelector(".delete-btn").addEventListener("click", () => {
      onDeleteCallback(client.id);
    });

    twoColumnGrid.appendChild(cardDiv);
  });

  container.appendChild(twoColumnGrid);
}
