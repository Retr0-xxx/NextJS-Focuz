"use client";
import React, { useState, useEffect } from 'react';

export default function Img() {
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Request a snapshot at 50%
        const response = await fetch('/api/snapshot', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        // Convert response to Blob
        const blob = await response.blob();

        // Create an Object URL from the Blob
        const objectUrl = URL.createObjectURL(blob);

        // Update state so <img> can use this URL
        setImageSrc(objectUrl);
      } catch (error) {
        console.error(error);
      }
    };

    fetchImage();
  }, []);

  return (
    <div>
      <h1>Snapshot at 50%</h1>
      {imageSrc ? (
        <img src={imageSrc} alt="Video snapshot" />
      ) : (
        <p>Loading image...</p>
      )}
    </div>
  );
}
