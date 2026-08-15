import { supabase } from "../supabase.js";

export async function insertUnits(unitsArray, propertyId) {
  if (!unitsArray || unitsArray.length === 0) return [];
  const payload = unitsArray.map((u) => ({
    property_id: propertyId,
    name: u.name,
    type: u.unit_type,
  }));
  const { data, error } = await supabase.from("units").insert(payload).select();
  if (error) throw error;
  return data;
}

export async function fetchUnitsByPropertyId(propertyId) {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function removeUnitFromDb(unitId) {
  const { error } = await supabase.from("units").delete().eq("id", unitId);
  if (error) throw error;
}
