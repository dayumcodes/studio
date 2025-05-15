
"use client";

import type { ChangeEvent } from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, AlertCircle, UploadCloud, CameraOff } from 'lucide-react';
import { recognizeFood, type RecognizeFoodInput, type RecognizeFoodOutput } from '@/ai/flows/food-recognition';
import { calculateCalories, type CalculateCaloriesInput, type CalculateCaloriesOutput } from '@/ai/flows/calorie-calculation';
import type { FoodItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface FoodRecognitionFormProps {
  onMealDataProcessed: (data: FoodItem[]) => void;
  onProcessingError: (message: string) => void;
  clearCurrentMeal: () => void;
}

export function FoodRecognitionForm({ 
  onMealDataProcessed, 
  onProcessingError,
  clearCurrentMeal 
}: FoodRecognitionFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const requestCamera = async () => {
      if (!videoRef.current && showCamera) { // Only proceed if videoRef is available and camera is shown
          // This can happen if the component unmounts or showCamera becomes false rapidly.
          // We might want to wait for videoRef.current to be set.
          // For now, let's assume if showCamera is true, videoRef should become available.
          console.warn("Video ref not available yet for camera.")
          return; 
      }

      setIsLoadingStream(true);
      setError(null);
      // setHasCameraPermission(null); // Reset before trying - causes flicker if already denied

      try {
        const streamInstance = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        activeStream = streamInstance;
        setStream(streamInstance);
        
        if (videoRef.current) {
          videoRef.current.srcObject = streamInstance;
          await videoRef.current.play().catch(playError => {
            console.warn("Video play failed, user interaction might be needed:", playError);
          });
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        let message = "Could not access the camera. Please check permissions.";
        if (err instanceof DOMException) {
          if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            message = "No camera found on this device.";
          } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            message = "Camera permission denied. Please enable it in your browser settings.";
          } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            message = "Camera is already in use or a hardware error occurred.";
          }
        }
        setHasCameraPermission(false);
        setError(message);
        toast({
          variant: 'destructive',
          title: 'Camera Access Error',
          description: message,
        });
        setShowCamera(false); 
      } finally {
        setIsLoadingStream(false);
      }
    };

    if (showCamera) {
      requestCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsLoadingStream(false);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      // Ensure state stream is also cleaned if different (e.g. rapid toggle)
      if (stream && stream !== activeStream) {
          stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, toast]);


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (showCamera) setShowCamera(false); // Turn off camera if user uploads a file
    setError(null);
    clearCurrentMeal(); // Clear any previous meal data

    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleCapturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to video's intrinsic size for best quality
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg'); // Or 'image/png'
        setImagePreview(dataUri);
        setImageFile(null); // Captured photo is a data URI, not a file object
        setShowCamera(false); // This will trigger useEffect cleanup for the stream
        clearCurrentMeal(); // Clear previous meal, new image captured
        setError(null);
      }
    }
  }, [stream, clearCurrentMeal]);

  const handleSubmit = async () => {
    if (!imagePreview) { // imagePreview is the source of truth now
      setError("Please select an image or capture a photo first.");
      return;
    }

    setError(null);
    setIsRecognizing(true);
    setIsCalculating(false);
    onProcessingError(''); 

    try {
      const recognizeInput: RecognizeFoodInput = { photoDataUri: imagePreview };
      const recognitionResult: RecognizeFoodOutput = await recognizeFood(recognizeInput);
      
      setIsRecognizing(false);
      
      if (!recognitionResult.foodItems || recognitionResult.foodItems.length === 0) {
        setError("Could not recognize any food items. Try a clearer image or different angle.");
        onProcessingError("No food items recognized.");
        return;
      }

      setIsCalculating(true);
      const calculateInput: CalculateCaloriesInput = { 
        foodItems: recognitionResult.foodItems.map(name => ({ name })) 
      };
      const calorieResult: CalculateCaloriesOutput = await calculateCalories(calculateInput);
      
      onMealDataProcessed(calorieResult);

    } catch (err) {
      console.error("AI processing error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI processing.";
      setError(errorMessage);
      onProcessingError(errorMessage);
    } finally {
      setIsRecognizing(false);
      setIsCalculating(false);
    }
  };

  const isLoading = isRecognizing || isCalculating || isLoadingStream;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Camera className="h-7 w-7 text-primary" />
          Snap or Upload Food
        </CardTitle>
        <CardDescription>Upload an image or use your camera to get calorie and nutrient information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && !showCamera && ( // Only show general error if not in camera view (camera view has its own error display)
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Button
            type="button"
            variant={!showCamera ? "default" : "outline"}
            onClick={() => {
              setShowCamera(false);
              setImagePreview(null); 
              setError(null);
              clearCurrentMeal();
            }}
            disabled={isLoading && showCamera} // disable if loading and camera is active
            className="flex-1"
          >
            <UploadCloud className="mr-2 h-5 w-5" /> Upload Image
          </Button>
          <Button
            type="button"
            variant={showCamera ? "default" : "outline"}
            onClick={() => {
              setShowCamera(true);
              setImageFile(null); 
              setImagePreview(null);
              setError(null);
              clearCurrentMeal();
            }}
            disabled={isLoading && !showCamera} // disable if loading and upload is active
            className="flex-1"
          >
            <Camera className="mr-2 h-5 w-5" /> Use Camera
          </Button>
        </div>

        {showCamera ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden border">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${(!stream || isLoadingStream) ? 'hidden' : ''}`}
                autoPlay
                muted
                playsInline
              />
              {isLoadingStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
                  <Loader2 className="h-12 w-12 animate-spin mb-2" />
                  <p>Starting camera...</p>
                </div>
              )}
              {!isLoadingStream && !stream && hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <CameraOff className="h-12 w-12 text-destructive mb-2" />
                    <p className="font-semibold text-destructive">Camera Access Denied</p>
                    <p className="text-sm text-muted-foreground">Please enable camera permissions in your browser settings.</p>
                </div>
              )}
              {!isLoadingStream && !stream && hasCameraPermission !== false && ( // Initial state or other errors before stream active
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <CameraOff className="h-12 w-12 mb-2" />
                    <p>Camera preview will appear here.</p>
                    {error && <p className="text-destructive text-sm mt-1">{error}</p>}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={handleCapturePhoto}
              disabled={isRecognizing || isCalculating || isLoadingStream || !stream || !hasCameraPermission}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" /> Capture Photo
            </Button>
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              id="food-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isRecognizing || isCalculating}
              className="file:text-primary file:font-semibold hover:file:bg-primary/10"
            />
            <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP. Max 5MB.</p>
          </div>
        )}
        
        {imagePreview && (
          <div className="mt-4 border border-dashed border-border rounded-md p-2 bg-muted/30">
            <Image
              src={imagePreview}
              alt="Selected food preview"
              width={400}
              height={300}
              className="rounded-md object-contain max-h-[300px] w-full"
              data-ai-hint="food meal"
            />
          </div>
        )}
        
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !imagePreview}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
          aria-label="Process food image"
        >
          {isRecognizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRecognizing && "Recognizing Food..."}
          {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCalculating && "Calculating Nutrients..."}
          {!isRecognizing && !isCalculating && (
            <>
              <UploadCloud className="mr-2 h-5 w-5" />
              Get Nutritional Info
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

    