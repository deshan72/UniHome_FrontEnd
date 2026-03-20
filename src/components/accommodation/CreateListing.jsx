import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAccommodation } from '../../services/accommodationService';
import { uploadSingleImage } from '../../services/uploadService';
import { ACCOMMODATION_TYPES, ROOM_TYPES, AMENITY_OPTIONS, GENDER_OPTIONS, MINIMUM_PERIODS, NEARBY_AREAS } from '../../utils/constants';
import LocationPicker from '../map/LocationPicker';

const CreateListing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Room',
    location: { lat: null, lng: null, address: '', city: '', area: '' },
    roomTypes: [{ type: 'Single', capacity: 1, totalRooms: 1, availableRooms: 1, pricePerMonth: 0 }],
    pricing: { monthlyRent: 0, deposit: 0, keyMoney: 0, billsIncluded: false, billsDescription: '' },
    totalBedrooms: 1,
    totalBathrooms: 1,
    maxOccupants: 1,
    genderPreference: 'Any',
    minimumPeriod: '6 Months',
    amenities: [],
    features: [],
    images: [],
  });

  // Image previews (local file previews before upload)
  const [imagePreviews, setImagePreviews] = useState([]);

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const updateLocation = useCallback((loc) => {
    setFormData((prev) => ({ ...prev, location: { ...prev.location, ...loc } }));
  }, []);

  // ===== Room Type Management =====
  const addRoomType = () => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: [...prev.roomTypes, { type: 'Single', capacity: 1, totalRooms: 1, availableRooms: 1, pricePerMonth: 0 }],
    }));
  };

  const updateRoomType = (index, field, value) => {
    const updated = [...formData.roomTypes];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'totalRooms') updated[index].availableRooms = value;
    setFormData((prev) => ({ ...prev, roomTypes: updated }));
  };

  const removeRoomType = (index) => {
    if (formData.roomTypes.length <= 1) return;
    setFormData((prev) => ({ ...prev, roomTypes: prev.roomTypes.filter((_, i) => i !== index) }));
  };

  // ===== Amenity Toggle =====
  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // ===== IMAGE UPLOAD FROM DEVICE =====
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file count
    const totalImages = formData.images.length + files.length;
    if (totalImages > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    // Validate each file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPEG, PNG, WebP allowed.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Max 5MB per image.`);
        return;
      }
    }

    setError('');
    setUploadingImages(true);

    // Create local previews immediately
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      uploaded: false,
      url: '',
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Upload each file to backend
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadSingleImage(files[i]);
        uploadedUrls.push(result.url);

        // Update preview status
        setImagePreviews((prev) =>
          prev.map((p) =>
            p.file === files[i] ? { ...p, uploading: false, uploaded: true, url: result.url } : p
          )
        );
      } catch (err) {
        console.error('Upload failed for:', files[i].name, err);
        // Remove failed preview
        setImagePreviews((prev) => prev.filter((p) => p.file !== files[i]));
        setError('Failed to upload: ' + files[i].name + '. Make sure backend is running.');
      }
    }

    // Add uploaded URLs to form data
    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    }

    setUploadingImages(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  // ===== Submit =====
  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.description.trim()) return setError('Description is required');
    if (!formData.location.lat || !formData.location.lng) return setError('Please pin location on map');
    if (!formData.location.city) return setError('City is required');
    if (!formData.location.address) return setError('Address is required');

    const hasPrice = formData.roomTypes.some((r) => r.pricePerMonth > 0);
    if (!hasPrice) return setError('At least one room type must have a price');

    setLoading(true);
    try {
      const lowestPrice = Math.min(...formData.roomTypes.map((r) => r.pricePerMonth));
      const submitData = {
        ...formData,
        pricing: {
          ...formData.pricing,
          monthlyRent: formData.pricing.monthlyRent || lowestPrice,
        },
      };

      await createAccommodation(submitData);
      setSuccess('✅ Listing created! Waiting for admin approval. You will be notified when approved.');
      setTimeout(() => navigate('/my-listings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;

  // Get backend URL for image display
  const getImageUrl = (url) => {
    if (url.startsWith('http')) return url;
    return (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '') + url;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ' +
                (step >= s ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500')}>{s}</div>
              {s < 5 && <div className={'w-12 sm:w-20 h-1 mx-1 rounded ' + (step > s ? 'bg-primary-500' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>Basic</span><span>Location</span><span>Rooms</span><span>Amenities</span><span>Photos</span>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">{success}</div>}

      {/* ===== Step 1: Basic Info ===== */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">📝 Basic Information</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Listing Title *</label>
            <input type="text" value={formData.title} onChange={(e) => update('title', e.target.value)}
              className="input-field" placeholder="e.g., Modern Studio Apartment near SLIIT" maxLength={100} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea value={formData.description} onChange={(e) => update('description', e.target.value)}
              className="input-field min-h-[120px] resize-y" placeholder="Describe your property in detail..." maxLength={3000} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Property Type *</label>
              <select value={formData.type} onChange={(e) => update('type', e.target.value)} className="input-field">
                {ACCOMMODATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender Preference</label>
              <select value={formData.genderPreference} onChange={(e) => update('genderPreference', e.target.value)} className="input-field">
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Bedrooms</label>
              <input type="number" min="0" value={formData.totalBedrooms} onChange={(e) => update('totalBedrooms', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Bathrooms</label>
              <input type="number" min="0" value={formData.totalBathrooms} onChange={(e) => update('totalBathrooms', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Period</label>
              <select value={formData.minimumPeriod} onChange={(e) => update('minimumPeriod', e.target.value)} className="input-field">
                {MINIMUM_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ===== Step 2: Location ===== */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">📍 Location</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
              <select value={formData.location.city} onChange={(e) => updateLocation({ city: e.target.value })} className="input-field">
                <option value="">Select City</option>
                {NEARBY_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Area</label>
              <input type="text" value={formData.location.area} onChange={(e) => updateLocation({ area: e.target.value })}
                className="input-field" placeholder="e.g., Near SLIIT Back Gate" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Address *</label>
            <input type="text" value={formData.location.address} onChange={(e) => updateLocation({ address: e.target.value })}
              className="input-field" placeholder="e.g., 23/A, Pittugala Road, Malabe" />
          </div>

          <LocationPicker
            onLocationChange={(loc) => updateLocation({ lat: loc.lat, lng: loc.lng, address: loc.address || formData.location.address })}
            initialLocation={formData.location.lat ? formData.location : null}
          />

          {formData.location.lat && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              ✅ Location pinned: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
            </div>
          )}
        </div>
      )}

      {/* ===== Step 3: Room Types & Pricing ===== */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">🛏️ Room Types & Pricing</h2>
            <button onClick={addRoomType} className="btn-secondary text-sm py-2 px-4">+ Add Room Type</button>
          </div>

          {formData.roomTypes.map((room, i) => (
            <div key={i} className="p-4 rounded-xl border-2 border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-700">Room Type {i + 1}</h4>
                {formData.roomTypes.length > 1 && (
                  <button onClick={() => removeRoomType(i)} className="text-red-500 hover:text-red-700 text-sm font-semibold">✕ Remove</button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                  <select value={room.type} onChange={(e) => updateRoomType(i, 'type', e.target.value)} className="input-field text-sm py-2">
                    {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Capacity</label>
                  <input type="number" min="1" value={room.capacity} onChange={(e) => updateRoomType(i, 'capacity', parseInt(e.target.value) || 1)} className="input-field text-sm py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Total Rooms</label>
                  <input type="number" min="1" value={room.totalRooms} onChange={(e) => updateRoomType(i, 'totalRooms', parseInt(e.target.value) || 1)} className="input-field text-sm py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Price/Month (LKR)</label>
                  <input type="number" min="0" value={room.pricePerMonth} onChange={(e) => updateRoomType(i, 'pricePerMonth', parseInt(e.target.value) || 0)} className="input-field text-sm py-2" />
                </div>
              </div>
            </div>
          ))}

          <h3 className="text-lg font-bold text-gray-900 pt-4 border-t border-gray-100">💰 Additional Charges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deposit (LKR)</label>
              <input type="number" min="0" value={formData.pricing.deposit}
                onChange={(e) => update('pricing', { ...formData.pricing, deposit: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Key Money (LKR)</label>
              <input type="number" min="0" value={formData.pricing.keyMoney}
                onChange={(e) => update('pricing', { ...formData.pricing, keyMoney: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-gray-200 w-full hover:bg-gray-50">
                <input type="checkbox" checked={formData.pricing.billsIncluded}
                  onChange={(e) => update('pricing', { ...formData.pricing, billsIncluded: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Bills Included</span>
              </label>
            </div>
          </div>

          {!formData.pricing.billsIncluded && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bills Description</label>
              <input type="text" value={formData.pricing.billsDescription}
                onChange={(e) => update('pricing', { ...formData.pricing, billsDescription: e.target.value })}
                className="input-field" placeholder="e.g., Electricity and water separate" />
            </div>
          )}
        </div>
      )}

      {/* ===== Step 4: Amenities & Features ===== */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">✨ Amenities & Features</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                  className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ' +
                    (formData.amenities.includes(amenity)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Features (comma separated)</label>
            <input type="text" value={formData.features.join(', ')}
              onChange={(e) => update('features', e.target.value.split(',').map((f) => f.trim()).filter(Boolean))}
              className="input-field" placeholder="e.g., Near Bus Stop, 24/7 Security, Quiet Area" />
          </div>
        </div>
      )}

      {/* ===== Step 5: Photos (DEVICE UPLOAD) ===== */}
      {step === 5 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">📸 Property Photos</h2>

          <p className="text-sm text-gray-500">Upload up to 10 photos. JPEG, PNG, WebP supported. Max 5MB each.</p>

          {/* Upload Button */}
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-primary-400 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">📷</span>
            </div>
            <p className="font-bold text-gray-700 mb-1">Click to Add Images</p>
            <p className="text-sm text-gray-500">Select images from your device</p>
            <p className="text-xs text-gray-400 mt-2">{formData.images.length}/10 images uploaded</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Uploading Indicator */}
          {uploadingImages && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-blue-700 font-medium">Uploading images...</span>
            </div>
          )}

          {/* Image Previews Grid */}
          {formData.images.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Images ({formData.images.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formData.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <div className="h-32 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-primary-400 transition-all">
                      <img
                        src={getImageUrl(url)}
                        alt={'Photo ' + (i + 1)}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Error'; }}
                      />
                    </div>

                    {/* Image number badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    >
                      ✕
                    </button>

                    {/* First image label */}
                    {i === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
                        Cover
                      </div>
                    )}
                  </div>
                ))}

                {/* Add More Button */}
                {formData.images.length < 10 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                  >
                    <span className="text-2xl text-gray-400 mb-1">+</span>
                    <span className="text-xs text-gray-500 font-medium">Add More</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-700 font-medium">💡 Tips for great photos:</p>
            <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>First image becomes the cover photo</li>
              <li>Include photos of rooms, bathroom, kitchen, exterior</li>
              <li>Use good lighting and clean spaces</li>
              <li>Show the surrounding area and access roads</li>
            </ul>
          </div>
        </div>
      )}

      {/* ===== Navigation Buttons ===== */}
      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
          className="btn-secondary disabled:opacity-50">
          ← Previous
        </button>

        {step < totalSteps ? (
          <button onClick={() => setStep(Math.min(totalSteps, step + 1))} className="btn-primary">
            Next →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || uploadingImages}
            className="btn-accent disabled:opacity-50">
            {loading ? '⏳ Creating...' : '✅ Create Listing'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateListing;