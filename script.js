document.addEventListener("DOMContentLoaded", () => {
  // Initialize the Leaflet map
  const map = L.map("map").setView([-6.917464, 107.619122], 13); // Centered on Bandung, Indonesia

  // Add a tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let currentMarker = null; // To keep track of the current marker

  // Function to add a marker to the map
  function addMarker(lat, lng, popupText = "Lokasi Pilihan") {
    if (currentMarker) {
      map.removeLayer(currentMarker); // Remove previous marker if exists
    }
    currentMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(popupText)
      .openPopup();
    map.setView([lat, lng], 13); // Center map on new marker
  }

  // --- Sidebar Controls ---

  const mapTypeSelect = document.getElementById("map-type");
  mapTypeSelect.addEventListener("change", (event) => {
    const selectedType = event.target.value;
    console.log(`Map type changed to: ${selectedType}`);
    // In a real application, you might change tile layers here
    // For simplicity, we're sticking to OpenStreetMap for now.
  });

  const coordXInput = document.getElementById("coord-x");
  const coordYInput = document.getElementById("coord-y");
  const locationNameInput = document.getElementById("location-name");
  const saveCoordsBtn = document.getElementById("save-coords-btn");
  const initialCoordsBtn = document.getElementById("initial-coords-btn");

  saveCoordsBtn.addEventListener("click", () => {
    const coordX = parseFloat(coordXInput.value);
    const coordY = parseFloat(coordYInput.value);
    const locationName = locationNameInput.value.trim();

    if (isNaN(coordX) || isNaN(coordY)) {
      alert("Please enter valid numeric coordinates for X and Y.");
      return;
    }

    console.log(
      `Saving Coordinates: X=${coordX}, Y=${coordY}, Name=${locationName}`
    );
    addMarker(coordX, coordY, locationName || "Lokasi Tersimpan");

    // In a real application, you'd send this data to a server
    // Example: fetch('/api/save-location', { method: 'POST', body: JSON.stringify({ x: coordX, y: coordY, name: locationName }) });
  });

  initialCoordsBtn.addEventListener("click", () => {
    // Example initial coordinates (e.g., your default location)
    const initialLat = -6.917464; // Bandung Latitude
    const initialLng = 107.619122; // Bandung Longitude

    coordXInput.value = initialLat;
    coordYInput.value = initialLng;
    locationNameInput.value = "Koordinat Awal (Bandung)";

    addMarker(initialLat, initialLng, "Lokasi Awal");
    console.log("Set to initial coordinates.");
  });

  // Optional: Update input fields when map is clicked
  map.on("click", (e) => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    coordXInput.value = lat;
    coordYInput.value = lng;
    addMarker(e.latlng.lat, e.latlng.lng, `Lat: ${lat}, Lng: ${lng}`);
    console.log(`Map clicked at: Lat ${lat}, Lng ${lng}`);
  });

  // --- Login Functionality ---
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");

  loginBtn.addEventListener("click", () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Basic client-side validation (for demonstration)
    if (username === "" || password === "") {
      alert("Please enter both username and password.");
      return;
    }

    console.log(
      `Attempting login with Username: ${username}, Password: ${password}`
    );

    // In a real application, you would send this to a backend server for authentication
    // Example:
    // fetch('/api/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ username, password })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.success) {
    //         alert('Login successful!');
    //         // Redirect or update UI
    //     } else {
    //         alert('Login failed: ' + data.message);
    //     }
    // })
    // .catch(error => console.error('Error during login:', error));

    // For demonstration purposes:
    if (username === "user" && password === "pass") {
      alert("Login successful! (Demo)");
      // You might want to hide the login section or show a "logged in" state
    } else {
      alert("Invalid username or password. (Demo)");
    }
  });

  // Set initial marker on map load (e.g., Bandung)
  addMarker(-6.917464, 107.619122, "Pusat Kota Bandung");
  coordXInput.value = -6.917464;
  coordYInput.value = 107.619122;
  locationNameInput.value = "Pusat Kota Bandung";
});
