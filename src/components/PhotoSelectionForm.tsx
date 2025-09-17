import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SelectionCard } from './SelectionCard';
import { ResponsePage } from './ResponsePage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Import images
import poseConfident from '@/assets/pose-confident.jpg';
import poseCasual from '@/assets/pose-casual.jpg';
import poseCreative from '@/assets/pose-creative.jpg';
import poseFormal from '@/assets/pose-formal.jpg';

import bgWhite from '@/assets/bg-white.jpg';
import bgUrban from '@/assets/bg-urban.jpg';
import bgNature from '@/assets/bg-nature.png';
import bgOffice from '@/assets/bg-office.jpg';

import positionLeft from '@/assets/position-left.jpg';
import positionCenter from '@/assets/position-center.jpg';
import positionRight from '@/assets/position-right.jpg';
import positionFullbody from '@/assets/position-fullbody.jpg';

interface FormData {
  poseId: string;
  backgroundId: string;
  positionId: string;
  uniqueId: string;
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
  { id: 'left', image: positionLeft, description: 'Sol Pozisyon' },
  { id: 'center', image: positionCenter, description: 'Merkez Pozisyon' },
  { id: 'right', image: positionRight, description: 'Sağ Pozisyon' },
  { id: 'fullbody', image: positionFullbody, description: 'Tam Vücut' },
];

export const PhotoSelectionForm = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const location = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    poseId: '',
    backgroundId: '',
    positionId: '',
    uniqueId: uniqueId || '',
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
    
    if (!formData.poseId || !formData.backgroundId || !formData.positionId) {
      toast({
        title: "Hata",
        description: "Lütfen tüm seçimleri yapınız.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://n8n.mertakcay.com/webhook-test/34e675a6-20cb-4461-b097-5bcbf221e24f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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