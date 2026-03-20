import AccommodationCard from './AccommodationCard';
import LoadingSpinner from '../common/LoadingSpinner';

const AccommodationList = ({ listings, loading, showStatus = false }) => {
  if (loading) return <LoadingSpinner text="Loading accommodations..." />;

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl mb-4 block">🏠</span>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Accommodations Found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <AccommodationCard key={listing._id} listing={listing} showStatus={showStatus} />
      ))}
    </div>
  );
};

export default AccommodationList;