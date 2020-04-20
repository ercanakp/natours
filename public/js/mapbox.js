/* eslint-disable */

export const displayMap = locations => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiYmFyYW5rdXRheSIsImEiOiJjazkycXZ6aWQwMjVzM2Vtd3JyZTBjbTd6In0.RLg9s2AjKjYcBo2SRUCEZw';

    var map = new mapboxgl.Map({
        container: 'map',
        // style: 'mapbox://styles/mapbox/streets-v11',
        // style: 'mapbox://styles/barankutay/ck92v26q42j1h1ik4avpf9sdb',
        style: 'mapbox://styles/barankutay/ck92vsro62k1r1ioc24z10ovy',
        scrollZoom: false
        // center: [-118.113491, 34.11745],
        // zoom: 6,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create Marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add Marker
        new mapboxgl.Marker({
                element: el,
                anchor: 'bottom'
            })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add Popup
        new mapboxgl.Popup({
                offset: 30
            })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            left: 100,
            bottom: 150,
            right: 100
        }
    });
};