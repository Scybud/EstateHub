import { fetchPropertyById } from "../data/propertiesDb.js";
import { fetchUnitsByPropertyId } from "../data/unitsDb.js";
import {
  fetchTenantsByUnitId,
  fetchTenantsByPropertyId,
  removeTenantFromDb,
} from "../data/tenantsDb.js";
import { escapeHTML } from "../utils/escapeHTML.js";
import { loadComponent } from "https://scybud.github.io/scybud-ui/js/ui.js";
import { handleAddTenantSubmit } from "../create/add-tenant.js";
import { toastMsg } from "../components/toast.js";

document.addEventListener("DOMContentLoaded", async () => {
  const detailsDiv = document.getElementById("details");
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get("property");

  if (!propertyId) {
    detailsDiv.innerHTML = `<p style="text-align:center; color:#ef4444;">No target property selected. Please return to the dashboard.</p>`;
    return;
  }

  try {
    const property = await fetchPropertyById(propertyId);
    const units = await fetchUnitsByPropertyId(propertyId);

    const formattedPrice = Number(property.list_price || 0).toLocaleString(
      "en-NG",
      { minimumFractionDigits: 2 },
    );
    const expiryDate = property.rent_expiry_date
      ? escapeHTML(property.rent_expiry_date)
      : "N/A";

    let detailsHTML = `
      <h3>${escapeHTML(property.title || "Managed Asset")}</h3>
      <p><strong>Property Type:</strong> ${escapeHTML(property.property_type || "Unspecified")}</p>
      <p><strong>Address:</strong> ${escapeHTML(property.address || "No address provided")}</p>
      <p><strong>City/State:</strong> ${escapeHTML(property.city)}, ${escapeHTML(property.state)}</p>
      <p><strong>Owner/Client:</strong> ${escapeHTML(property.owner_name || "Unknown Client")}</p>
      <p><strong>Listing Status:</strong> ${escapeHTML(property.status || "available")}</p>
      <p><strong>Valuation/Rent:</strong> ₦${formattedPrice} (${escapeHTML(property.period)})</p>
      <p><strong>Lease Expiry:</strong> ${expiryDate}</p>
      <p><strong>Asset ID:</strong> <code style="color:#cbd5e1; font-family:monospace; font-size:0.8rem;">${escapeHTML(property.id)}</code></p>
      <p><strong>Internal Description / Notes:</strong><br>${escapeHTML(property.description || "No descriptions saved for this asset.")}</p>
    `;

    if (units.length > 0) {
      detailsHTML += `
        <div class="units-section">
          <h4>Units (${units.length})</h4>
          <div id="unitsList"></div>
        </div>
      `;
    } else {
      detailsHTML += `
        <div class="units-section">
          <h4>Tenants</h4>
          <div id="propertyTenantsList"></div>
          <button type="button" id="addPropertyTenantBtn" class="btn btn-sm" style="margin-top:8px;">+ Add Tenant</button>
        </div>
      `;
    }

    let lat = null;
    let lon = null;
    if (property.latitude && property.longitude) {
      lat = parseFloat(property.latitude);
      lon = parseFloat(property.longitude);
      detailsHTML += `
        <div class="map-section">
          <div class="map-header-row">
            <h4>Location Tracking</h4>
            <p style="font-size:0.85rem; color:#a0aec0; font-style:italic;">Approximate location based on address given.</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" class="btn-nav">🚗 Open in Google Maps</a>
            <button class="expand-btn" id="openMapModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="map-frame-wrapper">
            <iframe src="https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed" allowfullscreen="" loading="lazy"></iframe>
          </div>
        </div>
      `;
    } else {
      detailsHTML += `
        <div class="map-section">
          <h4>Location Tracking</h4>
          <p style="font-size:0.85rem; color:#a0aec0; font-style:italic;">No verified GPS coordinates linked to this asset profile.</p>
        </div>
      `;
    }

    detailsDiv.innerHTML = detailsHTML;

    if (units.length > 0) {
      await renderUnits(units, propertyId);
    } else {
      await renderPropertyTenants(propertyId);
      document
        .getElementById("addPropertyTenantBtn")
        .addEventListener("click", async () => {
          await loadComponent(
            "../components/modals/create/add-tenant",
            "modalContainer",
          );
          await handleAddTenantSubmit({ property_id: propertyId }, async () => {
            await renderPropertyTenants(propertyId);
          });
        });
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("#openMapModal");
      if (!btn) return;
      const modalHTML = `
        <div class="modal-container">
          <div class="map-modal-card">
            <button type="button" class="closeModalBtn" id="closeMapModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3.5" y="3.5" width="17" height="17" rx="6" ry="6" fill="currentColor" opacity="0.06" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </button>
            <div class="expanded-map-frame-wrapper">
              <iframe src="https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed" allowfullscreen="" loading="lazy"></iframe>
            </div>
          </div>
        </div>
      `;
      document.getElementById("modalContainer").innerHTML = modalHTML;
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("#closeMapModal")) {
        document.getElementById("modalContainer").innerHTML = "";
      }
    });
  } catch (err) {
    console.error("Failed to load building overview profile:", err.message);
    detailsDiv.innerHTML = `<p style="text-align:center; color:#ef4444;">Error fetching data: ${escapeHTML(err.message)}</p>`;
  }
});

async function renderUnits(units, propertyId) {
  const unitsList = document.getElementById("unitsList");
  if (!unitsList) return;

  unitsList.innerHTML = "";
  const grid = document.createElement("div");
  grid.classList.add("pill-grid");
  unitsList.appendChild(grid);

  for (const unit of units) {
    const pill = document.createElement("div");
    pill.classList.add("data-pill");

    const tenants = await fetchTenantsByUnitId(unit.id);

    const tenantsHTML = tenants.length
      ? `<div class="data-list" style="margin-top:8px;">` +
        tenants
          .map(
            (t) => `
          <div class="data-list-row">
            <div class="row-main">
              <span class="row-title">${escapeHTML(t.name)}</span>
              <span class="row-meta">${escapeHTML(t.phone)} · ₦${Number(t.rent || 0).toLocaleString("en-NG")} · ${escapeHTML(t.lease_start)} to ${escapeHTML(t.lease_end)}</span>
            </div>
            <div class="row-actions">
              <button type="button" class="danger btn btn-sm remove-tenant-btn" data-tenant-id="${t.id}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Lid -->
  <path d="M3 6h18" />
  <path d="M8 6l1-2h6l1 2" />
  <!-- Bin -->
  <rect x="5" y="6" width="14" height="14" rx="2" />
  <!-- Lines -->
  <path d="M10 11v6" />
  <path d="M14 11v6" />
</svg>
</button>
            </div>
          </div>
        `,
          )
          .join("") +
        `</div>`
      : `<p class="data-list-empty">No tenant assigned.</p>`;

    pill.innerHTML = `
      <span class="pill-title">${escapeHTML(unit.name)}</span>
      <span class="pill-subtitle">${escapeHTML(unit.type)}</span>
      ${tenantsHTML}
      <button type="button" class="btn btn-sm add-tenant-btn" style="margin-top:8px;">+ Add Tenant</button>
    `;

    grid.appendChild(pill);

    pill.querySelectorAll(".remove-tenant-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (confirm("Remove this tenant?")) {
          await removeTenantFromDb(btn.dataset.tenantId);
          toastMsg("Tenant removed", "success");
          const refreshedUnits = await fetchUnitsByPropertyId(propertyId);
          await renderUnits(refreshedUnits, propertyId);
        }
      });
    });

    pill
      .querySelector(".add-tenant-btn")
      .addEventListener("click", async () => {
        await loadComponent(
          "../components/modals/create/add-tenant",
          "modalContainer",
        );
        await handleAddTenantSubmit({ unit_id: unit.id }, async () => {
          const refreshedUnits = await fetchUnitsByPropertyId(propertyId);
          await renderUnits(refreshedUnits, propertyId);
        });
      });
  }
}

async function renderPropertyTenants(propertyId) {
  const list = document.getElementById("propertyTenantsList");
  if (!list) return;

  const tenants = await fetchTenantsByPropertyId(propertyId);

  if (tenants.length === 0) {
    list.innerHTML = `<p class="data-list-empty">No tenant assigned.</p>`;
    return;
  }

  list.innerHTML =
    `<div class="data-list">` +
    tenants
      .map(
        (t) => `
      <div class="data-list-row">
        <div class="row-main">
          <span class="row-title">${escapeHTML(t.name)}</span>
          <span class="row-meta">${escapeHTML(t.phone)} · ₦${Number(t.rent || 0).toLocaleString("en-NG")} · ${escapeHTML(t.lease_start)} to ${escapeHTML(t.lease_end)}</span>
        </div>
        <div class="row-actions">
          <button type="button" class="danger btn btn-sm remove-property-tenant-btn" data-tenant-id="${t.id}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Lid -->
  <path d="M3 6h18" />
  <path d="M8 6l1-2h6l1 2" />
  <!-- Bin -->
  <rect x="5" y="6" width="14" height="14" rx="2" />
  <!-- Lines -->
  <path d="M10 11v6" />
  <path d="M14 11v6" />
</svg></button>
        </div>
      </div>
    `,
      )
      .join("") +
    `</div>`;

  list.querySelectorAll(".remove-property-tenant-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Remove this tenant?")) {
        await removeTenantFromDb(btn.dataset.tenantId);
        toastMsg("Tenant removed", "success");
        await renderPropertyTenants(propertyId);
      }
    });
  });
}
