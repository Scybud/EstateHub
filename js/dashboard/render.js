/**
 * Builds and injects real estate cards cleanly inside your layout grid target container
 * @param {Array} propertiesArray - Collection array matching properties row schemas
 * @param {Function} onDeleteClick - Action callback forwarding the unique instance target UUID
 */
      import { loadComponent, createEmptyState } from "https://scybud.github.io/scybud-ui/js/ui.js";
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
  const detailsCard = document.getElementById("container");
  if (!detailsCard) return;

  detailsCard.innerHTML = "";

  if (propertiesArray.length === 0) {
    await createEmptyState({
      container: detailsCard,
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

  //Create ONE single grid container OUTSIDE the loop
  const twoColumnGrid = document.createElement("div");
  twoColumnGrid.classList.add("two-column-grid");

  propertiesArray.forEach((property) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "property-card");

    let statusBadgeClass = "for-sale";
    if (property.status?.toLowerCase() === "rented")
      statusBadgeClass = "rented";
    if (property.status?.toLowerCase() === "leased")
      statusBadgeClass = "leased";

    const totalUnitsCount = Array.isArray(property.internal_units_json)
      ? property.internal_units_json.length
      : 0;

    const beds = property.bedrooms ?? 0;
    const baths = property.bathrooms ?? 0;
    const size = property.floor_space_sqm
      ? `${property.floor_space_sqm} sqm`
      : "N/A";

    cardDiv.innerHTML = `
      <h3>${escapeHTML(property.owner_name) || "Client Asset"}</h3>
      <p><b>Title:</b> ${escapeHTML(property.title) || "Untitled Asset"}</p>
      <p><b>Property Type:</b> ${escapeHTML(property.property_type) || "Unspecified"}</p>
      <p>
          <b>Property Status:</b> 
          <span class="status-badge ${statusBadgeClass}">${escapeHTML(property.status) || "available"}</span>
      </p>
      <p><b>Specs:</b> 🛏️ ${beds} Beds | 🛁 ${baths} Baths | 📐 ${size}</p>
      <p>
          <b>Managed Capacity:</b> 
          <span class="unit-counter-badge">${totalUnitsCount} Units</span>
      </p>
      <p><b>Rent Valuation:</b> ₦${Number(property.list_price || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
      <div class="card-actions">
          <button type="button" class="action-view-btn btn view-btn">👀 View</button>
          <button type="button" class="danger btn delete-btn">🗑 Remove</button>
      </div>
    `;

    cardDiv.querySelector(".view-btn").addEventListener("click", () => {
      localStorage.setItem("viewPropertyId", property.id);
      window.location.href = "property";
    });

    cardDiv.querySelector(".delete-btn").addEventListener("click", () => {
      onDeleteClick(property.id);
    });

    // Append each individual card into the single parent grid container
    twoColumnGrid.appendChild(cardDiv);
  });

  // Prepend the fully populated grid layout container into the main DOM target
  detailsCard.prepend(twoColumnGrid);
}
