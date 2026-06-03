// In your Dashboard or WasteReport page
import WasteMap from '../components/WasteMap';

// Example usage
const [reports, setReports] = useState([]);

// Fetch reports from Firebase
useEffect(() => {
  const fetchReports = async () => {
    const allReports = await firebaseService.getReports();
    setReports(allReports);
  };
  fetchReports();
}, []);

// In your JSX
<WasteMap 
  reports={reports}
  center={[6.5244, 3.3792]} // Lagos coordinates
  height="450px"
  showUserLocation={true}
  onMarkerClick={(report) => {
    console.log('Clicked report:', report);
    // Navigate to report details or show modal
  }}
/>