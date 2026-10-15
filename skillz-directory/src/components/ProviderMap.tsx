
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import type { Provider } from "../types/provider";

interface ProviderMapProps {
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
}

export default function ProviderMap({
  providers,
  onSelectProvider,
}: ProviderMapProps) {
  return (
    <div className="provider-map">
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={provider.position}
          >
            <Popup>
              <div className="map-popup">
                <p className="map-popup-category">
                  {provider.category}
                </p>

                <h3>{provider.name}</h3>

                <p>{provider.area}</p>

                <p>
                  ★ {provider.rating.toFixed(1)} / 5
                  {" · "}
                  {provider.reviews} reviews
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
        ))}
      </MapContainer>
    </div>
  );
}
