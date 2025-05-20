
"use client";

import type { ChangeEvent } from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, AlertCircle, UploadCloud, CameraOff, ImagePlus, Video, CheckCircle2 } from 'lucide-react';
import { recognizeFood, type RecognizeFoodInput, type RecognizeFoodOutput } from '@/ai/flows/food-recognition';
import { calculateCalories, type CalculateCaloriesInput, type CalculateCaloriesOutput } from '@/ai/flows/calorie-calculation';
import type { FoodItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

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

  const [currentMode, setCurrentMode] = useState<'upload' | 'camera'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect manages the camera stream based on currentMode
    if (currentMode === 'camera') {
      let activeStreamInstance: MediaStream | null = null;

      const requestAndSetupCamera = async () => {
        setIsLoadingStream(true);
        setError(null);
        setHasCameraPermission(null);

        try {
          let streamAttempt = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          activeStreamInstance = streamAttempt;
          setStream(streamAttempt);

          if (videoRef.current) {
            videoRef.current.srcObject = streamAttempt;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(playError => {
                console.warn("Video play failed:", playError);
              });
            };
          }
          setHasCameraPermission(true);
        } catch (err) {
          console.error("Error accessing primary camera:", err);
          let message = "Could not access the camera. Please check permissions.";

          if (err instanceof DOMException) {
            if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
              message = "No camera found on this device.";
            } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
              message = "Camera permission denied. Please enable it in your browser settings.";
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError" || err.name === "OverconstrainedError") {
              message = "Camera is already in use, a hardware error occurred, or initial constraints are not supported.";
              // Try with simpler constraints as a fallback if environment facingMode failed
              if (err.name === "OverconstrainedError" || (err.message && err.message.toLowerCase().includes("overconstrained"))) {
                 console.warn("OverconstrainedError with facingMode: environment. Trying fallback video:true");
                 message = "Rear camera might not be accessible, trying default camera."
                 toast({ variant: 'default', title: 'Camera Info', description: message });
                 try {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    activeStreamInstance = fallbackStream;
                    setStream(fallbackStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                        videoRef.current.onloadedmetadata = () => { // Ensure play is attempted for fallback too
                            videoRef.current?.play().catch(playError => console.warn("Fallback video play failed:", playError));
                        };
                    }
                    setHasCameraPermission(true);
                    setError(null); // Clear previous constraint error
                    setIsLoadingStream(false);
                    return; // Exit after successful fallback
                 } catch (fallbackErr) {
                    console.error("Fallback camera access also failed:", fallbackErr);
                    message = "Could not access any camera. Please check permissions and ensure no other app is using it.";
                 }
              }
            }
          }
          // If we reach here, either the primary attempt failed for non-Overconstrained reasons, or fallback also failed
          setHasCameraPermission(false);
          setError(message);
          toast({ variant: 'destructive', title: 'Camera Access Error', description: message });
          setCurrentMode('upload');
        } finally {
          setIsLoadingStream(false);
        }
      };

      requestAndSetupCamera();

      return () => {
        // Cleanup for *this* effect instance's stream
        if (activeStreamInstance) {
          activeStreamInstance.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null; // Ensure video src is cleared
          videoRef.current.onloadedmetadata = null; // Remove event listener
        }
        setStream(null); // Clear the global stream state
      };
    } else {
      // Explicitly clean up if mode is not 'camera' (e.g., switching to 'upload')
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null;
      }
      setHasCameraPermission(null); // Reset permission status
    }
  }, [currentMode, toast]); // Dependencies only currentMode and toast

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    clearCurrentMeal();

    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size exceeds 5MB. Please choose a smaller file.");
        toast({ variant: "destructive", title: "File Too Large", description: "Image size must be 5MB or less."});
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
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

      // Ensure video is playing and has dimensions
      if (video.readyState < video.HAVE_METADATA || video.videoWidth === 0 || video.videoHeight === 0) {
        toast({ variant: "destructive", title: "Camera Not Ready", description: "Please wait for the camera preview to start."});
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg', 0.9);
        setImagePreview(dataUri);
        setImageFile(null);
        clearCurrentMeal();
        setError(null);
        toast({ title: "Photo Captured!", description: "Review your photo below or retake.", variant: "default" });
         // Optionally, switch off camera stream after capture to save battery,
         // but user might want to retake. For now, keep stream active.
         // setCurrentMode('upload'); // Or a new mode 'previewing-capture'
      }
    } else {
      toast({ variant: "destructive", title: "Capture Failed", description: "Camera stream not available or not ready."});
    }
  }, [stream, clearCurrentMeal, toast]);

  const handleSubmit = async () => {
    if (!imagePreview) {
      setError("Please select an image or capture a photo first.");
      toast({ variant: "destructive", title: "No Image", description: "Upload or capture an image to proceed."});
      return;
    }

    setError(null);
    setIsRecognizing(true);
    setIsCalculating(false);
    onProcessingError('');

    try {
      const recognizeInput: RecognizeFoodInput = { photoDataUri: imagePreview };
      const recognitionResult: RecognizeFoodOutput = await recognizeFood(recognizeInput);

      if (!recognitionResult.isFood) {
        const notFoodMessage = "The image does not appear to contain food. Please try a different image.";
        setError(notFoodMessage);
        onProcessingError(notFoodMessage);
        setIsRecognizing(false);
        toast({ variant: "destructive", title: "Not Food", description: notFoodMessage });
        return;
      }

      setIsRecognizing(false);

      if (!recognitionResult.foodItems || recognitionResult.foodItems.length === 0) {
        const noItemsMessage = "Could not recognize any specific food items. Try a clearer image or different angle.";
        setError(noItemsMessage);
        onProcessingError(noItemsMessage);
        toast({ variant: "destructive", title: "No Items Recognized", description: noItemsMessage });
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
      toast({ variant: "destructive", title: "Processing Error", description: errorMessage });
    } finally {
      setIsRecognizing(false);
      setIsCalculating(false);
    }
  };

  const isLoading = isRecognizing || isCalculating || isLoadingStream;
  const canSubmit = imagePreview && !isLoading;

  return (
    <Card className="w-full shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
          <Camera className="h-8 w-8 text-primary" />
          Snap Your Meal
        </CardTitle>
        <CardDescription>Upload an image or use your camera. We'll do the rest!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {error && !isLoadingStream && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={currentMode === 'upload' ? "default" : "outline"}
            onClick={() => {
              setCurrentMode('upload');
              if (imagePreview && !imageFile) setImagePreview(null);
              setError(null);
            }}
            disabled={isLoading && currentMode !== 'upload'}
            className="py-6 text-base transition-all duration-150 ease-in-out"
          >
            <UploadCloud className="mr-2 h-5 w-5" /> Upload Image
          </Button>
          <Button
            type="button"
            variant={currentMode === 'camera' ? "default" : "outline"}
            onClick={() => {
              setCurrentMode('camera');
              if (imageFile) {
                setImageFile(null);
                setImagePreview(null);
              }
              setError(null);
            }}
            disabled={isLoading && currentMode !== 'camera'}
            className="py-6 text-base transition-all duration-150 ease-in-out"
          >
            <Video className="mr-2 h-5 w-5" /> Use Camera
          </Button>
        </div>

        {currentMode === 'camera' ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors">
              <video
                ref={videoRef}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  (!stream || isLoadingStream) ? 'opacity-0' : 'opacity-100'
                )}
                autoPlay
                muted
                playsInline
                aria-label="Camera feed"
              />
              {isLoadingStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 bg-background/80 backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 animate-spin mb-3 text-primary" />
                  <p className="font-medium">Starting camera...</p>
                  <p className="text-sm">Please wait a moment.</p>
                </div>
              )}
              {!isLoadingStream && !stream && hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-destructive/10">
                    <CameraOff className="h-16 w-16 text-destructive mb-3" />
                    <p className="font-semibold text-destructive text-lg">Camera Access Denied</p>
                    <p className="text-sm text-muted-foreground">Enable permissions in browser settings.</p>
                </div>
              )}
              {!isLoadingStream && !stream && hasCameraPermission !== false && !imagePreview && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <CameraOff className="h-16 w-16 mb-3" />
                    <p className="font-medium">Camera Preview</p>
                    <p className="text-sm">Aim at your food and capture!</p>
                    {/* Error is displayed globally now, so no need for specific error here unless it's a non-blocking camera warning */}
                </div>
              )}
               {imagePreview && (!stream || currentMode !== 'camera') && ( // Show captured/uploaded photo
                <div className="absolute inset-0 p-1">
                  <Image
                    src={imagePreview}
                    alt="Food preview"
                    layout="fill"
                    className="rounded-md object-contain"
                    data-ai-hint="food meal"
                  />
                </div>
              )}
               {imagePreview && currentMode === 'camera' && stream && ( // Show captured photo while camera stream is still technically active
                  <div className="absolute inset-0 p-1 bg-background/50 backdrop-blur-sm">
                     <Image
                        src={imagePreview}
                        alt="Captured food preview"
                        layout="fill"
                        className="rounded-md object-contain"
                        data-ai-hint="food meal"
                     />
                  </div>
               )}
            </div>
            <Button
              type="button"
              onClick={handleCapturePhoto}
              disabled={isRecognizing || isCalculating || isLoadingStream || !stream || !hasCameraPermission}
              className="w-full py-3 text-base"
              variant="secondary"
            >
              <Camera className="mr-2 h-5 w-5" /> {imagePreview && currentMode === 'camera' ? 'Retake Photo' : 'Capture Photo'}
            </Button>
            <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
          </div>
        ) : ( // Upload Mode
          <div className="space-y-3">
            <label
              htmlFor="food-image-upload"
              className={cn(
                "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors",
                imagePreview ? "border-primary" : "border-border hover:border-primary/70"
              )}
            >
              {imagePreview ? (
                <div className="relative w-full h-full p-2">
                   <Image
                    src={imagePreview}
                    alt="Selected food preview"
                    layout="fill"
                    className="rounded-md object-contain"
                    data-ai-hint="food meal"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                  <p className="mb-2 text-sm text-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              )}
              <Input
                id="food-image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isRecognizing || isCalculating}
                className="hidden"
              />
            </label>
             {imagePreview && (
              <Button variant="outline" size="sm" onClick={() => { setImagePreview(null); setImageFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; clearCurrentMeal(); }} className="w-full">
                <ImagePlus className="mr-2 h-4 w-4" /> Change Image
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-muted/30">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-3 text-lg font-semibold transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-100"
          aria-label="Process food image and get nutritional info"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isRecognizing && "Recognizing Food..."}
          {isCalculating && "Calculating Nutrients..."}
          {!isLoading && (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Get Nutritional Info
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
