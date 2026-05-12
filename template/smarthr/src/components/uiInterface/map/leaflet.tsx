"use client";

import { useEffect, type ReactNode } from "react";
import L from "leaflet";
import "../../../../node_modules/leaflet/dist/leaflet.css";
import React from "react";

// ErrorBoundary for map rendering
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error if needed
    console.error("Leaflet Map Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong rendering the map.</div>;
    }
    return this.props.children;
  }
}

const LeafletComponent: React.FC = () => {
  useEffect(() => {
    const map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const shapesmap = L.map("map1").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(shapesmap);
    return () => {
      shapesmap.remove();
    };
  }, []);

  useEffect(() => {
    const popupmap = L.map("map-popup").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap",
    }).addTo(popupmap);

    const customIcon = L.icon({
      iconUrl: "assets/img/marker-icon.png",
      iconSize: [25, 40],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });

    const marker = L.marker([51.5, -0.09], { icon: customIcon }).addTo(popupmap);
    marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

    const circle = L.circle([51.508, -0.11], {
      color: "#ffc102",
      fillColor: "#ffc102",
      fillOpacity: 0.5,
      radius: 500,
    }).addTo(popupmap);
    circle.bindPopup("I am a circle.");

    const polygon = L.polygon(
      [
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047],
      ],
      {
        color: "#7b76fe",
        fillColor: "#7b76fe",
      }
    ).addTo(popupmap);
    polygon.bindPopup("I am a polygon.");

    return () => {
      popupmap.remove();
    };
  }, []);

  useEffect(() => {
    const customicon = L.map("map-custom-icon").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap",
    }).addTo(customicon);

    const greenIcon = L.icon({
      iconUrl: "assets/img/logo.svg",
      iconSize: [80, 25],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
    });

    L.marker([51.5, -0.09], { icon: greenIcon }).addTo(customicon);

    return () => {
      customicon.remove();
    };
  }, []);

  useEffect(() => {
    const geomap = L.map("interactive-map").setView([37.8, -96], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(geomap);
    return () => {
      geomap.remove();
    };
  }, []);

  return (
    <div className="page-wrapper cardhead">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Sortable JS</h3>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* Start::row-1 */}
        <div className="row">
          <div className="col-xl-6">
            <div className="card custom-card">
              <div className="card-header">
                <div className="card-title">Leaflet Map</div>
              </div>
              <div className="card-body">
                <ErrorBoundary>
                  <div id="map" />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card custom-card">
              <div className="card-header">
                <div className="card-title">
                  Map With Markers,circles and Polygons
                </div>
              </div>
              <div className="card-body">
                <ErrorBoundary>
                  <div id="map1" />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card custom-card">
              <div className="card-header">
                <div className="card-title">Map With Popup</div>
              </div>
              <div className="card-body">
                <ErrorBoundary>
                  <div id="map-popup" />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card custom-card">
              <div className="card-header">
                <div className="card-title">Map With Custom Icon</div>
              </div>
              <div className="card-body">
                <ErrorBoundary>
                  <div id="map-custom-icon" />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card custom-card">
              <div className="card-header">
                <div className="card-title">Interactive Choropleth Map</div>
              </div>
              <div className="card-body">
                <ErrorBoundary>
                  <div id="interactive-map" />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
        {/*End::row-1 */}
      </div>
    </div>
  );
};

export default LeafletComponent;
