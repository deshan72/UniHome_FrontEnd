const StarRating = ({ rating, reviewCount, size = 'sm' }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const sz = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl';

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex ${sz}`}>
        {[...Array(full)].map((_, i) => <span key={`f${i}`} className="text-yellow-400">★</span>)}
        {half && <span className="text-yellow-400">★</span>}
        {[...Array(empty)].map((_, i) => <span key={`e${i}`} className="text-gray-300">★</span>)}
      </div>
      <span className="text-gray-600 font-semibold text-sm">{rating}</span>
      {reviewCount !== undefined && <span className="text-gray-400 text-xs">({reviewCount})</span>}
    </div>
  );
};

export default StarRating;