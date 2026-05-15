import { useEffect, useRef } from "react";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

const getMarkerSvg = (color) => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 24 36"><path fill="${encodeURIComponent(color)}" d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12zm0 17.5c-3.038 0-5.5-2.462-5.5-5.5S8.962 6.5 12 6.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" stroke="white" stroke-width="1"/></svg>`;
};

export default function AdminMap({ complaints }) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: new VectorSource(),
          zIndex: 10,
        })
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Default center India
        zoom: 4,
      }),
    });

    mapRef.current = map;

    return () => {
      map.setTarget(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorLayer = mapRef.current.getLayers().getArray()[1];
    const source = vectorLayer.getSource();
    source.clear();

    if (!complaints || complaints.length === 0) return;

    const features = [];
    complaints.forEach((complaint) => {
      if (complaint.latitude && complaint.longitude) {
        let color = "#3b82f6"; // Blue for Pending
        if (complaint.status === "In Progress") color = "#f97316"; // Orange
        else if (complaint.status === "Resolved") color = "#22c55e"; // Green

        const feature = new Feature({
          geometry: new Point(fromLonLat([complaint.longitude, complaint.latitude])),
          complaintId: complaint.complaintId
        });

        feature.setStyle(new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: getMarkerSvg(color),
          })
        }));

        features.push(feature);
      }
    });

    if (features.length > 0) {
      source.addFeatures(features);
      // Auto-fit bounds if we have features
      const extent = source.getExtent();
      mapRef.current.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 14, duration: 800 });
    }
  }, [complaints]);

  return <div ref={mapElement} style={{ width: '100%', height: '100%' }} />;
}
