
/**
 * This file contains the geographical zone configurations.
 * In a real-world, scalable application, this data would likely come from
 * a dedicated 'configurations' or 'locations' collection in Firestore,
 * allowing for dynamic management of countries, cities, and zones
 * through an admin interface without requiring code changes.
 */

// Initial configuration for Quito, Ecuador.
export const quitoZones = [
    { value: 'norte', label: 'Norte de Quito' },
    { value: 'centro-historico', label: 'Centro Histórico' },
    { value: 'sur', label: 'Sur de Quito' },
    { value: 'valle-cumbaya', label: 'Valle de Cumbayá' },
    { value: 'valle-tumbaco', label: 'Valle de Tumbaco' },
    { value: 'valle-los-chillos', label: 'Valle de los Chillos' },
    { value: 'calderon', label: 'Calderón' },
    { value: 'la-concepcion', label: 'La Concepción' },
    { value: 'otro', label: 'Otro (fuera de Quito)' },
];

// Example for future expansion
/*
export const bogotaZones = [
    { value: 'usaquen', label: 'Usaquén' },
    { value: 'chapinero', label: 'Chapinero' },
    { value: 'santa-fe', label: 'Santa Fe' },
]

export const allZones = {
    'EC': {
        'UIO': quitoZones,
    },
    'CO': {
        'BOG': bogotaZones,
    }
}
*/
