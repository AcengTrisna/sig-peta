document.addEventListener("DOMContentLoaded", () => {
  // Memuat leaflet-providers.js secara dinamis
  const leafletProvidersScript = document.createElement("script");
  leafletProvidersScript.src =
    "https://unpkg.com/leaflet-providers@1.13.0/leaflet-providers.js";

  // Elemen UI utama
  const appContent = document.getElementById("app-content");
  const mapContainer = document.querySelector(".map-container"); // Pastikan ini juga disembunyikan
  const saveCoordsBtn = document.getElementById("save-coords-btn");

  // Elemen UI Login
  const loginFormContainer = document.getElementById("login-form-container");
  const loggedInStatusDiv = document.getElementById("logged-in-status");
  const loggedInUsernameSpan = document.getElementById("logged-in-username");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const VALID_USERNAME = "aceng-trisna"; // Username yang diminta
  const VALID_PASSWORD = "npmaceng"; // Password yang diminta
  const LOGIN_KEY = "isLoggedIn"; // Key untuk sessionStorage

  let map = null; // Variabel global untuk instance peta Leaflet
  let currentTileLayer = null;
  let inputMarker = null;
  let savedLocationMarkers = null;
  let savedLocations = [];
  let exampleOverlay = null; // Variabel untuk hamparan peta

  // Fungsi untuk mengubah lapisan ubin peta
  function changeTileLayer(providerName) {
    if (currentTileLayer) {
      map.removeLayer(currentTileLayer);
    }
    currentTileLayer = L.tileLayer.provider(providerName).addTo(map);
  }

  // Fungsi untuk menambahkan penanda untuk lokasi input saat ini
  function addInputMarker(lat, lng, popupText = "Lokasi Pilihan") {
    if (inputMarker) {
      map.removeLayer(inputMarker);
    }
    inputMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(popupText)
      .openPopup();
    map.setView([lat, lng], 15);
  }

  // Memuat lokasi yang disimpan dari localStorage
  function loadSavedLocations() {
    const storedLocations = localStorage.getItem("savedLocations");
    if (storedLocations) {
      savedLocations = JSON.parse(storedLocations);
      renderSavedLocations();
    }
  }

  // Menyimpan lokasi ke localStorage
  function saveLocationsToLocalStorage() {
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  }

  // Merender lokasi yang disimpan dalam daftar dan di peta
  function renderSavedLocations() {
    const savedLocationsList = document.getElementById("saved-locations-list");
    savedLocationsList.innerHTML = "";
    if (savedLocationMarkers) {
      // Pastikan layer group sudah diinisialisasi
      savedLocationMarkers.clearLayers();
    }

    if (savedLocations.length === 0) {
      savedLocationsList.innerHTML =
        '<li style="font-style: italic; color: #777;">Belum ada lokasi tersimpan.</li>';
    }

    savedLocations.forEach((loc, index) => {
      const listItem = document.createElement("li");
      const locationText = document.createElement("span");
      locationText.textContent = loc.name;
      listItem.appendChild(locationText);

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn";
      deleteButton.innerHTML = '<i class="fas fa-times"></i>';
      listItem.appendChild(deleteButton);

      locationText.addEventListener("click", () => {
        map.setView([loc.lat, loc.lng], 15);
        const clickedMarker = Object.values(savedLocationMarkers._layers).find(
          (m) => m.getLatLng().lat === loc.lat && m.getLatLng().lng === loc.lng
        );
        if (clickedMarker) {
          clickedMarker.openPopup();
        }
      });

      deleteButton.addEventListener("click", () => {
        if (confirm(`Anda yakin ingin menghapus lokasi "${loc.name}"?`)) {
          savedLocations.splice(index, 1);
          saveLocationsToLocalStorage();
          renderSavedLocations();
        }
      });

      savedLocationsList.appendChild(listItem);

      if (map) {
        // Pastikan peta sudah diinisialisasi sebelum menambahkan marker
        L.marker([loc.lat, loc.lng])
          .addTo(savedLocationMarkers)
          .bindPopup(
            `<b>${loc.name}</b><br>Lat: ${loc.lat.toFixed(
              4
            )}, Lng: ${loc.lng.toFixed(4)}`
          );
      }
    });
  }

  // Fungsi untuk inisialisasi peta dan fitur terkait
  function initializeMapAndFeatures() {
    if (!map) {
      // Hanya inisialisasi peta jika belum ada
      map = L.map("map").setView([-6.917464, 107.619122], 13); // Centered on Bandung, Indonesia
      savedLocationMarkers = L.layerGroup().addTo(map); // Inisialisasi layer group untuk marker

      changeTileLayer("OpenStreetMap.Mapnik"); // Atur lapisan peta awal

      const mapTypeSelect = document.getElementById("map-type");
      mapTypeSelect.addEventListener("change", (event) => {
        const selectedProvider = event.target.value;
        console.log(`Jenis peta diubah menjadi: ${selectedProvider}`);
        changeTileLayer(selectedProvider);
      });

      const coordXInput = document.getElementById("coord-x");
      const coordYInput = document.getElementById("coord-y");
      const locationNameInput = document.getElementById("location-name");

      saveCoordsBtn.addEventListener("click", () => {
        const lat = parseFloat(coordXInput.value);
        const lng = parseFloat(coordYInput.value);
        const name = locationNameInput.value.trim();

        if (isNaN(lat) || isNaN(lng)) {
          alert(
            "Harap masukkan koordinat X (Lintang) dan Y (Bujur) yang valid."
          );
          return;
        }
        if (!name) {
          alert("Harap masukkan nama lokasi.");
          return;
        }

        const newLocation = { lat, lng, name };
        savedLocations.push(newLocation);
        saveLocationsToLocalStorage();
        renderSavedLocations();

        alert(`Lokasi "${name}" berhasil disimpan!`);
        coordXInput.value = "";
        coordYInput.value = "";
        locationNameInput.value = "";
        if (inputMarker) {
          map.removeLayer(inputMarker);
          inputMarker = null;
        }
      });

      const initialCoordsBtn = document.getElementById("initial-coords-btn");
      initialCoordsBtn.addEventListener("click", () => {
        coordXInput.value = "";
        coordYInput.value = "";
        locationNameInput.value = "";
        if (inputMarker) {
          map.removeLayer(inputMarker);
          inputMarker = null;
        }
        map.setView([-6.917464, 107.619122], 13);
      });

      map.on("click", (e) => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        coordXInput.value = lat;
        coordYInput.value = lng;
        addInputMarker(
          e.latlng.lat,
          e.latlng.lng,
          `Lokasi Dipilih: ${lat}, ${lng}`
        );
        console.log(`Map clicked at: Lat ${lat}, Lng ${lng}`);
      });

      // Logika Hamparan Peta
      const exampleGeoJsonData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Area Penting Contoh",
              description: "Ini adalah contoh area hamparan.",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [107.61, -6.91],
                  [107.625, -6.91],
                  [107.625, -6.92],
                  [107.61, -6.92],
                  [107.61, -6.91],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              name: "Titik Penting Contoh",
              description: "Ini adalah contoh titik hamparan.",
            },
            geometry: { type: "Point", coordinates: [107.619122, -6.917464] },
          },
        ],
      };

      exampleOverlay = L.geoJSON(exampleGeoJsonData, {
        style: function (feature) {
          if (feature.geometry.type === "Polygon") {
            return {
              color: "#ff7800",
              weight: 3,
              opacity: 0.8,
              fillColor: "#ff7800",
              fillOpacity: 0.3,
            };
          }
          return {};
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(
              `<b>${feature.properties.name}</b><br>${
                feature.properties.description || ""
              }`
            );
          }
        },
        pointToLayer: function (feature, latlng) {
          if (feature.geometry.type === "Point") {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#1a53ff",
              color: "#000",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.7,
            });
          }
          return L.marker(latlng);
        },
      });

      const exampleOverlayToggle = document.getElementById(
        "example-overlay-toggle"
      );
      exampleOverlayToggle.addEventListener("change", (event) => {
        if (event.target.checked) {
          exampleOverlay.addTo(map);
          console.log('Hamparan "Contoh Area Penting" diaktifkan.');
        } else {
          map.removeLayer(exampleOverlay);
          console.log('Hamparan "Contoh Area Penting" dinonaktifkan.');
        }
      });
    }

    // Muat lokasi tersimpan dan render penanda hanya setelah peta diinisialisasi
    loadSavedLocations();
  }

  // Fungsi untuk memperbarui UI berdasarkan status login
  function updateLoginUI() {
    const isLoggedIn = sessionStorage.getItem(LOGIN_KEY) === "true";

    if (isLoggedIn) {
      loginFormContainer.style.display = "none";
      loggedInStatusDiv.style.display = "block";
      loggedInUsernameSpan.textContent =
        sessionStorage.getItem("loggedInUser") || "Pengguna";
      saveCoordsBtn.disabled = false;

      // Tampilkan konten aplikasi
      appContent.style.display = "flex"; // Menggunakan 'flex' karena sidebar adalah flex container
      appContent.style.flexDirection = "column"; // Pastikan konten di dalamnya berjajar ke bawah
      mapContainer.style.display = "block"; // Tampilkan map container

      initializeMapAndFeatures(); // Inisialisasi peta dan fitur jika belum
    } else {
      loginFormContainer.style.display = "block";
      loggedInStatusDiv.style.display = "none";
      saveCoordsBtn.disabled = true;

      // Sembunyikan konten aplikasi
      appContent.style.display = "none";
      mapContainer.style.display = "none"; // Sembunyikan map container

      // Hapus semua marker dan lapisan peta jika ada saat logout
      if (map) {
        map.remove(); // Menghapus instance peta sepenuhnya
        map = null; // Setel map ke null agar bisa diinisialisasi ulang
        currentTileLayer = null;
        inputMarker = null;
        savedLocationMarkers = null;
        exampleOverlay = null;
      }
    }
  }

  loginBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === "" || password === "") {
      alert("Harap masukkan nama pengguna dan kata sandi.");
      return;
    }

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      sessionStorage.setItem(LOGIN_KEY, "true");
      sessionStorage.setItem("loggedInUser", username);
      alert("Login berhasil! Selamat datang, " + username + "!");
      updateLoginUI();
      usernameInput.value = "";
      passwordInput.value = "";
    } else {
      alert("Nama pengguna atau kata sandi tidak valid.");
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(LOGIN_KEY);
    sessionStorage.removeItem("loggedInUser");
    alert("Anda telah berhasil keluar.");
    updateLoginUI();
  });

  // Jalankan ini setelah leaflet-providers.js selesai dimuat
  leafletProvidersScript.onload = function () {
    updateLoginUI(); // Periksa status login dan perbarui UI saat DOM dimuat dan leaflet-providers siap
  };

  // Tangani kesalahan pemuatan script
  leafletProvidersScript.onerror = function () {
    console.error(
      "Gagal memuat Leaflet-providers.js. Periksa koneksi jaringan atau URL."
    );
    // Nonaktifkan fungsionalitas peta jika script penting tidak dimuat
    alert(
      "Peringatan: Gagal memuat komponen peta. Beberapa fitur mungkin tidak berfungsi."
    );
    updateLoginUI(); // Coba perbarui UI meskipun ada kesalahan, mungkin bisa menampilkan login
  };

  // Tambahkan script ke head dokumen untuk memulai pemuatan
  document.head.appendChild(leafletProvidersScript);
});
