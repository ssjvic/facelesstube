// Settings Modal - Simplified (all APIs are server-side now)
import { X, Key, CheckCircle2 } from "lucide-react";
import { useTranslation } from "../../store/i18nStore";

export default function SettingsModal({ isOpen, onClose }) {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg glass-card p-4 sm:p-6 animate-scale-in rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
              <Key size={20} className="text-neon-purple" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t("settings.title")}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status message */}
        <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 size={20} className="text-neon-green" />
            <span className="font-medium text-neon-green">
              {language === "es"
                ? "Todo listo"
                : language === "en"
                  ? "All set"
                  : "Tudo pronto"}
            </span>
          </div>
          <p className="text-sm text-white/60">
            {language === "es"
              ? "No necesitas configurar nada. Todo funciona automáticamente."
              : language === "en"
                ? "No setup needed. Everything works automatically."
                : "Nenhuma configuração necessária. Tudo funciona automaticamente."}
          </p>
        </div>

        {/* Close button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium btn-neon"
          >
            {language === "es"
              ? "Cerrar"
              : language === "en"
                ? "Close"
                : "Fechar"}
          </button>
        </div>
      </div>
    </div>
  );
}
