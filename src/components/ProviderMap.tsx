
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import type { ServiceProvider } from "../types/serviceProvider";

interface ProviderMapProps {
  providers: ServiceProvider[];
  selectedProviderId?: string | null;
  onSelectProvider: (provider: ServiceProvider) => void;
}

function MapBounds({ providers }: { providers: ServiceProvider[] }) {
  const map = useMap();

  useEffect(() => {
    if (providers.length === 0) {
      map.setView([-15.385, 35.318], 13);
      return;
    }

    const bounds = L.latLngBounds(providers.map((provider) => provider.position));
    map.fitBounds(bounds.pad(0.35), { maxZoom: 15 });
  }, [providers, map]);

  return null;
}

export default function ProviderMap({
  providers,
  selectedProviderId,
  onSelectProvider,
}: ProviderMapProps) {
  return (
    <div className="provider-map">
      {providers.length === 0 ? (
        <div className="provider-map-empty">
          <strong>No providers match these filters.</strong>
          <span>Try another keyword or clear the category filter.</span>
        </div>
      ) : null}

      <MapContainer
        center={[-15.385, 35.318]}
        zoom={13}
        minZoom={12}
        maxBounds={[
          [-15.45, 35.25],
          [-15.32, 35.39],
        ]}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="provider-map-canvas"
      >
        <MapBounds providers={providers} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providers.map((provider) => {
          const isSelected = provider.id === selectedProviderId;
          const markerIcon = L.divIcon({
            className: "provider-map-marker-wrapper",
            html: `
              <span class="provider-map-marker ${isSelected ? "is-selected" : ""}">
                <span>${provider.initials}</span>
              </span>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -12],
          });

          return (
            <Marker
              key={provider.id}
              position={provider.position}
              icon={markerIcon}
            >
              <Popup>
                <div className="map-popup">
                  <p className="map-popup-category">{provider.category}</p>
                  <h3>{provider.name}</h3>
                  <p>{provider.area}</p>
                  <p>
                    ★ {provider.rating.toFixed(1)} / 5 · {provider.reviews} reviews
                  </p>
                  <button
                    type="button"
                    className="btn-brand map-popup-button"
                    onClick={() => onSelectProvider(provider)}
                  >
                    View provider
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
