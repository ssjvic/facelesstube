// RateAppPopup - Solicitar calificación en Google Play Store
import { useState, useEffect } from 'react';
import { X, Star, Heart, ExternalLink } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.facelesstube.app';
const STORAGE_KEY = 'facelesstube_rate_app';

// Show the popup after this many videos have been created
const VIDEOS_BEFORE_PROMPT = 3;

export default function RateAppPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [step, setStep] = useState('ask'); // 'ask' | 'stars' | 'thanks'

  useEffect(() => {
    // Only show on native (Android)
    if (!Capacitor.isNativePlatform()) return;

    // Check if user already rated or dismissed permanently
    try {
      const rateData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (rateData.rated || rateData.dismissedForever) return;

      // Check if enough videos have been created
      const authRaw = localStorage.getItem('facelesstube-auth');
      if (authRaw) {
        const authData = JSON.parse(authRaw);
        const videosThisMonth = authData?.state?.user?.videosThisMonth || 0;
        if (videosThisMonth >= VIDEOS_BEFORE_PROMPT) {
          // Check if we already showed it this session
          const lastShown = rateData.lastShown || 0;
          const hoursSinceShown = (Date.now() - lastShown) / (1000 * 60 * 60);
          // Show at most once every 24 hours
          if (hoursSinceShown >= 24) {
            // Small delay so it doesn't appear instantly
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      const rateData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      rateData.lastShown = Date.now();
      rateData.dismissCount = (rateData.dismissCount || 0) + 1;
      // After 3 dismissals, don't ask again
      if (rateData.dismissCount >= 3) {
        rateData.dismissedForever = true;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rateData));
    } catch (e) { /* ignore */ }
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    if (rating >= 4) {
      // Good rating — redirect to Play Store
      setStep('thanks');
      try {
        const rateData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        rateData.rated = true;
        rateData.rating = rating;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rateData));
      } catch (e) { /* ignore */ }
      // Open Play Store after a short delay
      setTimeout(() => {
        window.open(PLAY_STORE_URL, '_blank');
      }, 1500);
    } else {
      // Low rating — just thank them and close (don't send to store)
      setStep('thanks');
      try {
        const rateData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        rateData.dismissedForever = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rateData));
      } catch (e) { /* ignore */ }
      setTimeout(() => setIsVisible(false), 2000);
    }
  };

  const handleGoToStore = () => {
    window.open(PLAY_STORE_URL, '_blank');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-gradient-to-br from-dark-700 to-dark-800 rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X size={16} className="text-white/60" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {step === 'ask' && (
            <>
              {/* Emoji / Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
                <span className="text-4xl">⭐</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                ¿Te gusta FacelessTube?
              </h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Si estás disfrutando la app, ayúdanos con una
                reseña en Google Play. ¡Tu opinión nos impulsa a mejorar!
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStep('stars')}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  <Star size={18} fill="white" />
                  ¡Sí, quiero calificar!
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 px-6 text-white/50 font-medium text-sm hover:text-white/70 transition-colors"
                >
                  Ahora no
                </button>
              </div>
            </>
          )}

          {step === 'stars' && (
            <>
              <h3 className="text-xl font-bold text-white mb-2">
                ¿Cuántas estrellas nos das?
              </h3>
              <p className="text-white/50 text-sm mb-6">
                Toca una estrella para calificar
              </p>

              {/* Star rating */}
              <div className="flex items-center justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => handleStarClick(star)}
                    className="transition-all duration-200 hover:scale-125 active:scale-90"
                  >
                    <Star
                      size={40}
                      className={
                        star <= (hoveredStar || selectedRating)
                          ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                          : 'text-white/20'
                      }
                      fill={
                        star <= (hoveredStar || selectedRating)
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleDismiss}
                className="text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Cancelar
              </button>
            </>
          )}

          {step === 'thanks' && (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30 animate-bounce">
                <Heart size={40} className="text-white" fill="white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                ¡Muchas gracias! 💜
              </h3>
              <p className="text-white/60 text-sm mb-6">
                {selectedRating >= 4
                  ? 'Te estamos llevando a Google Play para que dejes tu reseña...'
                  : '¡Gracias por tu feedback! Trabajaremos para mejorar.'}
              </p>

              {selectedRating >= 4 && (
                <button
                  onClick={handleGoToStore}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  Ir a Google Play
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer decorativo */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500" />
      </div>
    </div>
  );
}
