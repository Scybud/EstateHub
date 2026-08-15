import { supabase } from "../supabase.js";

async function guardAppAuth() {
    const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "../auth/login";
          return;
        }
}
