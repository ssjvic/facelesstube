# Android Build Guide - FacelessTube

## Option 1: Capacitor (Recommended)

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init FacelessTube com.facelesstube.app
```

### 2. Build the web app

```bash
npm run build
```

### 3. Add Android platform

```bash
npx cap add android
```

### 4. Sync web assets

```bash
npx cap sync android
```

### 5. Open in Android Studio

```bash
npx cap open android
```

### 6. Configure Android

In `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.facelesstube.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### 7. Generate signed APK

In Android Studio:

1. Build > Generate Signed Bundle / APK
2. Create new keystore (save it securely!)
3. Choose "release" build variant
4. Click Finish

---

## Option 2: TWA (Trusted Web Activity)

If you prefer a simpler approach using just PWA:

### 1. Install Bubblewrap

```bash
npm install -g @anthropic-ai/bubblewrap
```

### 2. Initialize

```bash
bubblewrap init --manifest https://yoursite.com/manifest.json
```

### 3. Build

```bash
bubblewrap build
```

---

## App Icons

You need these icon sizes in `android/app/src/main/res/`:

| Resource | Size |
|----------|------|
| mipmap-mdpi | 48x48 |
| mipmap-hdpi | 72x72 |
| mipmap-xhdpi | 96x96 |
| mipmap-xxhdpi | 144x144 |
| mipmap-xxxhdpi | 192x192 |

Use Android Studio's Image Asset tool to generate these from icon-512.png.

---

## Play Store Listing Requirements

### Required Assets

| Asset | Size | Format |
|-------|------|--------|
| App Icon | 512x512 | PNG (32-bit, no alpha) |
| Feature Graphic | 1024x500 | PNG or JPEG |
| Screenshots (min 2) | Min 320px | PNG or JPEG |
| Phone Screenshots | 16:9 or 9:16 | PNG or JPEG |

### Required Information

- **Short Description**: Max 80 characters
- **Full Description**: Max 4000 characters
- **Privacy Policy URL**: <https://yoursite.com/privacy>
- **Category**: Video Players & Editors
- **Content Rating**: Complete IARC questionnaire

### Suggested Descriptions

**Short (Spanish)**:
Genera videos de YouTube automáticamente con IA - Sin mostrar tu rostro

**Short (English)**:
Generate YouTube videos automatically with AI - Without showing your face

**Full Description Template**:

```
FacelessTube te permite crear videos profesionales para YouTube sin necesidad de aparecer en cámara.

✨ CARACTERÍSTICAS:
• Videos generados con IA
• Narración automática
• Fondos de stock gratuitos
• Subida directa a YouTube
• Multi-idioma (ES, EN, PT, FR, DE, ZH)

📱 PLANES:
• Free: 3-5 videos/mes
• Starter: 30 videos/mes
• Pro: 100 videos/mes
• Unlimited: Sin límites

🎯 PERFECTO PARA:
• Creadores de contenido
• Canales de nicho
• Historias y storytelling
• Videos educativos

Descarga ahora y empieza a crear contenido profesional.
```

---

## Testing Checklist

Before submitting to Play Store:

- [ ] App installs correctly
- [ ] All navigation works
- [ ] Login/logout works
- [ ] Video generation works
- [ ] Offline mode shows proper message
- [ ] Back button behavior is correct
- [ ] App doesn't crash on rotation
- [ ] Loading states work properly
- [ ] Error messages are clear

---

## Submission Process

1. Create Google Play Developer account ($25 one-time)
2. Create new app in Play Console
3. Complete all required sections
4. Upload AAB file (not APK for new apps)
5. Submit for review (1-7 days typically)

---

## Version Updates

When updating the app:

1. Increment `versionCode` in build.gradle
2. Update `versionName` for users
3. `npm run build && npx cap sync android`
4. Generate signed AAB
5. Upload to Play Console
