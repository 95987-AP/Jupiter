# 🐛 Troubleshooting Guide - Jupiter Experience

## ✅ NAPRAWIONO - Wszystkie błędy TypeScript

### Krytyczne błędy które blokowały renderowanie:

#### 1. **TypeScript Error: distanceToCamera undefined**
```typescript
// BŁĄD w AsteroidField.tsx (linia 363):
const scale = baseScale * (1 - distanceToCamera / 40) * (1 + pulseFactor * 0.2);

// NAPRAWIONO:
const scale = baseScale * (1 - distanceToCenter / 40) * (1 + pulseFactor * 0.2);
```
**Problem**: Użyto niewłaściwej nazwy zmiennej

#### 2. **TypeScript Error: opacity nie istnieje na Material[]**
```typescript
// BŁĄD w GalaxyBackground.tsx (linia 150):
atmosphereRef.current.material.opacity = baseOpacity * (1 + scrollProgress * 0.3);

// NAPRAWIONO:
if (atmosphereRef.current.material instanceof THREE.MeshBasicMaterial) {
  atmosphereRef.current.material.opacity = baseOpacity * (1 + scrollProgress * 0.3);
}
```
**Problem**: Material może być array, trzeba sprawdzić instanceof

#### 3. **TypeScript Error: fov nie istnieje na Camera**
```typescript
// BŁĄD w GalaxyBackground.tsx (linia 322):
camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.05);

// NAPRAWIONO:
if ('fov' in camera) {
  const targetFOV = THREE.MathUtils.lerp(45, 35, scrollProgress);
  camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.05);
  camera.updateProjectionMatrix();
}
```
**Problem**: Tylko PerspectiveCamera ma `fov`, OrthographicCamera nie

---

## Problem: Strona miga i znika (tylko niebieskie tło)

### Rozwiązanie zastosowane:

#### 4. **Naprawa maxScroll Division by Zero**
```typescript
// PRZED (błąd):
const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
const scrollProgress = Math.min(scrollY / maxScroll, 1);

// PO (naprawione):
const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
```

**Powód**: Przy załadowaniu strony `scrollHeight - innerHeight` może być 0 lub ujemne, co powoduje `NaN` w obliczeniach.

#### 5. **Naprawa OrbitingMoons - linie orbitalne**
```typescript
// PRZED (błędne refs):
const moonRefs = useRef<Array<THREE.Mesh>>([]);
const orbitLinesRef = useRef<Array<THREE.Line>>([]);

// PO (poprawne nullable refs):
const moonRefs = useRef<Array<THREE.Mesh | null>>([]);
const orbitLinesRef = useRef<Array<THREE.Line | null>>([]);
```

**Powód**: Refs mogą być null przy pierwszym renderze, co powodowało błędy.

#### 6. **Użycie `primitive` dla linii**
```typescript
// Poprawna metoda renderowania THREE.Line
<primitive 
  object={new THREE.Line(geometry, material)}
  ref={(el: THREE.Line | null) => { 
    if (el) orbitLinesRef.current[i] = el; 
  }}
/>
```

**Powód**: `<line>` component nie działa poprawnie w R3F, trzeba użyć `<primitive>`.

---

## Typowe problemy i rozwiązania:

### Problem: "Cannot read property 'position' of undefined"
**Rozwiązanie**: Dodaj sprawdzenie `if (ref.current)` przed użyciem ref.

### Problem: Asteroidy nie widoczne
**Rozwiązanie**: Sprawdź czy tekstura się załadowała:
```typescript
if (!texture) {
  return null; // Lub loading placeholder
}
```

### Problem: Lens flares nie widoczne
**Rozwiązanie**: Sprawdź blending mode i opacity:
```typescript
blending: THREE.AdditiveBlending,
transparent: true,
opacity: 0.6
```

### Problem: Strona lagi przy scrollowaniu
**Rozwiązanie**: 
1. Zmniejsz liczbę asteroidów: `<AsteroidField count={30} />`
2. Zmniejsz cząstki debris: `<DebrisField count={400} />`
3. Zmniejsz galaxy particles: `<GalaxyParticles count={20000} />`

---

## Diagnostyka:

### Sprawdź konsolę przeglądarki (F12):
```bash
# Otwórz Dev Tools → Console
# Szukaj błędów THREE.js lub React
```

### Sprawdź czy tekstury się ładują:
```bash
# Dev Tools → Network → Img
# Powinny być widoczne:
# - 2k_jupiter.jpg
# - immo-wegmann-uvKYxUxaAi4-unsplash.jpg
```

### Sprawdź wydajność:
```bash
# Dev Tools → Performance
# FPS powinno być ~60
# Jeśli poniżej 30 - zmniejsz liczniki particles
```

---

## Testowanie lokalne:

```bash
# 1. Zainstaluj dependencies
npm install

# 2. Uruchom dev server
npm run dev

# 3. Otwórz w przeglądarce
http://localhost:3000 (lub 3001)

# 4. Sprawdź build
npm run build

# 5. Preview prod build
npm run preview
```

---

## Wsparcie dla starszych przeglądarek:

### Jeśli strona nie działa w Safari/Edge:
1. Dodaj polyfills dla WebGL2
2. Zmień renderer na WebGL1
3. Wyłącz advanced features (lens flares, normal maps)

### Fallback dla mobilnych:
```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

<AsteroidField count={isMobile ? 20 : 60} />
<DebrisField count={isMobile ? 200 : 800} />
```

---

## ✅ Status naprawy:

- [x] **KRYTYCZNE**: distanceToCamera → distanceToCenter
- [x] **KRYTYCZNE**: Material type guard (instanceof check)
- [x] **KRYTYCZNE**: Camera fov type guard ('fov' in camera)
- [x] Division by zero w maxScroll
- [x] Nullable refs w OrbitingMoons
- [x] Poprawne renderowanie linii orbitalnych
- [x] Smooth fallback values
- [x] Build bez błędów
- [x] TypeScript compilation success
- [x] Wszystkie tekstury ładują się poprawnie

**Strona działa teraz na: http://localhost:3001/** 🚀✅
