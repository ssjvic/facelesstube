// Privacy Policy Page
import { useTranslation } from '../store/i18nStore'
import { ArrowLeft, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const policies = {
    es: {
        title: 'Política de Privacidad',
        lastUpdate: 'Última actualización: Enero 2026',
        sections: [
            {
                title: '1. Información que Recopilamos',
                content: `Recopilamos la siguiente información cuando usas FacelessTube:
                
• **Información de cuenta**: Email y nombre cuando te registras con Google.
• **Datos de uso**: Videos generados, preferencias de idioma y configuración.
• **API Keys**: Tus claves API se almacenan localmente en tu navegador, nunca en nuestros servidores.
• **Información técnica**: Tipo de navegador, dispositivo y dirección IP.`
            },
            {
                title: '2. Cómo Usamos tu Información',
                content: `Usamos tu información para:

• Proporcionar y mejorar nuestros servicios.
• Gestionar tu cuenta y suscripción.
• Enviar notificaciones importantes sobre el servicio.
• Cumplir con obligaciones legales.`
            },
            {
                title: '3. Almacenamiento de Datos',
                content: `• Las API Keys se almacenan **únicamente en tu navegador** (localStorage).
• Los videos generados se procesan en tu dispositivo.
• No almacenamos tus videos en nuestros servidores.
• Los datos de cuenta se almacenan de forma segura con encriptación.`
            },
            {
                title: '4. Compartir Información',
                content: `**No vendemos** tu información personal. Podemos compartir datos con:

• Proveedores de servicios que nos ayudan a operar la plataforma.
• Autoridades cuando sea requerido por ley.`
            },
            {
                title: '5. Tus Derechos',
                content: `Tienes derecho a:

• Acceder a tus datos personales.
• Corregir información incorrecta.
• Eliminar tu cuenta y datos.
• Exportar tus datos.

Para ejercer estos derechos, contacta: privacy@facelesstube.mx`
            },
            {
                title: '6. Cookies',
                content: `Usamos cookies esenciales para el funcionamiento de la aplicación. No usamos cookies de seguimiento o publicidad.`
            },
            {
                title: '7. Cambios a esta Política',
                content: `Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios significativos por email o mediante un aviso en la aplicación.`
            }
        ]
    },
    en: {
        title: 'Privacy Policy',
        lastUpdate: 'Last updated: January 2026',
        sections: [
            {
                title: '1. Information We Collect',
                content: `We collect the following information when you use FacelessTube:
                
• **Account information**: Email and name when you sign up with Google.
• **Usage data**: Generated videos, language preferences, and settings.
• **API Keys**: Your API keys are stored locally in your browser, never on our servers.
• **Technical information**: Browser type, device, and IP address.`
            },
            {
                title: '2. How We Use Your Information',
                content: `We use your information to:

• Provide and improve our services.
• Manage your account and subscription.
• Send important notifications about the service.
• Comply with legal obligations.`
            },
            {
                title: '3. Data Storage',
                content: `• API Keys are stored **only in your browser** (localStorage).
• Generated videos are processed on your device.
• We do not store your videos on our servers.
• Account data is stored securely with encryption.`
            },
            {
                title: '4. Information Sharing',
                content: `We **do not sell** your personal information. We may share data with:

• Service providers who help us operate the platform.
• Authorities when required by law.`
            },
            {
                title: '5. Your Rights',
                content: `You have the right to:

• Access your personal data.
• Correct inaccurate information.
• Delete your account and data.
• Export your data.

To exercise these rights, contact: privacy@facelesstube.mx`
            },
            {
                title: '6. Cookies',
                content: `We use essential cookies for the application to function. We do not use tracking or advertising cookies.`
            },
            {
                title: '7. Changes to this Policy',
                content: `We may update this policy occasionally. We will notify you of significant changes via email or a notice in the application.`
            }
        ]
    },
    pt: {
        title: 'Política de Privacidade',
        lastUpdate: 'Última atualização: Janeiro 2026',
        sections: [
            {
                title: '1. Informações que Coletamos',
                content: `Coletamos as seguintes informações quando você usa o FacelessTube:
                
• **Informações da conta**: Email e nome ao se registrar com o Google.
• **Dados de uso**: Vídeos gerados, preferências de idioma e configurações.
• **Chaves API**: Suas chaves API são armazenadas localmente em seu navegador, nunca em nossos servidores.
• **Informações técnicas**: Tipo de navegador, dispositivo e endereço IP.`
            },
            {
                title: '2. Como Usamos Suas Informações',
                content: `Usamos suas informações para:

• Fornecer e melhorar nossos serviços.
• Gerenciar sua conta e assinatura.
• Enviar notificações importantes sobre o serviço.
• Cumprir obrigações legais.`
            },
            {
                title: '3. Armazenamento de Dados',
                content: `• As chaves API são armazenadas **apenas no seu navegador** (localStorage).
• Os vídeos gerados são processados no seu dispositivo.
• Não armazenamos seus vídeos em nossos servidores.
• Os dados da conta são armazenados com segurança e criptografia.`
            },
            {
                title: '4. Compartilhamento de Informações',
                content: `**Não vendemos** suas informações pessoais. Podemos compartilhar dados com:

• Provedores de serviços que nos ajudam a operar a plataforma.
• Autoridades quando exigido por lei.`
            },
            {
                title: '5. Seus Direitos',
                content: `Você tem o direito de:

• Acessar seus dados pessoais.
• Corrigir informações incorretas.
• Excluir sua conta e dados.
• Exportar seus dados.

Para exercer esses direitos, contate: privacy@facelesstube.mx`
            },
            {
                title: '6. Cookies',
                content: `Usamos cookies essenciais para o funcionamento do aplicativo. Não usamos cookies de rastreamento ou publicidade.`
            },
            {
                title: '7. Alterações nesta Política',
                content: `Podemos atualizar esta política ocasionalmente. Notificaremos você sobre mudanças significativas por email ou aviso no aplicativo.`
            }
        ]
    },
    fr: {
        title: 'Politique de Confidentialité',
        lastUpdate: 'Dernière mise à jour : Janvier 2026',
        sections: [
            {
                title: '1. Informations que Nous Collectons',
                content: `Nous collectons les informations suivantes lorsque vous utilisez FacelessTube :
                
• **Informations de compte** : Email et nom lors de l'inscription avec Google.
• **Données d'utilisation** : Vidéos générées, préférences linguistiques et paramètres.
• **Clés API** : Vos clés API sont stockées localement dans votre navigateur, jamais sur nos serveurs.
• **Informations techniques** : Type de navigateur, appareil et adresse IP.`
            },
            {
                title: '2. Comment Nous Utilisons Vos Informations',
                content: `Nous utilisons vos informations pour :

• Fournir et améliorer nos services.
• Gérer votre compte et abonnement.
• Envoyer des notifications importantes sur le service.
• Respecter les obligations légales.`
            },
            {
                title: '3. Stockage des Données',
                content: `• Les clés API sont stockées **uniquement dans votre navigateur** (localStorage).
• Les vidéos générées sont traitées sur votre appareil.
• Nous ne stockons pas vos vidéos sur nos serveurs.
• Les données de compte sont stockées de manière sécurisée avec chiffrement.`
            },
            {
                title: '4. Partage d\'Informations',
                content: `Nous **ne vendons pas** vos informations personnelles. Nous pouvons partager des données avec :

• Les fournisseurs de services qui nous aident à exploiter la plateforme.
• Les autorités lorsque la loi l'exige.`
            },
            {
                title: '5. Vos Droits',
                content: `Vous avez le droit de :

• Accéder à vos données personnelles.
• Corriger les informations inexactes.
• Supprimer votre compte et vos données.
• Exporter vos données.

Pour exercer ces droits, contactez : privacy@facelesstube.mx`
            },
            {
                title: '6. Cookies',
                content: `Nous utilisons des cookies essentiels pour le fonctionnement de l'application. Nous n'utilisons pas de cookies de suivi ou de publicité.`
            },
            {
                title: '7. Modifications de cette Politique',
                content: `Nous pouvons mettre à jour cette politique occasionnellement. Nous vous informerons des changements significatifs par email ou par un avis dans l'application.`
            }
        ]
    },
    de: {
        title: 'Datenschutzrichtlinie',
        lastUpdate: 'Letzte Aktualisierung: Januar 2026',
        sections: [
            {
                title: '1. Informationen, die wir sammeln',
                content: `Wir sammeln folgende Informationen, wenn Sie FacelessTube nutzen:
                
• **Kontoinformationen**: E-Mail und Name bei der Anmeldung mit Google.
• **Nutzungsdaten**: Generierte Videos, Spracheinstellungen und Konfiguration.
• **API-Schlüssel**: Ihre API-Schlüssel werden lokal in Ihrem Browser gespeichert, niemals auf unseren Servern.
• **Technische Informationen**: Browsertyp, Gerät und IP-Adresse.`
            },
            {
                title: '2. Wie wir Ihre Informationen verwenden',
                content: `Wir verwenden Ihre Informationen, um:

• Unsere Dienste bereitzustellen und zu verbessern.
• Ihr Konto und Abonnement zu verwalten.
• Wichtige Benachrichtigungen über den Dienst zu senden.
• Gesetzliche Verpflichtungen zu erfüllen.`
            },
            {
                title: '3. Datenspeicherung',
                content: `• API-Schlüssel werden **nur in Ihrem Browser** gespeichert (localStorage).
• Generierte Videos werden auf Ihrem Gerät verarbeitet.
• Wir speichern Ihre Videos nicht auf unseren Servern.
• Kontodaten werden sicher mit Verschlüsselung gespeichert.`
            },
            {
                title: '4. Informationsweitergabe',
                content: `Wir **verkaufen keine** persönlichen Informationen. Wir können Daten teilen mit:

• Dienstleistern, die uns beim Betrieb der Plattform helfen.
• Behörden, wenn dies gesetzlich vorgeschrieben ist.`
            },
            {
                title: '5. Ihre Rechte',
                content: `Sie haben das Recht:

• Auf Ihre persönlichen Daten zuzugreifen.
• Falsche Informationen zu korrigieren.
• Ihr Konto und Ihre Daten zu löschen.
• Ihre Daten zu exportieren.

Um diese Rechte auszuüben, kontaktieren Sie: privacy@facelesstube.mx`
            },
            {
                title: '6. Cookies',
                content: `Wir verwenden essentielle Cookies für den Betrieb der Anwendung. Wir verwenden keine Tracking- oder Werbe-Cookies.`
            },
            {
                title: '7. Änderungen dieser Richtlinie',
                content: `Wir können diese Richtlinie gelegentlich aktualisieren. Wir werden Sie über wesentliche Änderungen per E-Mail oder durch einen Hinweis in der Anwendung informieren.`
            }
        ]
    },
    zh: {
        title: '隐私政策',
        lastUpdate: '最后更新：2026年1月',
        sections: [
            {
                title: '1. 我们收集的信息',
                content: `当您使用 FacelessTube 时，我们会收集以下信息：
                
• **账户信息**：使用 Google 注册时的电子邮件和姓名。
• **使用数据**：生成的视频、语言偏好和设置。
• **API 密钥**：您的 API 密钥仅存储在您的浏览器中，绝不会存储在我们的服务器上。
• **技术信息**：浏览器类型、设备和 IP 地址。`
            },
            {
                title: '2. 我们如何使用您的信息',
                content: `我们使用您的信息来：

• 提供和改进我们的服务。
• 管理您的账户和订阅。
• 发送有关服务的重要通知。
• 遵守法律义务。`
            },
            {
                title: '3. 数据存储',
                content: `• API 密钥**仅存储在您的浏览器中**（localStorage）。
• 生成的视频在您的设备上处理。
• 我们不会在服务器上存储您的视频。
• 账户数据使用加密安全存储。`
            },
            {
                title: '4. 信息共享',
                content: `我们**不会出售**您的个人信息。我们可能会与以下方共享数据：

• 帮助我们运营平台的服务提供商。
• 法律要求时的相关部门。`
            },
            {
                title: '5. 您的权利',
                content: `您有权：

• 访问您的个人数据。
• 更正不准确的信息。
• 删除您的账户和数据。
• 导出您的数据。

要行使这些权利，请联系：privacy@facelesstube.mx`
            },
            {
                title: '6. Cookies',
                content: `我们使用必要的 cookies 来保证应用程序正常运行。我们不使用跟踪或广告 cookies。`
            },
            {
                title: '7. 本政策的变更',
                content: `我们可能会不时更新本政策。我们将通过电子邮件或应用内通知您重大变更。`
            }
        ]
    }
}

export default function Privacy() {
    const { language } = useTranslation()
    const policy = policies[language] || policies['en']

    return (
        <div className="min-h-screen bg-dark-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Shield size={24} className="text-neon-cyan" />
                        <h1 className="text-xl font-bold">{policy.title}</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <p className="text-white/50 mb-8">{policy.lastUpdate}</p>

                <div className="space-y-8">
                    {policy.sections.map((section, i) => (
                        <section key={i} className="glass-card p-6">
                            <h2 className="text-lg font-semibold mb-4 text-neon-cyan">
                                {section.title}
                            </h2>
                            <div className="text-white/70 whitespace-pre-line leading-relaxed">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-8 text-center text-white/40 text-sm">
                    <p>© 2026 FacelessTube. All rights reserved.</p>
                </div>
            </main>
        </div>
    )
}
