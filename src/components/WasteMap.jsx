import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function WasteMap({ reports = [], center = [5.05, 7.91] }) {
  return (
    <MapContainer center={center} zoom={15} className="w-full h-64 rounded-xl z-0">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => (
        <Marker key={report.id} position={[report.lat, report.lng]}>
          <Popup>
            <p className="font-semibold">{report.wasteType}</p>
            <p className="text-xs text-gray-500">{report.status}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
