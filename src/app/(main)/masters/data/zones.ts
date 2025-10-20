
/**
 * This file contains the geographical zone configurations.
 * In a real-world, scalable application, this data would likely come from
 * a dedicated 'configurations' or 'locations' collection in Firestore,
 * allowing for dynamic management of countries, cities, and zones
 * through an admin interface without requiring code changes.
 */

export const allCountries = [
    { name: 'Ecuador', code: 'EC' },
    { name: 'Venezuela', code: 'VE' },
];

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

export const caracasZones = [
    { value: 'chacao', label: 'Chacao' },
    { value: 'baruta', label: 'Baruta' },
    { value: 'el-hatillo', label: 'El Hatillo' },
    { value: 'sucre', label: 'Sucre (Petare)' },
    { value: 'libertador-centro', label: 'Libertador (Centro)' },
]

export const allZones = {
    'EC': { // Ecuador
        'UIO': quitoZones,
    },
    'VE': { // Venezuela
        'CCS': caracasZones,
    }
}
