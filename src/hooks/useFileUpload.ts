import { useState, useRef, ChangeEvent } from 'react';
import { uploadImage } from '@/actions/upload-image';

type UploadState = {
  isUploading: boolean;
  uploadedImage?: string;
  fileName?: string;
  previewUrl?: string;
  isExampleImage?: boolean;
  exampleImageUrl?: string;
};

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({ isUploading: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploadState({ isUploading: true });

      const previewUrl = await fileToDataURL(file);
      setUploadState(prev => ({ ...prev, previewUrl, fileName: file.name }));

      const result = await uploadImage(previewUrl);

      if (result.success) {
        setUploadState({
          isUploading: false,
          uploadedImage: result.url,
          fileName: file.name,
          previewUrl
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState({ isUploading: false });
      alert('Upload failed. Please try again.');
    }
  };

  const handleExampleImage = (imageUrl: string, fileName: string = 'example-image.jpg') => {
    setUploadState({
      isUploading: false,
      previewUrl: imageUrl,
      fileName,
      isExampleImage: true,
      exampleImageUrl: imageUrl
    });
  };

  const handleRemoveUpload = () => {
    setUploadState({ isUploading: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    uploadState,
    handleFileUpload,
    handleRemoveUpload,
    handleExampleImage,
    fileInputRef
  };
}