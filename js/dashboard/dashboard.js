import { supabase } from "../supabase.js";
import { fetchClients, removeClientFromDb } from "../data/clientsDb.js";
import { fetchPropertyStatuses } from "../data/propertiesDb.js";
import { renderClientsCards } from "../clients/render.js";
import { toastMsg } from "../components/toast.js";

export async function initDashboard(orgId) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "../auth/login";
      return;
    }

    const clients = await fetchClients(user.id, orgId || null);
    const propertyStatuses = await fetchPropertyStatuses(
      user.id,
      orgId || null,
    );

    renderStats(clients.length, propertyStatuses);

    renderClientsCards(
      clients,
      async (id) => {
        if (confirm("Are you sure you want to delete Client info?")) {
          await removeClientFromDb(id);
          initDashboard(orgId);
        }
      },
      user.id,
      () => initDashboard(orgId),
      orgId || null,
    );
  } catch (error) {
    toastMsg("Error loading dashboard", "error");
    console.error("Dashboard error:", error.message);
  }
}

function renderStats(clientCount, propertyStatuses) {
  const clientCountEl = document.getElementById("clientCount");
  const propertyCountEl = document.getElementById("propertyCount");
  const rentedCountEl = document.getElementById("rentedCount");
  const availableCountEl = document.getElementById("availableCount");

  const total = propertyStatuses.length;
  const rented = propertyStatuses.filter(
    (p) => p.status?.toLowerCase() === "rented",
  ).length;
  const available = total - rented;

  if (clientCountEl) clientCountEl.innerText = clientCount;
  if (propertyCountEl) propertyCountEl.innerText = total;
  if (rentedCountEl) rentedCountEl.innerText = rented;
  if (availableCountEl) availableCountEl.innerText = available;
}
