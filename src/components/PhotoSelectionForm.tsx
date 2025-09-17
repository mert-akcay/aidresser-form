import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SelectionCard } from './SelectionCard';
import { ResponsePage } from './ResponsePage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

// Import images
import poseConfident from '@/assets/pose-confident.jpg';
import poseCasual from '@/assets/pose-casual.jpg';
import poseCreative from '@/assets/pose-creative.jpg';
import poseFormal from '@/assets/pose-formal.jpg';

import bgWhite from '@/assets/bg-white.jpg';
import bgUrban from '@/assets/bg-urban.jpg';
import bgNature from '@/assets/bg-nature.png';
import bgOffice from '@/assets/bg-office.jpg';

import positionFront from '@/assets/position-front.jpg';
import positionBack from '@/assets/position-back.jpg';
import positionLeft from '@/assets/position-left.jpg';
import positionRight from '@/assets/position-right.jpg';

import man1 from '@/assets/model-man1.webp';
import man2 from '@/assets/model-man2.webp';
import woman1 from '@/assets/model-woman1.webp';
import woman2 from '@/assets/model-woman2.webp';
import woman3 from '@/assets/model-woman3.webp';

interface FormData {
  poseId: string;
  backgroundId: string;
  positionId: string;
  modelId: string;
  uniqueId: string;
  clothingPhoto: File | null;
}

const poseOptions = [
  { id: 'confident', image: poseConfident, description: 'Güvenli Duruş' },
  { id: 'casual', image: poseCasual, description: 'Rahat Duruş' },
  { id: 'creative', image: poseCreative, description: 'Yaratıcı Duruş' },
  { id: 'formal', image: poseFormal, description: 'Formal Duruş' },
];

const backgroundOptions = [
  { id: 'white', image: bgWhite, description: 'Beyaz Stüdyo' },
  { id: 'urban', image: bgUrban, description: 'Şehir Manzarası' },
  { id: 'nature', image: bgNature, description: 'Doğal Ortam' },
  { id: 'office', image: bgOffice, description: 'Ofis Ortamı' },
];

const positionOptions = [
  { id: 'front', image: positionFront, description: 'Ön Pozisyon' },
  { id: 'back', image: positionBack, description: 'Arka Pozisyon' },
  { id: 'left', image: positionLeft, description: 'Sol Pozisyon' },
  { id: 'right', image: positionRight, description: 'Sağ Pozisyon' },
];

const modelOptions = [
  { id: 'model1', image: man1, description: 'Model 1' },
  { id: 'model2', image: man2, description: 'Model 2' },
  { id: 'model3', image: woman1, description: 'Model 3' },
  { id: 'model4', image: woman2, description: 'Model 4' },
  { id: 'model5', image: woman3, description: 'Model 5' },
];

export const PhotoSelectionForm = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const location = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    poseId: '',
    backgroundId: '',
    positionId: '',
    modelId: '',
    uniqueId: uniqueId || '',
    clothingPhoto: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseType, setResponseType] = useState<'success' | 'badrequest' | 'maxretrycount' | 'timesup' | null>(null);

  // If there's a response, show the response page
  if (responseType) {
    return <ResponsePage responseType={responseType} />;
  }
  
  // Unique ID yoksa formu gösterme
  if (!uniqueId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 flex items-center justify-center">
        <Card className="p-8 shadow-[var(--shadow-card)] backdrop-blur-sm bg-gradient-to-br from-card to-card/90 max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Geçersiz Erişim
          </h1>
          <p className="text-muted-foreground mb-4">
            Bu sayfaya erişmek için geçerli bir ID gereklidir.
          </p>
          <p className="text-sm text-muted-foreground">
            Lütfen doğru URL ile tekrar deneyin: <br />
            <code className="bg-secondary px-2 py-1 rounded text-xs">
              /your-unique-id
            </code>
          </p>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poseId || !formData.backgroundId || !formData.positionId || !formData.modelId || !formData.clothingPhoto) {
      toast({
        title: "Hata",
        description: "Lütfen tüm seçimleri yapınız ve giysi fotoğrafı yükleyiniz.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('poseId', formData.poseId);
      submitFormData.append('backgroundId', formData.backgroundId);
      submitFormData.append('positionId', formData.positionId);
      submitFormData.append('modelId', formData.modelId);
      submitFormData.append('uniqueId', formData.uniqueId);
      if (formData.clothingPhoto) {
        submitFormData.append('clothingPhoto', formData.clothingPhoto);
      }

      const response = await fetch('https://n8n.mertakcay.com/webhook/34e675a6-20cb-4461-b097-5bcbf221e24f', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        // Handle HTTP errors
        setResponseType('badrequest');
        return;
      }

      // Parse the response JSON
      const responseData = await response.json();
      
      // Handle different response types based on the "respond" field
      if (responseData.respond === 'success') {
        setResponseType('success');
      } else if (responseData.respond === 'badrequest') {
        setResponseType('badrequest');
      } else if (responseData.respond === 'maxretrycount') {
        setResponseType('maxretrycount');
      } else if (responseData.respond === 'timesup') {
        setResponseType('timesup');
      } else {
        // Fallback for unknown response
        setResponseType('badrequest');
      }
      
    } catch (error) {
      console.error('Form gönderim hatası:', error);
      // Show bad request page on network errors
      setResponseType('badrequest');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 shadow-[var(--shadow-card)] backdrop-blur-sm bg-gradient-to-br from-card to-card/90">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Fotoğraf Seçim Formu
            </h1>
            <p className="text-muted-foreground">
              Lütfen tercihinize uygun seçenekleri seçiniz
            </p>
            {uniqueId && (
              <p className="text-xs text-muted-foreground mt-2">
                ID: {uniqueId}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Model Seçimi */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Model Seç
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {modelOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div
                      className={`
                        relative cursor-pointer rounded-xl overflow-hidden aspect-square
                        bg-gradient-to-br from-card to-secondary/50
                        border-2 transition-all duration-300 ease-out
                        hover:scale-105 hover:shadow-lg flex items-center justify-center
                        ${formData.modelId === option.id 
                          ? "border-primary shadow-[var(--shadow-selected)] scale-105" 
                          : "border-border hover:border-primary/50"
                        }
                      `}
                      onClick={() => setFormData({ ...formData, modelId: option.id })}
                    >
                      {option.image ? (
                        <img 
                          src={option.image} 
                          alt={option.description}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                            <span className="text-lg font-semibold">{option.id.slice(-1)}</span>
                          </div>
                          <span className="text-xs text-center">Fotoğraf<br/>Eklenecek</span>
                        </div>
                      )}
                      
                      {formData.modelId === option.id && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <svg 
                              className="w-4 h-4 text-primary-foreground" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-center text-card-foreground">
                      {option.description}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Poz Seçimi */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Poz Seçiniz
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {poseOptions.map((option) => (
                  <SelectionCard
                    key={option.id}
                    id={option.id}
                    image={option.image}
                    description={option.description}
                    selected={formData.poseId === option.id}
                    onClick={(id) => setFormData({ ...formData, poseId: id })}
                  />
                ))}
              </div>
            </div>

            {/* Arka Plan Seçimi */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Arka Plan Seçiniz
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {backgroundOptions.map((option) => (
                  <SelectionCard
                    key={option.id}
                    id={option.id}
                    image={option.image}
                    description={option.description}
                    selected={formData.backgroundId === option.id}
                    onClick={(id) => setFormData({ ...formData, backgroundId: id })}
                  />
                ))}
              </div>
            </div>

            {/* Pozisyon Seçimi */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Pozisyon Seçiniz
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {positionOptions.map((option) => (
                  <SelectionCard
                    key={option.id}
                    id={option.id}
                    image={option.image}
                    description={option.description}
                    selected={formData.positionId === option.id}
                    onClick={(id) => setFormData({ ...formData, positionId: id })}
                  />
                ))}
              </div>
            </div>

            {/* Giysi Fotoğrafı */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Giysi Fotoğrafı
              </h2>
              <div className="space-y-4">
                {formData.clothingPhoto ? (
                  <div className="relative">
                    <div className="aspect-video rounded-lg overflow-hidden bg-secondary/20 border-2 border-dashed border-border">
                      <img 
                        src={URL.createObjectURL(formData.clothingPhoto)} 
                        alt="Seçilen giysi" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, clothingPhoto: null })}
                      className="absolute top-2 right-2 w-8 h-8 bg-destructive hover:bg-destructive/90 rounded-full flex items-center justify-center text-destructive-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      id="photo-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, clothingPhoto: file });
                        }
                      }}
                    />
                    <label
                      htmlFor="photo-input"
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                    >
                      <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                      <span className="text-lg font-medium text-center">Fotoğrafı Yükle</span>
                      <span className="text-sm text-muted-foreground text-center mt-2">Kamera veya galeriden fotoğraf seçin</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Seçimleri Gönder'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};