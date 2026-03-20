const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin`} />
      {text && <p className="mt-4 text-gray-500 font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;