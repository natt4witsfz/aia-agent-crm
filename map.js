/* map.js — Leaflet + OpenStreetMap customer map with color-coded pins */

const CustomerMap = {
  map: null,
  markers: [],
  initialized: false,

  // color per customer STATUS (primary signal), icon per TYPE
  STATUS_COLORS: {
    active: "#1d9e5f",
    vip: "#7a4fd0",
    prospect: "#e8a13a",
    lapsed: "#8a93a0",
  },
  TYPE_ICONS: {
    life: "🏠", health: "➕", saving: "💰", invest: "📈", group: "🏢", prospect: "⭐",
  },

  init() {
    if (this.initialized) { this.refresh(); setTimeout(() => this.map.invalidateSize(), 50); return; }
    this.map = L.map("mapContainer").setView([13.7563, 100.5018], 11); // Bangkok default
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.map.on("click", (e) => {
      if (document.getElementById("mapAddMode").checked) {
        this.promptNewAt(e.latlng.lat, e.latlng.lng);
      }
    });

    this.initialized = true;
    this.refresh();
    setTimeout(() => this.map.invalidateSize(), 50);
  },

  pinIcon(customer) {
    const color = this.STATUS_COLORS[customer.status] || "#2f6fd0";
    const icon = this.TYPE_ICONS[customer.type] || "🏠";
    return L.divIcon({
      className: "",
      html: `<div class="marker-pin" style="background:${color}"><span>${icon}</span></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });
  },

  refresh() {
    if (!this.map) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];
    const customers = Store.list("customers").filter(c => c.lat && c.lng);
    for (const c of customers) {
      const marker = L.marker([c.lat, c.lng], { icon: this.pinIcon(c) }).addTo(this.map);
      const policies = Store.list("policies").filter(p => p.customer_id === c.id);
      marker.bindPopup(`
        <div class="map-popup">
          <strong>${esc(c.name)}</strong><br>
          <span style="color:#6b7684">${t("type" + cap(c.type)) || ""} · ${t("status" + cap(c.status)) || ""}</span><br>
          📞 ${esc(c.phone || "-")}<br>
          📄 ${policies.length} ${t("navPolicies")}<br>
          <button class="btn btn-sm btn-primary" onclick="App.openCustomerDetail('${c.id}')">${t("openDetail")}</button>
        </div>`);
      this.markers.push(marker);
    }
    if (customers.length) {
      const grp = L.featureGroup(this.markers);
      this.map.fitBounds(grp.getBounds().pad(0.25), { maxZoom: 14 });
    }
    this.renderLegend();
  },

  renderLegend() {
    const el = document.getElementById("mapLegend");
    el.innerHTML = Object.entries(this.STATUS_COLORS).map(([k, color]) =>
      `<span class="legend-item"><span class="color-dot" style="background:${color}"></span>${t("status" + cap(k))}</span>`
    ).join("") + `<span class="legend-item" style="color:var(--muted)">${Object.entries(this.TYPE_ICONS).map(([k, ic]) => ic + " " + t("type" + cap(k))).join(" · ")}</span>`;
  },

  promptNewAt(lat, lng) {
    document.getElementById("mapAddMode").checked = false;
    App.openCustomerForm(null, { lat: +lat.toFixed(6), lng: +lng.toFixed(6) });
  },

  focusCustomer(id) {
    const c = Store.get("customers", id);
    if (!c || !c.lat) return;
    App.switchView("map");
    setTimeout(() => {
      this.map.setView([c.lat, c.lng], 16);
      const m = this.markers.find(mk => {
        const ll = mk.getLatLng();
        return Math.abs(ll.lat - c.lat) < 1e-9 && Math.abs(ll.lng - c.lng) < 1e-9;
      });
      if (m) m.openPopup();
    }, 120);
  },
};

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function esc(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }
