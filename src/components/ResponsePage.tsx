import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface ResponsePageProps {
  responseType: 'success' | 'badrequest' | 'maxretrycount' | 'timesup';
}

const responseConfig = {
  success: {
    title: 'Başarılı!',
    message: 'Bilgileriniz başarıyla alındı. Telegrama dönebilirsiniz.',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    cardClass: 'border-green-200 bg-green-50/50',
  },
  badrequest: {
    title: 'Hata!',
    message: 'Hatalı istek.',
    icon: XCircle,
    iconColor: 'text-red-500',
    cardClass: 'border-red-200 bg-red-50/50',
  },
  maxretrycount: {
    title: 'Deneme Limiti Aşıldı!',
    message: 'Bir istekte en fazla 3 kez deneyebilirsiniz. Telegram üzerinden "oluştur" yazarak yeni akış başlatabilirsiniz.',
    icon: RefreshCw,
    iconColor: 'text-orange-500',
    cardClass: 'border-orange-200 bg-orange-50/50',
  },
  timesup: {
    title: 'Süre Doldu!',
    message: 'Bu başvuru için zaman doldu. Lütfen yeni akış başlatınız.',
    icon: Clock,
    iconColor: 'text-blue-500',
    cardClass: 'border-blue-200 bg-blue-50/50',
  },
};

export const ResponsePage = ({ responseType }: ResponsePageProps) => {
  const config = responseConfig[responseType];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 flex items-center justify-center">
      <Card className={`p-8 shadow-[var(--shadow-card)] backdrop-blur-sm bg-gradient-to-br from-card to-card/90 max-w-md mx-auto text-center ${config.cardClass}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center">
            <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {config.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {config.message}
            </p>
          </div>

          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.open('tg://', '_self')}
              className="bg-background/50 hover:bg-background/80"
            >
              Telegram'a dön
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};