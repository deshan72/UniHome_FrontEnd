import API from './api';

export const uploadSingleImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await API.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const uploadMultipleImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await API.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};