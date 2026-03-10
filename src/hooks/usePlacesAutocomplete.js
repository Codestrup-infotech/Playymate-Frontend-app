import { useState, useEffect, useCallback, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Hook for Google Places Autocomplete functionality
 * Provides address search and parsing capabilities
 * 
 * @param {React.RefObject} inputRef - Reference to the input element
 * @returns {Object} - { predictions, selectedPlace, isLoaded, error, parseAddress, clearSelection }
 */
export function usePlacesAutocomplete(inputRef) {
    const [predictions, setPredictions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const autocompleteServiceRef = useRef(null);
    const placesServiceRef = useRef(null);

    // Load Google Maps script
    useEffect(() => {
        // Check if already loaded
        if (window.google?.maps?.places) {
            setIsLoaded(true);
            return;
        }

        // Check if script is already being loaded
        if (document.getElementById('google-maps-script')) {
            // Wait for existing script to load
            const checkLoad = setInterval(() => {
                if (window.google?.maps?.places) {
                    setIsLoaded(true);
                    clearInterval(checkLoad);
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => setError('Failed to load Google Maps');
        document.body.appendChild(script);

        return () => {
            // Don't remove the script on unmount as it may be needed elsewhere
        };
    }, []);

    // Initialize services when loaded
    useEffect(() => {
        if (!isLoaded) return;

        try {
            const autocompleteService = new window.google.maps.places.AutocompleteService();
            const placesService = new window.google.maps.places.PlacesService(
                document.createElement('div')
            );

            autocompleteServiceRef.current = autocompleteService;
            placesServiceRef.current = placesService;
        } catch (err) {
            console.error('Error initializing Google Places services:', err);
            setError('Failed to initialize Places service');
        }
    }, [isLoaded]);

    // Get place predictions based on input
    const getPredictions = useCallback(async (input) => {
        if (!autocompleteServiceRef.current || !input) {
            setPredictions([]);
            return;
        }

        try {
            const response = await autocompleteServiceRef.current.getPlacePredictions({
                input,
                types: ['address'],
                componentRestrictions: { country: 'in' }, // Optional: restrict to India
            });

            setPredictions(response?.predictions || []);
        } catch (err) {
            console.error('Error getting predictions:', err);
            setPredictions([]);
        }
    }, []);

    // Get place details by place_id
    const getPlaceDetails = useCallback(async (placeId) => {
        if (!placesServiceRef.current || !placeId) return null;

        return new Promise((resolve, reject) => {
            placesServiceRef.current.getDetails(
                {
                    placeId,
                    fields: [
                        'place_id',
                        'address_components',
                        'geometry',
                        'formatted_address',
                        'name',
                    ],
                },
                (place, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve(place);
                    } else {
                        reject(new Error(`Failed to get place details: ${status}`));
                    }
                }
            );
        });
    }, []);

    // Parse address components from Google Places result
    const parseAddress = useCallback((place) => {
        if (!place?.address_components) {
            return {
                city: '',
                state: '',
                country: '',
                pincode: '',
                fullAddress: place?.formatted_address || '',
            };
        }

        const components = place.address_components;
        const result = {
            city: '',
            state: '',
            country: '',
            pincode: '',
            fullAddress: place.formatted_address || '',
            placeId: place.place_id,
            name: place.name || '',
        };

        components.forEach((component) => {
            const types = component.types;
            if (types.includes('locality')) {
                result.city = component.long_name;
            } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                result.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                result.state = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
                result.state = component.long_name;
            } else if (types.includes('country')) {
                result.country = component.long_name;
            } else if (types.includes('postal_code')) {
                result.pincode = component.long_name;
            }
        });

        return result;
    }, []);

    // Select a prediction and get full place details
    const selectPrediction = useCallback(async (prediction) => {
        if (!prediction?.place_id) return null;

        try {
            const place = await getPlaceDetails(prediction.place_id);
            setSelectedPlace(place);
            return place;
        } catch (err) {
            console.error('Error selecting prediction:', err);
            setError('Failed to get place details');
            return null;
        }
    }, [getPlaceDetails]);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedPlace(null);
        setPredictions([]);
    }, []);

    return {
        predictions,
        selectedPlace,
        isLoaded,
        error,
        getPredictions,
        selectPrediction,
        parseAddress,
        clearSelection,
    };
}

export default usePlacesAutocomplete;
