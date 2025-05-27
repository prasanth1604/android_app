import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const UploadScreenshot = () => {
  const { taskId } = useParams(); // Now expecting taskId from the URL
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }, // Accept all image types
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a screenshot.');
      return;
    }

    const formData = new FormData();
    formData.append('screenshot', file);

    setError('');
    try {
      // Axios automatically sets Content-Type for FormData
      await axiosInstance.post(`/tasks/${taskId}/screenshots/`, formData);
      alert('Screenshot uploaded successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || 'Failed to upload screenshot.');
      console.error('Upload error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Screenshot for Task ID: {taskId}</h2>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the screenshot here ...</p>
        ) : (
          <p>Drag 'n' drop your screenshot here, or click to select file</p>
        )}
        {file && <p>Selected file: {file.name}</p>}
      </div>
      {file && <button onClick={handleUpload} style={styles.button}>Upload Screenshot</button>}
    </div>
  );
};

export default UploadScreenshot;