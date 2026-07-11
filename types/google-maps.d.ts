declare namespace google.maps {
  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  namespace places {
    class Autocomplete {
      constructor(
        input: HTMLInputElement,
        opts?: {
          componentRestrictions?: { country: string | string[] };
          fields?: string[];
        },
      );
      addListener(event: string, handler: () => void): void;
      getPlace(): {
        formatted_address?: string;
        geometry?: { location?: { lat(): number; lng(): number } };
        address_components?: GeocoderAddressComponent[];
      };
    }
  }
}

interface Window {
  google?: typeof google;
}

declare const google: {
  maps: {
    places: typeof google.maps.places;
  };
};
