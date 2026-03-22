import { distanceToSLIIT, distanceToSLIITValue, getWalkingTime, getDrivingTime, getDistanceColor, getDistanceLabel } from '../utils/formatters';

const DistanceCalculator = ({ lat, lng }) => {
  if (!lat || !lng) return null;
  const distance = distanceToSLIIT(lat, lng);
  const distValue = distanceToSLIITValue(lat, lng);

  return (
    <div className="bg-gradient-to-r from-surface-50 to-muted-50 rounded-2xl p-5 border border-muted-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎓</span>
        <h4 className="font-bold text-gray-800">Distance to SLIIT</h4>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-primary-500">{distance}</p>
          <p className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block ${getDistanceColor(distValue)}`}>{getDistanceLabel(distValue)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg mb-1">🚶</p>
          <p className="text-sm font-bold text-gray-700">{getWalkingTime(distValue)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-lg mb-1">🚗</p>
          <p className="text-sm font-bold text-gray-700">{getDrivingTime(distValue)}</p>
        </div>
      </div>
    </div>
  );
};

export default DistanceCalculator;