import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Location {
    id: string;
    name: string;
    city: string;
}

interface LocationContextType {
    locations: Location[];
    selectedLocation: Location | null;
    setSelectedLocation: (location: Location | null) => void;
    loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking multi-location data
        const demoLocations: Location[] = [
            { id: 'all', name: 'All Locations', city: 'Global' },
            { id: 'clinic-north', name: 'DentalAI North', city: 'Seattle' },
            { id: 'clinic-south', name: 'DentalAI South', city: 'Tacoma' },
            { id: 'clinic-east', name: 'DentalAI East', city: 'Bellevue' },
        ];

        setLocations(demoLocations);
        setSelectedLocation(demoLocations[0]);
        setLoading(false);
    }, []);

    return (
        <LocationContext.Provider value={{ locations, selectedLocation, setSelectedLocation, loading }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocations() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocations must be used within a LocationProvider');
    }
    return context;
}
