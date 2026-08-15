import { supabase } from "../supabase.js";

export async function insertTenant(tenantPayload) {
  const { data, error } = await supabase
    .from("tenants")
    .insert([tenantPayload])
    .select();
  if (error) throw error;
  return data;
}

export async function fetchTenantsByUnitId(unitId) {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("unit_id", unitId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function removeTenantFromDb(tenantId) {
  const { error } = await supabase.from("tenants").delete().eq("id", tenantId);
  if (error) throw error;
}

export async function fetchTenantsByPropertyId(propertyId) {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}