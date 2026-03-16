import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
        async function fetchLocations() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('locations')
                    .select('*')
                    .order('name', { ascending: true });

                if (error) throw error;

                const allOption: Location = { id: 'all', name: 'All Locations', city: 'Global' };
                const fetchedLocations = data || [];
                
                // If no locations found, add some defaults or just the 'All' option
                const finalLocations = [allOption, ...fetchedLocations];
                
                setLocations(finalLocations);
                setSelectedLocation(allOption);
            } catch (err) {
                console.error('Error fetching locations:', err);
                // Fallback to minimal set if fetch fails
                const fallback = [{ id: 'all', name: 'All Locations', city: 'Global' }];
                setLocations(fallback);
                setSelectedLocation(fallback[0]);
            } finally {
                setLoading(false);
            }
        }

        fetchLocations();
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
