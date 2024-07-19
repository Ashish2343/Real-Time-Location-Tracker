const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-tracking');
    const usernameInput = document.getElementById('username');
    const mapContainer = document.getElementById('map');
    const inputContainer = document.getElementById('input-container');

    startButton.addEventListener('click', () => {
        const username = usernameInput.value.trim(); // Ensure username is scoped correctly
        if (username) {
            inputContainer.style.display = 'none';
            mapContainer.style.display = 'block';
            startTracking(username); // Pass username to startTracking function
        } else {
            alert('Please enter your name.');
        }
    });

    function startTracking(username) {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords;
                socket.emit('send-location', { usernameInput: username, latitude, longitude }); // Pass username as usernameInput
            }, (err) => {
                console.log(err);
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        }

        const map = L.map('map').setView([0, 0], 16);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: 'OpenStreetMap'
        }).addTo(map);

        const marker = {};

        socket.on('recieve-location', (data) => {
            const { id, latitude, longitude } = data;
            map.setView([latitude, longitude]);
            if (marker[id]) {
                marker[id].setLatLng([latitude, longitude]);
            } else {
                marker[id] = L.marker([latitude, longitude]).addTo(map).bindTooltip(username,{
                    permanent: true,
                    direction: 'right',
                    opacity: 0.75
                })
            }
        });

        socket.on('user-disconnect', (id) => {
            if (marker[id]) {
                marker[id].remove();
                delete marker[id];
            }
        });
    }
});
