/**
 * Builds and injects real estate cards cleanly inside your layout grid target container
 * @param {Array} propertiesArray - Collection array matching properties row schemas
 * @param {Function} onDeleteClick - Action callback forwarding the unique instance target UUID
 */
import {
  loadComponent,
  createEmptyState,
} from "https://ui.scybud.com/js/ui.js";
import { handleFormSteps } from "../create/add-property.js";
import { escapeHTML } from "../utils/escapeHTML.js";

export function renderOverviewStats(propertiesArray) {
  const rentedPropertyCount = document.getElementById("rentedPropertyCount");
  const availablePropertyCount = document.getElementById(
    "availablePropertyCount",
  );

  const total = propertiesArray.length;
  const rented = propertiesArray.filter(
    (p) => p.status?.toLowerCase() === "rented",
  ).length;
  const available = total - rented;

  rentedPropertyCount.innerText = rented;
  availablePropertyCount.innerText = available;
}

export async function renderPropertyCards(
  propertiesArray,
  onDeleteClick,
  orgId,
  clientId = null,
) {
  const container = document.getElementById("container");
  if (!container) return;

  container.innerHTML = "";

  if (propertiesArray.length === 0) {
    await createEmptyState({
      container: container,
      icon: "🏠",
      title: "Nothing here yet",
      description: "You have not added a property yet.",
      actionText: "Add Property",
      onAction: async () => {
        await loadComponent(
          "../components/modals/create/add-property",
          "modalContainer",
        );
        await handleFormSteps(orgId, clientId);
      },
    });
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.classList.add("data-table-wrapper");

  const table = document.createElement("table");
  table.classList.add("data-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Property</th>
        <th>Owner</th>
        <th>Status</th>
        <th>Rent</th>
        <th>Units</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  propertiesArray.forEach((property) => {
    let statusBadgeClass = "for-sale";
    if (property.status?.toLowerCase() === "rented")
      statusBadgeClass = "rented";
    if (property.status?.toLowerCase() === "leased")
      statusBadgeClass = "leased";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Property">
        <strong>${escapeHTML(property.title) || "Untitled Asset"}</strong>
        <br />
        <span class="cell-muted">${escapeHTML(property.property_type) || "Unspecified"}</span>
      </td>
      <td data-label="Owner">${escapeHTML(property.owner_name) || "Client Asset"}</td>
      <td data-label="Status"><span class="status-badge ${statusBadgeClass}">${escapeHTML(property.status) || "available"}</span></td>
      <td data-label="Rent">₦${Number(property.list_price || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
      <td data-label="Units"><span class="unit-counter-badge">${property.units_count ?? 0} Units</span></td>
      <td class="cell-actions">
        <a href="property?property=${property.id}" class="btn btn-sm view-btn">View</a>
        <button type="button" class="danger btn btn-sm delete-btn">Remove</button>
      </td>
    `;

    row.querySelector(".delete-btn").addEventListener("click", () => {
      onDeleteClick(property.id);
    });

    tbody.appendChild(row);
  });

  wrapper.appendChild(table);
  container.appendChild(wrapper);
}
