import { supabase } from "../supabase.js";

/**
 * Inserts a new corporate/organization client into the database
 */
export async function insertClient(clientPayload) {
  const { data, error } = await supabase
    .from("clients")
    .insert([clientPayload])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Deletes a unique corporate client row from the database
 */
export async function removeClientFromDb(clientId) {
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) throw error;
}

/**
 * Fetches all clients tied to a specific organization
 */
export async function fetchOrgClients(orgId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Fetch all properties belonging to the active organization or standalone agent
export async function fetchClients(agentId, organizationId = null) {
  let query = supabase.from("clients").select("*");

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.eq("agent_id", agentId).is("organization_id", null);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchClientById(clientId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();
  if (error) throw error;
  return data;
}

/*
export async function fetchClients(userId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("agent_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
  */