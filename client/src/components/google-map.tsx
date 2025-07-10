import { useEffect, useRef } from 'react';
import { MapPinIcon } from 'lucide-react';

interface GoogleMapProps {
  lat: number;
  lng: number;
  title: string;
  address: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMap({ lat, lng, title, address, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Fetch API key from server
      const getApiKey = async () => {
        try {
          const response = await fetch('/api/config');
          const config = await response.json();
          return config.googleMapsApiKey;
        } catch (error) {
          console.error('Failed to fetch API key:', error);
          return null;
        }
      };

      // Create script tag for Google Maps API
      const apiKey = await getApiKey();
      if (!apiKey) {
        console.error('Google Maps API key not available');
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        delete window.initMap;
      };
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      };

      mapInstance.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add marker for the property
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: title,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#dc2626">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">${title}</h3>
            <p style="margin: 0; font-size: 14px; color: #666;">${address}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      // Show info window by default
      infoWindow.open(mapInstance.current, marker);
    };

    loadGoogleMaps().catch(console.error);
  }, [lat, lng, title, address]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!window.google && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPinIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}