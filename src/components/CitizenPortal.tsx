import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet, Trash2, Zap, Route, FileText, AlertTriangle, Send, MapPin, Camera, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { IssueCategory } from '../types';
import { useLanguage } from '../LanguageContext';
import { GovernmentSchemes } from './GovernmentSchemes';
import { SchemeCategories } from './SchemeCategories';

interface CitizenPortalProps {
  onReportIssue: (category: IssueCategory, description: string, imageUrl?: string, coordinates?: { lat: number; lng: number }) => void;
  isAuthenticated: boolean;
}

export function CitizenPortal({ onReportIssue, isAuthenticated }: CitizenPortalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [selectedCat, setSelectedCat] = useState<IssueCategory | null>(
    (initialCategory as IssueCategory) || null
  );
  const [reportText, setReportText] = useState('');
  const [reportImage, setReportImage] = useState<File | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const startCamera = async () => {
    setShowCamera(true);
    setReportImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setLocationError("Could not access camera.");
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            setReportImage(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (selectedCat) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationError('');
          },
          (error) => {
            console.error("Error getting location: ", error);
            setLocationError('Unable to retrieve location. Please allow location access.');
          }
        );
      } else {
        setLocationError('Geolocation is not supported by this browser.');
      }
    } else {
      setCoordinates(null);
      setLocationError('');
    }
  }, [selectedCat]);

  // Clear query param correctly when changing state if desired, or keep it.
  
  const handleCategoryClick = (catId: string) => {
    if (!isAuthenticated) {
      navigate(`/citizen-register?category=${catId}`);
      return;
    }
    
    if (selectedCat === catId) {
      setSelectedCat(null);
      setReportImage(null);
      stopCamera();
      setSearchParams(new URLSearchParams());
    } else {
      setSelectedCat(catId as IssueCategory);
      setSearchParams({ category: catId });
    }
  };

  const CATEGORIES = [
    { id: 'water', icon: Droplet, label: t.catWater, color: 'bg-[#F4F1EA] text-[#52796F]', border: 'border-[#E6E1D3] hover:border-[#52796F]' },
    { id: 'sanitation', icon: Trash2, label: t.catSanitation, color: 'bg-[#F4F1EA] text-[#A3B18A]', border: 'border-[#E6E1D3] hover:border-[#A3B18A]' },
    { id: 'electricity', icon: Zap, label: t.catElectricity, color: 'bg-[#F4F1EA] text-[#D46A43]', border: 'border-[#E6E1D3] hover:border-[#D46A43]' },
    { id: 'roads', icon: Route, label: t.catRoads, color: 'bg-[#F4F1EA] text-[#5A5A40]', border: 'border-[#E6E1D3] hover:border-[#5A5A40]' },
    { id: 'certificates', icon: FileText, label: t.catCertificates, color: 'bg-[#F4F1EA] text-[#8B8B7A]', border: 'border-[#E6E1D3] hover:border-[#8B8B7A]' },
    { id: 'other', icon: AlertTriangle, label: t.catOther, color: 'bg-[#F4F1EA] text-[#2C2C1E]', border: 'border-[#E6E1D3] hover:border-[#2C2C1E]' },
  ] as const;

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCat && reportText.trim()) {
      let imageUrl = undefined;
      if (reportImage) {
        imageUrl = URL.createObjectURL(reportImage);
      }
      onReportIssue(selectedCat, reportText.trim(), imageUrl, coordinates || undefined);
      setReportText('');
      setReportImage(null);
      setSelectedCat(null);
      stopCamera();
      setSearchParams(new URLSearchParams());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <SchemeCategories />
      <GovernmentSchemes />
      
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#2C2C1E]">
          {t.welcomeTitle}
        </h2>
        <p className="text-[#8B8B7A] font-medium text-sm sm:text-base">
          {t.welcomeSub}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isSelected = selectedCat === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleCategoryClick(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center p-6 sm:p-8 rounded-[24px] border transition-all focus:outline-none focus:ring-4 focus:ring-opacity-50 bg-white",
                isSelected ? `shadow-md border-[2px] ${cat.color.split(' ')[1].replace('text-', 'border-')} ring-2 ring-opacity-20 translate-y-0` : `shadow-sm hover:-translate-y-1 hover:shadow-lg ${cat.border}`,
                cat.color.split(' ')[1] // applying specific text color to container to pass to icon if needed
              )}
            >
              <div className={cn("p-4 rounded-xl mb-4 shadow-sm", cat.color.split(' ')[0])}>
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="font-bold text-[#2C2C1E] text-center text-sm sm:text-base tracking-wide">
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedCat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmitForm}
              className="mt-6 bg-white border border-[#E6E1D3] p-6 rounded-[24px] shadow-sm flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-[#8B8B7A] uppercase tracking-wider flex items-center justify-between">
                  <span>Location</span>
                  <span className="text-xs text-[#52796F] font-bold">GPS Activated</span>
                </label>
                <div className="w-full h-48 bg-[#F4F1EA] rounded-xl border border-[#E6E1D3] relative overflow-hidden flex items-center justify-center cursor-crosshair group">
                   {/* Fake map grid pattern */}
                   <div className="absolute inset-0 opacity-10 flex flex-wrap" style={{ backgroundImage: 'radial-gradient(#2C2C1E 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                   
                   <div className="text-center z-10 p-4">
                      <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-2 text-[#D46A43] group-hover:-translate-y-1 transition-transform">
                        <MapPin className="w-5 h-5" />
                      </div>
                      {coordinates ? (
                        <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest bg-white/90 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                          {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                        </p>
                      ) : locationError ? (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-white/90 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm truncate max-w-[200px]">
                          {locationError}
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest bg-white/90 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                          Acquiring GPS...
                        </p>
                      )}
                   </div>
                </div>
              </div>
              
              <label className="font-bold text-[#2C2C1E]">
                {t.enterDetails} <span className="text-[#8B8B7A] ml-1">({CATEGORIES.find(c => c.id === selectedCat)?.label})</span>
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full h-32 p-4 rounded-xl border border-[#E6E1D3] focus:border-[#5A5A40] focus:outline-none resize-none bg-[#FDFBF7] text-[#5A5A40]"
                placeholder="..."
                required
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#8B8B7A] uppercase tracking-wider">Photo / Image (Optional)</label>
                
                {showCamera ? (
                  <div className="w-full relative rounded-xl overflow-hidden bg-black/5 border border-[#E6E1D3]">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <button type="button" onClick={takePhoto} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-[#52796F]">
                        <Camera className="w-6 h-6" />
                      </button>
                      <button type="button" onClick={stopCamera} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-white border border-white/40">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {reportImage ? (
                      <div className="relative inline-block w-fit">
                        <img src={URL.createObjectURL(reportImage)} alt="Preview" className="h-32 rounded-xl object-cover border border-[#E6E1D3]" />
                        <button type="button" onClick={() => setReportImage(null)} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-[#E6E1D3] hover:border-[#52796F] text-[#8B8B7A] hover:text-[#52796F] transition-colors flex items-center justify-center gap-2 text-sm font-bold bg-[#FDFBF7]"
                        >
                          <Camera className="w-5 h-5" />
                          Take Photo
                        </button>
                        <label className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-[#E6E1D3] hover:border-[#52796F] text-[#8B8B7A] hover:text-[#52796F] transition-colors flex items-center justify-center gap-2 text-sm font-bold bg-[#FDFBF7] cursor-pointer">
                          <ImageIcon className="w-5 h-5" />
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              stopCamera();
                              setReportImage(e.target.files ? e.target.files[0] : null);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-4 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat(null);
                    setReportImage(null);
                    stopCamera();
                    setSearchParams(new URLSearchParams());
                  }}
                  className="px-6 py-2 rounded-full font-bold text-[#8B8B7A] hover:bg-[#F4F1EA] transition-colors uppercase tracking-widest text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-bold text-white bg-[#5A5A40] hover:bg-[#2C2C1E] transition-colors flex items-center gap-2 uppercase tracking-widest text-xs"
                >
                  {t.submit} <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-8 bg-[#A3B18A]/10 border border-[#E6E1D3] rounded-[24px] p-6 text-center shadow-sm">
        <p className="text-[#5A5A40] font-bold text-sm tracking-wide">{t.whatsappText}</p>
      </div>
    </div>
  );
}
