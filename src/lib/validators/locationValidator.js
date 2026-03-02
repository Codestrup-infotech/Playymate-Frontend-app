/**
 * Location validation utilities
 * Validates coordinate ranges and location data according to API specification
 */

/**
 * Validates latitude is within valid range (-90 to 90)
 * @param {number} lat - Latitude to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export function validateLatitude(lat) {
    if (lat === undefined || lat === null || isNaN(lat)) {
        return { isValid: false, error: 'Latitude is required' };
    }
    
    if (lat < -90 || lat > 90) {
        return { isValid: false, error: 'Latitude must be between -90 and 90' };
    }
    
    return { isValid: true };
}

/**
 * Validates longitude is within valid range (-180 to 180)
 * @param {number} lng - Longitude to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export function validateLongitude(lng) {
    if (lng === undefined || lng === null || isNaN(lng)) {
        return { isValid: false, error: 'Longitude is required' };
    }
    
    if (lng < -180 || lng > 180) {
        return { isValid: false, error: 'Longitude must be between -180 and 180' };
    }
    
    return { isValid: true };
}

/**
 * Validates coordinates (lat/lng)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateCoordinates(lat, lng) {
    const errors = [];
    
    const latValidation = validateLatitude(lat);
    if (!latValidation.isValid) {
        errors.push(latValidation.error);
    }
    
    const lngValidation = validateLongitude(lng);
    if (!lngValidation.isValid) {
        errors.push(lngValidation.error);
    }
    
    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validates GeoJSON Point coordinates [lng, lat]
 * @param {number[]} coordinates - Array of [longitude, latitude]
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateGeoJSONCoordinates(coordinates) {
    const errors = [];
    
    if (!Array.isArray(coordinates)) {
        return { isValid: false, errors: ['Coordinates must be an array'] };
    }
    
    if (coordinates.length !== 2) {
        return { isValid: false, errors: ['Coordinates must contain exactly 2 values [lng, lat]'] };
    }
    
    const [lng, lat] = coordinates;
    
    if (lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
    }
    
    if (lng < -180 || lng > 180) {
        errors.push('Longitude must be between -180 and 180');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validates the complete location data
 * @param {Object} data - Location data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateLocationData(data) {
    const errors = [];
    
    // Check that at least one location method is provided
    const hasPlaceId = data?.place_id && typeof data.place_id === 'string';
    const hasCoords = data?.lat != null && data?.lng != null;
    const hasGeoJson = data?.location?.type === 'Point' && Array.isArray(data.location.coordinates);
    
    if (!hasPlaceId && !hasCoords && !hasGeoJson) {
        errors.push('Please provide location (place_id, coordinates, or GeoJSON location object)');
    }
    
    // Validate coordinates if provided
    if (hasCoords) {
        const coordValidation = validateCoordinates(data.lat, data.lng);
        errors.push(...coordValidation.errors);
    }
    
    // Validate GeoJSON if provided
    if (hasGeoJson) {
        const geoJsonValidation = validateGeoJSONCoordinates(data.location.coordinates);
        errors.push(...geoJsonValidation.errors);
    }
    
    // Validate place_id if provided
    if (hasPlaceId && data.place_id.length < 5) {
        errors.push('Invalid place_id format');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validates address data
 * @param {Object} address - Address components
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateAddress(address) {
    const errors = [];
    
    if (!address) {
        return { isValid: true, errors: [] }; // Address is optional
    }
    
    if (typeof address !== 'object') {
        return { isValid: false, errors: ['Address must be an object'] };
    }
    
    // Validate pincode if provided
    if (address.pincode) {
        // Indian pincode validation (6 digits)
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(address.pincode)) {
            errors.push('Invalid pincode format (should be 6 digits)');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
    };
}

export default {
    validateLatitude,
    validateLongitude,
    validateCoordinates,
    validateGeoJSONCoordinates,
    validateLocationData,
    validateAddress,
};
