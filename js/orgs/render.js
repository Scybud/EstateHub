/**
 * Builds and injects real estate cards cleanly inside your layout grid target container
 * @param {Array} orgsArray - Collection array matching properties row schemas
 * @param {Function} onDeleteClick - Action callback forwarding the unique instance target UUID
 */
/**
 * Builds and injects corporate client cards cleanly inside your layout grid target container
 * @param {Array} clientsData - Collection array matching client row schemas
 * @param {Function} onDeleteCallback - Action callback forwarding the unique instance target UUID
 */

      import { loadComponent, createEmptyState } from "https://ui.scybud.com/js/ui.js";
import { handleOrgCreation } from "../create/create-org.js"; 
import { handleMemberInvite } from "../create/add-member.js";
import { handleOrgClientSubmit } from "../create/add-client.js";

export async function renderOrgsCards(orgsArray, onDeleteClick, userId) {
  const detailsCard = document.getElementById("detailsCard");
  if (!detailsCard) return;

  if (orgsArray.length === 0) {
    await createEmptyState({
      container: detailsCard,
      icon: "🏢",
      title: "Nothing here yet",
      description: "You have not created an org yet.",
      actionText: "Create org",
      onAction: async () => {
        await loadComponent(
          "../components/modals/create/create-org",
          "modalContainer",
        );
        await handleOrgCreation();
      },
    });
    return;
  }

  detailsCard.innerHTML = "";

  // FIXED: Create ONE single grid container OUTSIDE the loop
  const twoColumnGrid = document.createElement("div");
  twoColumnGrid.classList.add("two-column-grid");

  orgsArray.forEach((org) => {
   const cardDiv = document.createElement("div");
   cardDiv.classList.add("card");

   // Clean ternary to determine the badge class
   const statusBadgeClass = org.is_verified ? "verified" : "not-verified";
   const statusText = org.is_verified ? "Verified" : "Not verified";

   cardDiv.innerHTML = `
  <h3>${org.name ?? "Your Asset"}</h3>
  
  <p>
    <b>Org Status:</b> 
    <span class="status-badge ${statusBadgeClass}">${statusText}</span>
  </p>
  
  <div class="card-actions">
    <a href="org?org=${org.id}" class="btn action-view-btn view-btn">Open</a>

${
  org.owner_id === userId
    ? `<button type="button" class="btn delete-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"
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
 Delete</button>`
    : ""
}
  </div>
`;


    cardDiv.querySelector(".delete-btn")?.addEventListener("click", () => {
      onDeleteClick(org.id);
    });

    // Append each individual card into the single parent grid container
    twoColumnGrid.appendChild(cardDiv);
  });

  // FIXED: Prepend the fully populated grid layout container into the main DOM target
  detailsCard.prepend(twoColumnGrid);
}

export async function renderMembersCards(membersArray, onDeleteClick, userId, orgId) {
  const container = document.getElementById("container");
  if (!container) return;

  if (membersArray.length === 0) {
    await createEmptyState({
      container: container,
      icon: "👥",
      title: "Nothing here yet",
      description: "You have not added a member yet.",
      actionText: "Add member",
      onAction: async () => {
        await loadComponent(
          "../components/modals/create/invite-member",
          "modalContainer",
        );
        await handleMemberInvite(fetchOrgById, userId);
      },
    });
    return;
  }


  // FIXED: Create ONE single grid container OUTSIDE the loop
  const twoColumnGrid = document.createElement("div");
  twoColumnGrid.classList.add("two-column-grid");

  membersArray.forEach((mbr) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    cardDiv.innerHTML = `
      <h3>${mbr.agent_id === userId ? "Me" : mbr.agents.first_name + " " + mbr.agents.last_name || "Unknown member"}</h3>
      <p>
          <b>Role:</b> 
          <span class="role-badge ${mbr.role}">${mbr.role}</span>
      </p>
      <div class="card-actions">
      ${mbr.role === "member" && mbr.agent_id !== userId ? `<button type="button" class="danger btn delete-btn">🗑 Remove</button>` : ""
      }
      </div>
    `;

    cardDiv.querySelector(".delete-btn")?.addEventListener("click", () => {
      onDeleteClick(mbr.id);
    });

    // Append each individual card into the single parent grid container
    twoColumnGrid.appendChild(cardDiv);
  });

  // FIXED: Prepend the fully populated grid layout container into the main DOM target
  container.append(twoColumnGrid);
}


/**
 * Renders the corporate clients grid dynamically into the main container
 */
export async function renderClientsCards(clientsData, onDeleteCallback, loadClients, userId, orgId) {
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
        await handleOrgClientSubmit(userId, orgId, async () => {
         await loadClients(userId, orgId);
        });
      },
    });
    return;
  }

  // FIXED: Consistent structure using ONE single grid container OUTSIDE the loop
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
          <button type="button" class="danger btn delete-btn" style="background: #ff4444; color: white;">🗑 Delete</button>
      </div>
    `;

    // FIXED: Clean event listener binding using querySelector on the isolated node instance
    cardDiv.querySelector(".delete-btn").addEventListener("click", () => {
      onDeleteCallback(client.id);
    });

    // Append each individual client card into the parent layout grid
    twoColumnGrid.appendChild(cardDiv);
  });

  // FIXED: Appends the fully populated layout target node safely without overwriting headers
  container.appendChild(twoColumnGrid);
}