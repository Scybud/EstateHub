// js/create/add-property.js
import { insertOrgInvites } from "../data/orgsDb.js";
import { sessionState } from "../session.js";
import { supabase } from "../supabase.js";
import { toastMsg } from "../components/toast.js";

function generateInviteToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
function generateExpiry(hours = 48) {
  const expires = new Date();
  expires.setHours(expires.getHours() + hours);
  return expires.toISOString();
}


export async function handleMemberInvite(userId, orgId) {
  const form = document.getElementById("inviteForm");
  
  const token = generateInviteToken();
  const expiresAt = generateExpiry();
  
  form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("inviteEmail").value;
      if (!email) return toastMsg("Type a email for the invite", "error");
      
      console.log("here")
    const orgInvitePayload = {
      organization_id: orgId,
      email: email,
      token: token,
      status: "pending",
      invited_by: userId,
      expires_at: expiresAt,
    };

    try {
      await insertOrgInvites(orgInvitePayload);

      const baseUrl = window.location.origin; // Automatically uses localhost or app.loghue.com
      const inviteUrl = `${baseUrl}/app/join/index?token=${token}`;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data } = await supabase.functions.invoke("send-org-invite", {
        body: { email, inviteUrl },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      toastMsg("Invite sent!", "success");
    } catch (err) {
      if (err.code === "23505") {
        return toastMsg("User already a member or already invited", "error");
      }

      toastMsg(`Publishing aborted: ${err.message}`, "error");
    }
  });
}
