import { toastMsg } from "../components/toast.js";
import { insertTenant } from "../data/tenantsDb.js";
import { sessionState } from "../session.js";

export async function handleAddTenantSubmit(target, onSuccessCallback) {
  // target is { unit_id } or { property_id }
  const form = document.getElementById("addTenantForm");
  const modalContainer = document.getElementById("modalContainer");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById("tenant-name").value.trim();
    const phone = document.getElementById("tenant-phone").value.trim();
    const rent = parseFloat(document.getElementById("tenant-rent").value) || 0;
    const leaseStart = document.getElementById("tenant-lease-start").value;
    const leaseEnd = document.getElementById("tenant-lease-end").value;

    if (!name || !phone || !leaseStart || !leaseEnd) {
      alert("Please fill in all fields.");
      return;
    }

    const agentId = await sessionState.user.id;

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Adding...";
      }

      await insertTenant({
        ...target,
        name,
        phone,
        rent,
        lease_start: leaseStart,
        lease_end: leaseEnd,
        agent_id: agentId
      });

      toastMsg("Tenant added successfully!", "success");
      if (modalContainer) modalContainer.innerHTML = "";
      if (onSuccessCallback) onSuccessCallback();
    } catch (error) {
      console.error("Error inserting tenant:", error);
      toastMsg("Failed to save tenant record.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Add Tenant";
      }
    }
  });
}
