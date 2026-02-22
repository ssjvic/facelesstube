// Terms of Use Page
import { useTranslation } from '../store/i18nStore'
import { ArrowLeft, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const terms = {
    es: {
        title: 'Términos de Uso',
        lastUpdate: 'Última actualización: Enero 2026',
        sections: [
            {
                title: '1. Aceptación de los Términos',
                content: `Al acceder y usar FacelessTube, aceptas estos términos de uso. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.`
            },
            {
                title: '2. Descripción del Servicio',
                content: `FacelessTube es una plataforma que permite:

• Generar guiones de video usando inteligencia artificial.
• Crear narración de voz automatizada.
• Componer videos con clips de fondo.
• Subir videos a YouTube (con tu autorización).

El servicio requiere que proporciones tus propias claves API de terceros (Google AI, Pexels).`
            },
            {
                title: '3. Uso Aceptable',
                content: `Te comprometes a NO usar el servicio para:

• Crear contenido ilegal, difamatorio, obsceno o que viole derechos de terceros.
• Generar contenido que promueva odio, violencia o discriminación.
• Infringir derechos de autor o propiedad intelectual.
• Spam, fraude o actividades engañosas.
• Hacerse pasar por otra persona o entidad.
• Intentar hackear o comprometer la seguridad del servicio.`
            },
            {
                title: '4. Propiedad del Contenido',
                content: `• **Tu contenido**: Mantienes todos los derechos sobre los videos que creas.
• **Videos de fondo**: Los clips de Pexels están sujetos a su licencia (uso gratuito con atribución recomendada).
• **Guiones generados**: Los textos generados por IA son tuyos para usar como desees.
• **Nuestra plataforma**: FacelessTube y su código son propiedad de nosotros.`
            },
            {
                title: '5. Suscripciones y Pagos',
                content: `• Los planes de pago se facturan mensual o anualmente según tu elección.
• Puedes cancelar en cualquier momento; el acceso continúa hasta el final del período pagado.
• No ofrecemos reembolsos por períodos parciales.
• Nos reservamos el derecho de cambiar los precios con aviso previo de 30 días.`
            },
            {
                title: '6. Límites del Servicio',
                content: `• Cada plan tiene límites específicos de videos por mes.
• El servicio depende de APIs de terceros que pueden cambiar o no estar disponibles.
• No garantizamos disponibilidad del 100%.
• Nos reservamos el derecho de modificar o discontinuar funciones.`
            },
            {
                title: '7. Responsabilidad',
                content: `• El servicio se proporciona "tal cual" sin garantías.
• No somos responsables por contenido generado por los usuarios.
• No somos responsables por problemas con APIs de terceros.
• Nuestra responsabilidad máxima se limita al monto pagado por tu suscripción.`
            },
            {
                title: '8. Terminación',
                content: `Podemos suspender o terminar tu cuenta si:

• Violas estos términos de uso.
• Realizas actividades fraudulentas.
• No pagas tu suscripción.

Puedes eliminar tu cuenta en cualquier momento desde la configuración.`
            },
            {
                title: '9. Modificaciones',
                content: `Podemos modificar estos términos en cualquier momento. Los cambios significativos serán notificados con al menos 30 días de anticipación. El uso continuado del servicio después de los cambios implica aceptación.`
            },
            {
                title: '10. Contacto',
                content: `Para preguntas sobre estos términos:
                
📧 Email: legal@facelesstube.mx`
            }
        ]
    },
    en: {
        title: 'Terms of Use',
        lastUpdate: 'Last updated: January 2026',
        sections: [
            {
                title: '1. Acceptance of Terms',
                content: `By accessing and using FacelessTube, you accept these terms of use. If you disagree with any part of these terms, you should not use our service.`
            },
            {
                title: '2. Service Description',
                content: `FacelessTube is a platform that allows you to:

• Generate video scripts using artificial intelligence.
• Create automated voice narration.
• Compose videos with background clips.
• Upload videos to YouTube (with your authorization).

The service requires you to provide your own third-party API keys (Google AI, Pexels).`
            },
            {
                title: '3. Acceptable Use',
                content: `You agree NOT to use the service to:

• Create illegal, defamatory, obscene content or content that violates third-party rights.
• Generate content that promotes hate, violence, or discrimination.
• Infringe copyright or intellectual property rights.
• Spam, fraud, or deceptive activities.
• Impersonate another person or entity.
• Attempt to hack or compromise the security of the service.`
            },
            {
                title: '4. Content Ownership',
                content: `• **Your content**: You retain all rights to the videos you create.
• **Background videos**: Pexels clips are subject to their license (free use with recommended attribution).
• **Generated scripts**: AI-generated texts are yours to use as you wish.
• **Our platform**: FacelessTube and its code are our property.`
            },
            {
                title: '5. Subscriptions and Payments',
                content: `• Paid plans are billed monthly or annually according to your choice.
• You can cancel at any time; access continues until the end of the paid period.
• We do not offer refunds for partial periods.
• We reserve the right to change prices with 30 days notice.`
            },
            {
                title: '6. Service Limits',
                content: `• Each plan has specific monthly video limits.
• The service depends on third-party APIs that may change or become unavailable.
• We do not guarantee 100% availability.
• We reserve the right to modify or discontinue features.`
            },
            {
                title: '7. Liability',
                content: `• The service is provided "as is" without warranties.
• We are not responsible for user-generated content.
• We are not responsible for third-party API issues.
• Our maximum liability is limited to the amount paid for your subscription.`
            },
            {
                title: '8. Termination',
                content: `We may suspend or terminate your account if you:

• Violate these terms of use.
• Engage in fraudulent activities.
• Fail to pay your subscription.

You can delete your account at any time from settings.`
            },
            {
                title: '9. Modifications',
                content: `We may modify these terms at any time. Significant changes will be notified at least 30 days in advance. Continued use of the service after changes implies acceptance.`
            },
            {
                title: '10. Contact',
                content: `For questions about these terms:
                
📧 Email: legal@facelesstube.mx`
            }
        ]
    },
    pt: {
        title: 'Termos de Uso',
        lastUpdate: 'Última atualização: Janeiro 2026',
        sections: [
            {
                title: '1. Aceitação dos Termos',
                content: `Ao acessar e usar o FacelessTube, você aceita estes termos de uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.`
            },
            {
                title: '2. Descrição do Serviço',
                content: `FacelessTube é uma plataforma que permite:

• Gerar roteiros de vídeo usando inteligência artificial.
• Criar narração de voz automatizada.
• Compor vídeos com clipes de fundo.
• Enviar vídeos para o YouTube (com sua autorização).

O serviço requer que você forneça suas próprias chaves de API de terceiros (Google AI, Pexels).`
            },
            {
                title: '3. Uso Aceitável',
                content: `Você concorda em NÃO usar o serviço para:

• Criar conteúdo ilegal, difamatório, obsceno ou que viole direitos de terceiros.
• Gerar conteúdo que promova ódio, violência ou discriminação.
• Infringir direitos autorais ou propriedade intelectual.
• Spam, fraude ou atividades enganosas.
• Se passar por outra pessoa ou entidade.
• Tentar hackear ou comprometer a segurança do serviço.`
            },
            {
                title: '4. Propriedade do Conteúdo',
                content: `• **Seu conteúdo**: Você mantém todos os direitos sobre os vídeos que cria.
• **Vídeos de fundo**: Os clipes do Pexels estão sujeitos à sua licença (uso gratuito com atribuição recomendada).
• **Roteiros gerados**: Os textos gerados por IA são seus para usar como desejar.
• **Nossa plataforma**: FacelessTube e seu código são nossa propriedade.`
            },
            {
                title: '5. Assinaturas e Pagamentos',
                content: `• Os planos pagos são cobrados mensal ou anualmente conforme sua escolha.
• Você pode cancelar a qualquer momento; o acesso continua até o final do período pago.
• Não oferecemos reembolsos por períodos parciais.
• Reservamo-nos o direito de alterar os preços com aviso prévio de 30 dias.`
            },
            {
                title: '6. Limites do Serviço',
                content: `• Cada plano tem limites específicos de vídeos por mês.
• O serviço depende de APIs de terceiros que podem mudar ou ficar indisponíveis.
• Não garantimos disponibilidade de 100%.
• Reservamo-nos o direito de modificar ou descontinuar recursos.`
            },
            {
                title: '7. Responsabilidade',
                content: `• O serviço é fornecido "como está" sem garantias.
• Não somos responsáveis pelo conteúdo gerado pelos usuários.
• Não somos responsáveis por problemas com APIs de terceiros.
• Nossa responsabilidade máxima é limitada ao valor pago pela sua assinatura.`
            },
            {
                title: '8. Rescisão',
                content: `Podemos suspender ou encerrar sua conta se você:

• Violar estes termos de uso.
• Realizar atividades fraudulentas.
• Não pagar sua assinatura.

Você pode excluir sua conta a qualquer momento nas configurações.`
            },
            {
                title: '9. Modificações',
                content: `Podemos modificar estes termos a qualquer momento. Mudanças significativas serão notificadas com pelo menos 30 dias de antecedência. O uso continuado do serviço após as mudanças implica aceitação.`
            },
            {
                title: '10. Contato',
                content: `Para perguntas sobre estes termos:
                
📧 Email: legal@facelesstube.mx`
            }
        ]
    },
    fr: {
        title: 'Conditions d\'Utilisation',
        lastUpdate: 'Dernière mise à jour : Janvier 2026',
        sections: [
            {
                title: '1. Acceptation des Conditions',
                content: `En accédant et en utilisant FacelessTube, vous acceptez ces conditions d'utilisation. Si vous n'êtes pas d'accord avec une partie de ces conditions, vous ne devez pas utiliser notre service.`
            },
            {
                title: '2. Description du Service',
                content: `FacelessTube est une plateforme qui vous permet de :

• Générer des scripts vidéo en utilisant l'intelligence artificielle.
• Créer une narration vocale automatisée.
• Composer des vidéos avec des clips de fond.
• Télécharger des vidéos sur YouTube (avec votre autorisation).

Le service nécessite que vous fournissiez vos propres clés API tierces (Google AI, Pexels).`
            },
            {
                title: '3. Utilisation Acceptable',
                content: `Vous acceptez de NE PAS utiliser le service pour :

• Créer du contenu illégal, diffamatoire, obscène ou violant les droits de tiers.
• Générer du contenu promouvant la haine, la violence ou la discrimination.
• Enfreindre les droits d'auteur ou la propriété intellectuelle.
• Spam, fraude ou activités trompeuses.
• Se faire passer pour une autre personne ou entité.
• Tenter de pirater ou de compromettre la sécurité du service.`
            },
            {
                title: '4. Propriété du Contenu',
                content: `• **Votre contenu** : Vous conservez tous les droits sur les vidéos que vous créez.
• **Vidéos de fond** : Les clips Pexels sont soumis à leur licence (utilisation gratuite avec attribution recommandée).
• **Scripts générés** : Les textes générés par l'IA sont les vôtres.
• **Notre plateforme** : FacelessTube et son code sont notre propriété.`
            },
            {
                title: '5. Abonnements et Paiements',
                content: `• Les forfaits payants sont facturés mensuellement ou annuellement selon votre choix.
• Vous pouvez annuler à tout moment ; l'accès continue jusqu'à la fin de la période payée.
• Nous n'offrons pas de remboursements pour les périodes partielles.
• Nous nous réservons le droit de modifier les prix avec un préavis de 30 jours.`
            },
            {
                title: '6. Limites du Service',
                content: `• Chaque forfait a des limites de vidéos mensuelles spécifiques.
• Le service dépend d'APIs tierces qui peuvent changer ou devenir indisponibles.
• Nous ne garantissons pas une disponibilité de 100%.
• Nous nous réservons le droit de modifier ou d'interrompre des fonctionnalités.`
            },
            {
                title: '7. Responsabilité',
                content: `• Le service est fourni "tel quel" sans garanties.
• Nous ne sommes pas responsables du contenu généré par les utilisateurs.
• Nous ne sommes pas responsables des problèmes d'API tierces.
• Notre responsabilité maximale est limitée au montant payé pour votre abonnement.`
            },
            {
                title: '8. Résiliation',
                content: `Nous pouvons suspendre ou résilier votre compte si vous :

• Violez ces conditions d'utilisation.
• Vous engagez dans des activités frauduleuses.
• Ne payez pas votre abonnement.

Vous pouvez supprimer votre compte à tout moment depuis les paramètres.`
            },
            {
                title: '9. Modifications',
                content: `Nous pouvons modifier ces conditions à tout moment. Les changements significatifs seront notifiés au moins 30 jours à l'avance. L'utilisation continue du service après les changements implique l'acceptation.`
            },
            {
                title: '10. Contact',
                content: `Pour des questions sur ces conditions :
                
📧 Email : legal@facelesstube.mx`
            }
        ]
    },
    de: {
        title: 'Nutzungsbedingungen',
        lastUpdate: 'Letzte Aktualisierung: Januar 2026',
        sections: [
            {
                title: '1. Annahme der Bedingungen',
                content: `Durch den Zugriff auf und die Nutzung von FacelessTube akzeptieren Sie diese Nutzungsbedingungen. Wenn Sie mit einem Teil dieser Bedingungen nicht einverstanden sind, sollten Sie unseren Dienst nicht nutzen.`
            },
            {
                title: '2. Dienstbeschreibung',
                content: `FacelessTube ist eine Plattform, die es Ihnen ermöglicht:

• Videoskripte mit künstlicher Intelligenz zu generieren.
• Automatisierte Sprachausgabe zu erstellen.
• Videos mit Hintergrundclips zu komponieren.
• Videos auf YouTube hochzuladen (mit Ihrer Genehmigung).

Der Dienst erfordert, dass Sie Ihre eigenen API-Schlüssel von Drittanbietern bereitstellen (Google AI, Pexels).`
            },
            {
                title: '3. Akzeptable Nutzung',
                content: `Sie stimmen zu, den Dienst NICHT zu nutzen, um:

• Illegale, verleumderische, obszöne Inhalte oder Inhalte zu erstellen, die Rechte Dritter verletzen.
• Inhalte zu generieren, die Hass, Gewalt oder Diskriminierung fördern.
• Urheberrechte oder geistiges Eigentum zu verletzen.
• Spam, Betrug oder betrügerische Aktivitäten durchzuführen.
• Sich als eine andere Person oder Entität auszugeben.
• Zu versuchen, die Sicherheit des Dienstes zu hacken oder zu gefährden.`
            },
            {
                title: '4. Eigentum am Inhalt',
                content: `• **Ihr Inhalt**: Sie behalten alle Rechte an den von Ihnen erstellten Videos.
• **Hintergrundvideos**: Pexels-Clips unterliegen ihrer Lizenz (kostenlose Nutzung mit empfohlener Namensnennung).
• **Generierte Skripte**: KI-generierte Texte gehören Ihnen.
• **Unsere Plattform**: FacelessTube und sein Code sind unser Eigentum.`
            },
            {
                title: '5. Abonnements und Zahlungen',
                content: `• Bezahlte Pläne werden monatlich oder jährlich nach Ihrer Wahl abgerechnet.
• Sie können jederzeit kündigen; der Zugang bleibt bis zum Ende des bezahlten Zeitraums bestehen.
• Wir bieten keine Rückerstattungen für Teilzeiträume an.
• Wir behalten uns das Recht vor, die Preise mit 30 Tagen Vorankündigung zu ändern.`
            },
            {
                title: '6. Dienstlimits',
                content: `• Jeder Plan hat spezifische monatliche Videolimits.
• Der Dienst hängt von APIs Dritter ab, die sich ändern oder nicht verfügbar sein können.
• Wir garantieren keine 100%ige Verfügbarkeit.
• Wir behalten uns das Recht vor, Funktionen zu ändern oder einzustellen.`
            },
            {
                title: '7. Haftung',
                content: `• Der Dienst wird "wie er ist" ohne Garantien bereitgestellt.
• Wir sind nicht verantwortlich für von Nutzern generierte Inhalte.
• Wir sind nicht verantwortlich für Probleme mit APIs Dritter.
• Unsere maximale Haftung ist auf den für Ihr Abonnement gezahlten Betrag begrenzt.`
            },
            {
                title: '8. Kündigung',
                content: `Wir können Ihr Konto sperren oder kündigen, wenn Sie:

• Diese Nutzungsbedingungen verletzen.
• Betrügerische Aktivitäten durchführen.
• Ihr Abonnement nicht bezahlen.

Sie können Ihr Konto jederzeit in den Einstellungen löschen.`
            },
            {
                title: '9. Änderungen',
                content: `Wir können diese Bedingungen jederzeit ändern. Wesentliche Änderungen werden mindestens 30 Tage im Voraus mitgeteilt. Die weitere Nutzung des Dienstes nach Änderungen bedeutet Akzeptanz.`
            },
            {
                title: '10. Kontakt',
                content: `Für Fragen zu diesen Bedingungen:
                
📧 E-Mail: legal@facelesstube.mx`
            }
        ]
    },
    zh: {
        title: '使用条款',
        lastUpdate: '最后更新：2026年1月',
        sections: [
            {
                title: '1. 接受条款',
                content: `通过访问和使用 FacelessTube，您接受这些使用条款。如果您不同意这些条款的任何部分，您不应使用我们的服务。`
            },
            {
                title: '2. 服务描述',
                content: `FacelessTube 是一个平台，允许您：

• 使用人工智能生成视频脚本。
• 创建自动语音旁白。
• 使用背景剪辑合成视频。
• 将视频上传到 YouTube（经您授权）。

该服务需要您提供自己的第三方 API 密钥（Google AI、Pexels）。`
            },
            {
                title: '3. 可接受的使用',
                content: `您同意不使用该服务来：

• 创建非法、诽谤、淫秽或侵犯第三方权利的内容。
• 生成宣扬仇恨、暴力或歧视的内容。
• 侵犯版权或知识产权。
• 垃圾邮件、欺诈或欺骗性活动。
• 冒充他人或实体。
• 试图入侵或损害服务的安全性。`
            },
            {
                title: '4. 内容所有权',
                content: `• **您的内容**：您保留对所创建视频的所有权利。
• **背景视频**：Pexels 剪辑受其许可证约束（免费使用，建议注明出处）。
• **生成的脚本**：AI 生成的文本归您所有。
• **我们的平台**：FacelessTube 及其代码是我们的财产。`
            },
            {
                title: '5. 订阅和付款',
                content: `• 付费计划按您的选择按月或按年计费。
• 您可以随时取消；访问权限将持续到付费期结束。
• 我们不提供部分期间的退款。
• 我们保留提前30天通知更改价格的权利。`
            },
            {
                title: '6. 服务限制',
                content: `• 每个计划都有特定的月度视频限制。
• 该服务依赖于可能发生变化或不可用的第三方 API。
• 我们不保证 100% 可用性。
• 我们保留修改或停止功能的权利。`
            },
            {
                title: '7. 责任',
                content: `• 该服务按"现状"提供，不提供任何保证。
• 我们不对用户生成的内容负责。
• 我们不对第三方 API 问题负责。
• 我们的最大责任限于您订阅所支付的金额。`
            },
            {
                title: '8. 终止',
                content: `如果您有以下行为，我们可能会暂停或终止您的帐户：

• 违反这些使用条款。
• 从事欺诈活动。
• 未支付您的订阅费用。

您可以随时在设置中删除您的帐户。`
            },
            {
                title: '9. 修改',
                content: `我们可能随时修改这些条款。重大更改将提前至少30天通知。更改后继续使用该服务即表示接受。`
            },
            {
                title: '10. 联系方式',
                content: `如有关于这些条款的问题：
                
📧 电子邮件：legal@facelesstube.mx`
            }
        ]
    }
}

export default function Terms() {
    const { language } = useTranslation()
    const term = terms[language] || terms['en']

    return (
        <div className="min-h-screen bg-dark-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <FileText size={24} className="text-neon-purple" />
                        <h1 className="text-xl font-bold">{term.title}</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <p className="text-white/50 mb-8">{term.lastUpdate}</p>

                <div className="space-y-8">
                    {term.sections.map((section, i) => (
                        <section key={i} className="glass-card p-6">
                            <h2 className="text-lg font-semibold mb-4 text-neon-purple">
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
