import { useState, useCallback, useRef } from 'react';
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_MB    = 10;
export function useImageUpload({ endpoint, initialUrl = '' } = {}) {
  const [url,        setUrl]        = useState(initialUrl);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const resetToUrl = useCallback((newUrl = '') => {
    setUrl(newUrl);
    setError(null);
    setProgress(0);
  }, []);
  const clearImage = useCallback(() => {
    setUrl('');
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);
  const uploadFile = useCallback(async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, or AVIF images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('image', file);
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.success && json.url) {
                setUrl(json.url);
                setProgress(100);
                resolve(json.url);
              } else {
                reject(new Error(json.message || 'Upload failed'));
              }
            } catch {
              reject(new Error('Invalid server response'));
            }
          } else {
            try {
              const json = JSON.parse(xhr.responseText);
              reject(new Error(json.message || `Server error ${xhr.status}`));
            } catch {
              reject(new Error(`Server error ${xhr.status}`));
            }
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
        xhr.open('POST', endpoint);
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    } catch (err) {
      setError(err.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [endpoint]);
  const inputProps = {
    ref: inputRef,
    type: 'file',
    accept: ACCEPTED_TYPES.join(','),
    style: { display: 'none' },
    onChange: (e) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
  };
  const dragProps = {
    onDragEnter: (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true);  },
    onDragLeave: (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); },
    onDragOver:  (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true);  },
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    onClick: () => inputRef.current?.click(),
  };
  return {
    url,
    uploading,
    progress,
    error,
    dragActive,
    inputProps,
    dragProps,
    clearImage,
    resetToUrl,
  };
}