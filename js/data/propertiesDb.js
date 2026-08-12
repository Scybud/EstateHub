// js/data/propertiesDb.js
import { supabase } from "../supabase.js";

// Insert a brand new property asset
export async function insertProperty(propertyPayload) {
  const { data, error } = await supabase
    .from("properties")
    .insert([propertyPayload])
    .select();
  if (error) throw error;
  return data;
}

// Fetch all properties belonging to the active organization or standalone agent
export async function fetchProperties(agentId, organizationId = null) {
  let query = supabase.from("properties").select("*");

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.eq("agent_id", agentId).is("organization_id", null);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Delete property asset row
export async function removePropertyFromDb(propertyId) {
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);
  if (error) throw error;
}

// Fetch a single unique property profile row
export async function fetchPropertyById(propertyId) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .single(); // Gets a single object row back instead of an array
  if (error) throw error;
  return data;
}

//Fetch property by client id
export async function fetchPropertiesByClientId(clientId) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}