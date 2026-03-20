const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

export const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';

  // Already a full URL (external link like unsplash)
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Backend uploaded file path like /uploads/image-123.jpg
  if (url.startsWith('/uploads')) {
    return getBackendUrl() + url;
  }

  // Fallback
  return getBackendUrl() + '/' + url;
};

export const getPlaceholder = (text = 'No Image') => {
  return 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(text);
};