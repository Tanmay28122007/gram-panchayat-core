import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet, Trash2, Zap, Route, FileText, AlertTriangle, Send, MapPin, Camera, Image as ImageIcon, X, File, FileBox } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { IssueCategory, Attachment } from '../types';
import { useLanguage } from '../LanguageContext';
import { GovernmentSchemes } from './GovernmentSchemes';
import { SchemeCategories } from './SchemeCategories';

interface CitizenPortalProps {
  onReportIssue: (category: IssueCategory, description: string, locationStr: string, attachments?: Attachment[], coordinates?: { lat: number; lng: number }) => void;
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
  const [files, setFiles] = useState<{file: File, source: 'camera' | 'upload'}[]>([]);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  const VILLAGES = [
    'Anandpura', 'Aspa', 'Babipura', 'Badarpur', 'Bajpura', 'Champa', 'Chandpur', 'Chhabaliya', 
    'Dabu', 'Ganeshpura', 'Hajipur', 'Jagapura', 'Jaska', 'Kahipur', 'Kamalpur', 'Karbatiya', 
    'Karshanpura', 'Kesimpa', 'Khanpur', 'Khatasana', 'Khatoda', 'Malekpur', 'Mirjhapur', 
    'Molipur', 'Navapura', 'Pipaldar', 'Rajpur', 'Sabalpur', 'Sarna', 'Shahpur', 'Shekhpur', 
    'Shobhasan', 'Sipor', 'Sulipur', 'Sultanpur', 'Sundhiya', 'Transvad', 'Undani', 'Undhai', 
    'Vaghadi', 'Vaghdi', 'Valasana'
  ];
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const startCamera = async () => {
    setShowCamera(true);
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
            try {
              const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
              setFiles(prev => [...prev, { file, source: 'camera' }]);
            } catch (e) {
              const fallbackFile: any = blob;
              fallbackFile.name = `camera_capture_${Date.now()}.jpg`;
              fallbackFile.lastModified = Date.now();
              setFiles(prev => [...prev, { file: fallbackFile, source: 'camera' }]);
            }
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

  // Simulate a central Vadnagar location
  const VADNAGAR_LAT = 23.7885;
  const VADNAGAR_LNG = 72.6394;
  const SERVICE_RADIUS_KM = 20;

  useEffect(() => {
    if (selectedCat) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCoordinates({ lat, lng });
            
            // Simple distance check (Haversine approx for small distances)
            const R = 6371; // Earth radius in km
            const dLat = (lat - VADNAGAR_LAT) * Math.PI / 180;
            const dLon = (lng - VADNAGAR_LNG) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(VADNAGAR_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            if (distance <= SERVICE_RADIUS_KM) {
              // Mock nearest village based on a pseudo-random hash of coords
              const hash = Math.floor((lat + lng) * 10000);
              const nearest = VILLAGES[hash % VILLAGES.length];
              setSelectedVillage(nearest);
              setLocationError('');
            } else {
              setLocationError('GPS location is outside the supported Panchayat jurisdiction (Vadnagar Taluka). Please select your village manually.');
              setSelectedVillage('');
            }
          },
          (error) => {
            console.error("Error getting location: ", error);
            setLocationError('Unable to retrieve location. Please select your village manually.');
          }
        );
      } else {
        setLocationError('Geolocation is not supported by this browser.');
      }
    } else {
      setCoordinates(null);
      setLocationError('');
      setSelectedVillage('');
    }
  }, [selectedCat]);

  const handleCategoryClick = (catId: string) => {
    if (!isAuthenticated) {
      navigate(`/citizen-register?category=${catId}`);
      return;
    }
    
    if (selectedCat === catId) {
      setSelectedCat(null);
      setFiles([]);
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

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCat && reportText.trim()) {
      const attachmentsUrls: Attachment[] = [];
      
      for (const item of files) {
        const file = item.file;
        let type: Attachment['type'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type === 'application/pdf') type = 'pdf';
        
        const timestamp = new Date().toISOString();
        
        // Convert to Base64 to store in Firestore for demo purposes
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        attachmentsUrls.push({
          url: base64Data,
          type,
          name: file.name,
          source: item.source,
          timestamp,
        });
      }

      onReportIssue(selectedCat, reportText.trim(), `${selectedVillage}, Vadnagar`, attachmentsUrls.length ? attachmentsUrls : undefined, coordinates || undefined);
      setReportText('');
      setFiles([]);
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
                cat.color.split(' ')[1]
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
                  {selectedVillage ? (
                    <span className="text-xs text-[#52796F] font-bold">Location Verified ✓</span>
                  ) : (
                    <span className="text-xs text-red-500 font-bold">Verification Pending</span>
                  )}
                </label>
                
                <div className="flex flex-col gap-3">
                  <div className="w-full h-24 bg-[#F4F1EA] rounded-xl border border-[#E6E1D3] relative overflow-hidden flex items-center justify-center p-4">
                     <div className="absolute inset-0 opacity-10 flex flex-wrap" style={{ backgroundImage: 'radial-gradient(#2C2C1E 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                     
                     <div className="relative z-10 flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center shrink-0 text-[#D46A43]">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          {selectedVillage ? (
                            <>
                              <p className="text-sm font-bold text-[#2C2C1E]">{selectedVillage}, Vadnagar</p>
                              {coordinates && <p className="text-[10px] uppercase text-[#8B8B7A] font-medium tracking-widest mt-0.5">GPS: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</p>}
                            </>
                          ) : locationError ? (
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-tight">
                              {locationError}
                            </p>
                          ) : (
                            <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest">
                              Acquiring GPS...
                            </p>
                          )}
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={selectedVillage}
                      onChange={(e) => {
                        setSelectedVillage(e.target.value);
                        setLocationError('');
                      }}
                      required
                      className="flex-1 bg-white border border-[#E6E1D3] rounded-xl px-4 py-3 text-sm font-bold text-[#2C2C1E] focus:outline-none focus:border-[#5A5A40] appearance-none"
                    >
                      <option value="" disabled>Select Village (Vadnagar Taluka)</option>
                      {VILLAGES.map(v => (
                        <option key={v} value={v}>{v}, Vadnagar</option>
                      ))}
                    </select>
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
                <label className="text-sm font-bold text-[#8B8B7A] uppercase tracking-wider flex items-center justify-between">
                  <span>Supporting Files</span>
                  <span className="text-xs text-[#8B8B7A] font-normal lowercase">{files.length} attached</span>
                </label>
                
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
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {files.map(({ file, source }, index) => (
                          <div key={index} className="relative inline-block w-fit">
                            {file.type.startsWith('image/') ? (
                              <img src={URL.createObjectURL(file)} alt="Preview" className="h-20 w-20 rounded-xl object-cover border border-[#E6E1D3]" />
                            ) : (
                              <div className="h-20 w-20 rounded-xl border border-[#E6E1D3] bg-[#F4F1EA] flex flex-col items-center justify-center gap-1">
                                <FileBox className="w-6 h-6 text-[#5A5A40]" />
                                <span className="text-[9px] font-bold text-center px-1 truncate w-full">{file.name}</span>
                              </div>
                            )}
                            <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-100">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                        <File className="w-5 h-5" />
                        Attach Files
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,application/pdf,.doc,.docx"
                          onChange={(e) => {
                            stopCamera();
                            if (e.target.files) {
                              const uploaded = Array.from(e.target.files).map(f => ({ file: f, source: 'upload' as const }));
                              setFiles(prev => [...prev, ...uploaded]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat(null);
                    setFiles([]);
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
