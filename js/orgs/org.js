import { fetchOrgClients, removeClientFromDb } from "../data/clientsDb.js";
import { handleOrgClientSubmit } from "../create/add-client.js";
import { renderSectionHeader } from "../components/section-header.js";
import { toastMsg } from "../components/toast.js";
import { handleMemberInvite } from "../create/add-member.js";
import { handleFormSteps } from "../create/add-property.js";
import { renderPropertyCards } from "../dashboard/render.js";
import {
  fetchOrgMembers,
  removeMemberFromDb,
  fetchOrgById,
  updateOrgNameInDb,
} from "../data/orgsDb.js"; // ✅ Now importing the fixed & new methods
import { fetchProperties, removePropertyFromDb } from "../data/propertiesDb.js";
import { sessionReady, sessionState } from "../session.js";
import { renderClientsCards, renderMembersCards } from "./render.js";
import { loadComponent } from "https://ui.scybud.com/js/ui.js";

document.addEventListener("DOMContentLoaded", async () => {
  await sessionReady;

  const orgNavBar = document.getElementById("org-nav-bar");
  const params = new URLSearchParams(window.location.search);
  const orgId = params.get("org");
  const userId = sessionState.user?.id;

  if (!orgId || orgId === "undefined") {
    console.error("Invalid orgId:", orgId);
    window.location.href = "dashboard.html";
    return;
  }

  // 1. 🏷️ DYNAMICALLY SET HTML TITLE FROM SUPABASE
  await initPageTitle(orgId);

  // 2. 🚀 INITIAL LOAD
  await loadAssets(userId, orgId);

  // 3. 🗺️ NAVIGATION SETUP
  const loadOrgNavs = () => {
    if (!orgNavBar) return;

    const btns = [
      { text: "Assets", onClick: async () => await loadAssets(userId, orgId) },
      {
        text: "Members",
        onClick: async () => await loadMembers(userId, orgId),
      },
      {
        text: "Clients",
        onClick: async () => await loadClients(userId, orgId),
      },
      {
        text: "Settings",
        onClick: async () => await loadSettings(userId, orgId),
      },
    ];

    btns.forEach((btn) => {
      const navBtn = document.createElement("button");
      navBtn.classList.add("btn-nav-bar");
      navBtn.textContent = btn.text;
     navBtn.addEventListener("click", async () => {
       document
         .querySelectorAll(".btn-nav-bar")
         .forEach((button) => button.classList.remove("active"));

       navBtn.classList.add("active");

       await btn.onClick();
     });
      orgNavBar.appendChild(navBtn);
    });
  };

  loadOrgNavs();
});

/**
 * Fetches org from Supabase and sets window title to: ORG NAME | PropDek
 */
async function initPageTitle(orgId) {
  try {
    const orgData = await fetchOrgById(orgId);
    if (orgData && orgData.name) {
      document.title = `${orgData.name} | PropDek`;
    } else {
      document.title = "Workspace | PropDek";
    }
  } catch (error) {
    console.error("Error setting page title:", error);
    document.title = "PropDek";
  }
}

/* ==========================================
   1. ASSETS TAB
   ========================================== */
export async function loadAssets(userId, orgId) {
  const container = document.getElementById("container");
  if (!container) return;
  container.innerHTML = "";

  renderSectionHeader(
    "Org Assets",
    `<button type="button" class="btn-primary btn-sm btn add-property">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Add property
    </button>`,
  );

  const addPropertyBtn = document.querySelector(".add-property");
  if (addPropertyBtn) {
    addPropertyBtn.addEventListener("click", async () => {
      await loadComponent(
        "../components/modals/create/add-property.html",
        "modalContainer",
      );
      await handleFormSteps(orgId);
    });
  }

  const assetsData = await fetchProperties(userId, orgId);

  await renderPropertyCards(
    assetsData,
    async (id) => {
      if (confirm("Are you sure you want to delete this asset row?")) {
        await removePropertyFromDb(id);
        await loadAssets(userId, orgId);
      }
    },
    orgId,
  );
}

/* ==========================================
   2. MEMBERS TAB
   ========================================== */
export async function loadMembers(userId, orgId) {
  const container = document.getElementById("container");
  if (!container) return;
  container.innerHTML = "";

  renderSectionHeader(
    "Members",
    `<button type="button" class="btn-primary btn-sm btn invite-member">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Invite member
    </button>`,
  );

  const inviteMemberBtn = document.querySelector(".invite-member");
  if (inviteMemberBtn) {
    inviteMemberBtn.addEventListener("click", async () => {
      await loadComponent(
        "../components/modals/create/invite-member.html",
        "modalContainer",
      );
      await handleMemberInvite(userId, orgId);
    });
  }

  const membersData = await fetchOrgMembers(orgId);

  await renderMembersCards(
    membersData,
    async (id) => {
      if (confirm("Are you sure you want to delete this member?")) {
        await removeMemberFromDb(id);
        await loadMembers(userId, orgId);
      }
    },
    userId,
    orgId,
  );
}

/* ==========================================
   3. CLIENTS TAB (Now 100% Consistent!)
   ========================================== */
export async function loadClients(userId, orgId) {
  const container = document.getElementById("container");
  if (!container) return;
  container.innerHTML = "";

  renderSectionHeader(
    "Org Clients",
    `<button type="button" class="btn-primary btn-sm btn add-client">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Add Client
    </button>`,
  );

  const addClientBtn = document.querySelector(".add-client");
  if (addClientBtn) {
    addClientBtn.addEventListener("click", async () => {
      await loadComponent("../components/modals/create/add-client.html", "modalContainer");
      await handleOrgClientSubmit(userId, orgId, () => {
        loadClients(userId, orgId);
      });
    });
  }

  const clientsData = await fetchOrgClients(orgId);

  // ✅ Offloading layout generation to a dedicated renderer, just like Assets & Members!
  await renderClientsCards(
    clientsData,
    async (id) => {
      if (confirm("Are you sure you want to delete this client?")) {
         await removeClientFromDb(id); // map this when ready
        loadClients(userId, orgId);
      }
    },
    loadClients,
    userId,
    orgId
  );
}

/* ==========================================
   4. SETTINGS TAB (Fully functional with Supabase!)
   ========================================== */
export async function loadSettings(userId, orgId) {
  const container = document.getElementById("container");
  if (!container) return;
  container.innerHTML = "";

  renderSectionHeader("Settings", "");

  // Fetch current organization data to prefill the text field
  let currentName = "";
  try {
    const orgData = await fetchOrgById(orgId);
    currentName = orgData ? orgData.name : "";
  } catch (err) {
    console.error("Error loading current settings details:", err);
  }

  container.innerHTML += `
    <div class="settings-wrapper" style="max-width: 600px; margin: 20px auto 0;">
      <form id="org-settings-form">
          <label>Organization Name
          <input type="text" id="settings-org-name" class="form-control" value="${currentName}" placeholder="Enter organization name" >
          </label>

           <label>Organization Id
          <input type="text" id="settings-org-id" class="form-control" value="${orgId}" disabled>
          </label>
        <button type="submit" id="save-settings-btn" class="btn-primary btn" style="padding: 10px 20px;">Save Changes</button>
      </form>
    </div>
  `;

  const form = document.getElementById("org-settings-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById("save-settings-btn");
      const updatedName = document
        .getElementById("settings-org-name")
        .value.trim();

      if (!updatedName) {
        alert("Organization name cannot be empty.");
        return;
      }

      try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        // Push the update to Supabase
        await updateOrgNameInDb(orgId, updatedName);

        // Update browser tab UI live!
        document.title = `${updatedName} | PropDek`;
        toastMsg("Organization settings updated successfully!", "success");
      } catch (error) {
        console.error("Failed to update organization:", error);
        toastMsg("An error occurred while saving updates.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      }
    });
  }
}
