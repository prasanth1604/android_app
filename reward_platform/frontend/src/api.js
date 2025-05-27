import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios'; // Import axios

// --- Axios Setup ---
const API_BASE_URL = 'http://localhost:8000/api'; // IMPORTANT: Adjust this to your Django backend URL

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token for authenticated requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Only add Authorization header if it's explicitly needed or not overridden
    if (config.headers.includeAuth !== false) { // Custom header to control auth
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    // Remove the custom header so it doesn't get sent to the backend
    delete config.headers.includeAuth;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for consistent error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ detail: 'No response from server. Network error or server is down.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({ detail: error.message });
    }
  }
);