// js/create/add-property.js
import { insertProperty } from "../data/propertiesDb.js";
import { insertUnits } from "../data/unitsDb.js";
import { fetchClientById } from "../data/clientsDb.js";
import { supabase } from "../supabase.js";
import { toastMsg } from "../components/toast.js";

export async function handleFormSteps(orgId, clientId = null) {
  const form = document.getElementById("propertyForm");
  const steps = document.querySelectorAll(".form-step");
  const dots = document.querySelectorAll(".step-dot");
  const nextButtons = document.querySelectorAll(".btn-next");
  const prevButtons = document.querySelectorAll(".btn-prev");
  const unitsContainer = document.getElementById("unitsContainer");
  const addUnitBtn = document.getElementById("addUnitBtn");
  const getLocationBtn = document.getElementById("getCurrentLocationBtn");

  let currentStep = 1;
  let unitCount = 0;

  if (clientId) {
    fetchClientById(clientId)
      .then((client) => {
        const nameEl = document.getElementById("formClientName");
        if (nameEl && client) nameEl.innerText = client.name;
      })
      .catch((err) => console.error("Failed to load client name:", err));
  }

  function updateFormState() {
    steps.forEach((step) => {
      step.classList.toggle(
        "active",
        parseInt(step.dataset.step) === currentStep,
      );
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index < currentStep);
    });
  }

  async function verifyPropertyAddressOnMap() {
    const address = document.getElementById("address").value.trim();
    const neighborhood = document.getElementById("neighborhood").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const country = "Nigeria";

    const latInput = document.getElementById("latitude");
    const lonInput = document.getElementById("longitude");

    const addressQuery = `${address}, ${city}, ${state}, ${country}`;
    try {
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`,
      );
      let data = await response.json();

      if (data && data.length > 0) {
        if (latInput) latInput.value = parseFloat(data[0].lat).toFixed(6);
        if (lonInput) lonInput.value = parseFloat(data[0].lon).toFixed(6);
        return true;
      }

      if (!neighborhood) {
        toastMsg(
          "The address isn't found on the map. Please add a neighborhood for an approximate location.",
          "error",
        );
        document.getElementById("neighborhood").focus();
        return false;
      }

      const neighborhoodQuery = `${neighborhood}, ${city}, ${state}, ${country}`;
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(neighborhoodQuery)}&limit=1`,
      );
      data = await response.json();

      if (data && data.length > 0) {
        if (latInput) latInput.value = parseFloat(data[0].lat).toFixed(6);
        if (lonInput) lonInput.value = parseFloat(data[0].lon).toFixed(6);
        toastMsg(
          `Exact address not found on map. Pinning approximate location using neighborhood: "${neighborhood}".`,
          "warning",
        );
        return true;
      } else {
        toastMsg(
          "Neither the address nor the neighborhood could be located on the map. Please verify your spelling.",
          "error",
        );
        return false;
      }
    } catch (error) {
      console.error("Map verification failed:", error);
      return true;
    }
  }

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const currentStepElement = steps[currentStep - 1];
      const currentFields = currentStepElement.querySelectorAll("[required]");

      let allValid = true;
      currentFields.forEach((field) => {
        if (!field.checkValidity()) {
          field.reportValidity();
          allValid = false;
        }
      });

      if (allValid) {
        const addressField = document.getElementById("address");
        if (addressField && currentStepElement.contains(addressField)) {
          const originalText = btn.innerText;
          btn.innerText = "Verifying Map Placement...";
          btn.disabled = true;

          const addressIsValidOnMap = await verifyPropertyAddressOnMap();

          btn.innerText = originalText;
          btn.disabled = false;

          if (!addressIsValidOnMap) {
            return;
          }
        }

        if (currentStep < steps.length) {
          currentStep++;
          updateFormState();
        }
      }
    });
  });

  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 1) {
        currentStep--;
        updateFormState();
      }
    });
  });

  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", () => {
      getLocationBtn.innerText = "Locating Coordinates...";
      if (!navigator.geolocation) {
        toastMsg("Geolocation unsupported by browser environment.", "error");
        getLocationBtn.innerText = "📍 Auto-Detect GPS Coordinates";
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          document.getElementById("latitude").value =
            pos.coords.latitude.toFixed(6);
          document.getElementById("longitude").value =
            pos.coords.longitude.toFixed(6);
          getLocationBtn.innerText = "📍 Coordinates Linked!";
        },
        (err) => {
          console.error(err);
          toastMsg(`Telemetry sync failed: ${err.message}`, "error");
          getLocationBtn.innerText = "📍 Auto-Detect GPS Coordinates";
        },
      );
    });
  }

  if (addUnitBtn) {
    addUnitBtn.addEventListener("click", () => {
      unitCount++;
      const unitCard = document.createElement("div");
      unitCard.classList.add("unit-card");
      unitCard.setAttribute("data-unit-index", unitCount - 1);

      unitCard.innerHTML = `
        <div class="unit-card-header">
          <h4>Unit #${unitCount}</h4>
          <button type="button" class="btn-remove-unit" style="display: block;">Remove</button>
        </div>
        <div class="form-group-row">
          <label>
            Unit name *
            <input type="text" name="unit_name[]" placeholder="e.g., Apartment A1" required />
          </label>
          <label>
            Unit Type *
            <select name="unit_type[]" required>
              <option value="" disabled selected>Select Type</option>
              <option value="Apartment">Full Apartment</option>
              <option value="Room">Single Room</option>
              <option value="Studio">Studio Suite</option>
            </select>
          </label>
        </div>
      `;
      unitsContainer.appendChild(unitCard);
      unitCard
        .querySelector(".btn-remove-unit")
        .addEventListener("click", () => {
          unitCard.remove();
          reindexUnits();
        });
    });
  }

  function reindexUnits() {
    const remainingCards = unitsContainer.querySelectorAll(".unit-card");
    unitCount = remainingCards.length;
    remainingCards.forEach((card, idx) => {
      card.querySelector("h4").innerText = `Unit #${idx + 1}`;
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const parseNum = (id) => {
      const val = document.getElementById(id)?.value;
      return val && val.trim() !== "" ? parseFloat(val) : null;
    };
    const parseIntNum = (id) => {
      const val = document.getElementById(id)?.value;
      return val && val.trim() !== "" ? parseInt(val, 10) : null;
    };

    const unitsPayload = unitsContainer
      ? Array.from(unitsContainer.querySelectorAll(".unit-card")).map(
          (card) => ({
            name: card.querySelector('input[name="unit_name[]"]').value.trim(),
            unit_type: card.querySelector('select[name="unit_type[]"]').value,
          }),
        )
      : [];

    const propertyPayload = {
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim() || null,

      property_type: document.getElementById("property_type").value || null,
      status: document.getElementById("status").value || null,
      year_built: parseIntNum("year_built"),

      bedrooms: parseIntNum("bedrooms"),
      bathrooms: parseIntNum("bathrooms"),
      total_rooms: parseIntNum("total_rooms"),
      floor_space_sqm: parseNum("floor_space_sqm"),
      lot_size_sqm: parseNum("lot_size_sqm"),
      parking_spaces: parseIntNum("parking_spaces"),

      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      state: document.getElementById("state").value.trim(),
      neighborhood:
        document.getElementById("neighborhood").value.trim() || null,
      postal_code: document.getElementById("postal_code").value.trim() || null,
      country: "Nigeria",
      latitude: parseNum("latitude"),
      longitude: parseNum("longitude"),

      list_price:
        parseFloat(document.getElementById("list_price").value) || 0.0,
      period: document.getElementById("period").value || null,
      rent_expiry_date:
        document.getElementById("rent_expiry_date").value || null,
      tax_annual: parseNum("tax_annual"),
      association_fees_monthly: parseNum("association_fees_monthly"),
      currency: "NGN",
    };

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No active session tracked.");

      propertyPayload.agent_id = user.id;
      propertyPayload.organization_id = orgId || null;
      propertyPayload.client_id = clientId || null;

      const insertedProperty = await insertProperty(propertyPayload);
      const newPropertyId = insertedProperty[0].id;

      if (unitsPayload.length > 0) {
        await insertUnits(unitsPayload, newPropertyId);
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      toastMsg(`Publishing aborted: ${err.message}`, "error");
    }
  });
}
