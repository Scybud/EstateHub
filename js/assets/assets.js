// js/dashboard/dashboard.js
import { supabase } from "../supabase.js";
import { fetchProperties, removePropertyFromDb } from "../data/propertiesDb.js";
import { renderPropertyCards } from "../dashboard/render.js";
import { toastMsg } from "../components/toast.js";

export async function initAssets() {

      const container = document.getElementById("container");
if(!container) return;
container.innerHTML = "";

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "../auth/login";
      return;
    }

    const assets = await fetchProperties(user.id);

    renderPropertyCards(assets, async (id) => {
      if (confirm("Are you sure you want to delete Client info?")) {
        await removePropertyFromDb(id);
        // Reload dashboard rows locally down pipeline
        initAssets();
      }
    }, user.id);
  } catch (error) {
    toastMsg("Error loading assets", "error")
    console.error("Clients error:", error.message);
  } 
}
