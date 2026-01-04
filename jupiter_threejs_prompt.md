# PROMPT DLA CLAUDE - IMPLEMENTACJA ANIMOWANEGO JOWISZA W THREE.JS

## Cel projektu
Stwórz kompletną, działającą aplikację Three.js przedstawiającą realistyczny, animowany model Jowisza z ruchomą warstwą atmosfery.

---

## WYMAGANIA FUNKCJONALNE

### 1. Struktura Dual-Layer
- **Sfera bazowa:** główna powierzchnia Jowisza z teksturą
- **Sfera atmosfery:** transparentna warstwa chmur o promieniu 1.05x większym
- **Różne prędkości rotacji** dla każdej warstwy (atmosfera szybsza)

### 2. Materiały i Tekstury
- **Bazowa sfera:** użyj proceduralne tekstury Jowisza LUB placeholder z wyraźnymi pasami w kolorach: beżowy, pomarańczowy, brązowy, kremowy
- **Warstwa chmur:** semi-transparentna (opacity: 0.6-0.8) z efektem przepływu
- **Bump mapping** dla głębi powierzchni
- Użyj `depthWrite: false` dla warstwy chmur

### 3. Animacje
- Wolna rotacja bazowej sfery: `0.0003 rad/frame`
- Szybsza rotacja warstwy chmur: `0.0005 rad/frame`
- **Opcjonalnie:** animacja UV offset dla efektu przepływu chmur
- Płynna animacja 60fps

### 4. Oświetlenie
- **DirectionalLight** symulujący Słońce (jasne, białe światło z jednej strony)
- **AmbientLight** dla podstawowego oświetlenia (słabe, ciepłe)
- Efekt połysku/glow na podświetlonej stronie

### 5. Kamera i Kontrolki
- Implementuj **OrbitControls** dla interaktywnej eksploracji
- Początkowa pozycja kamery: widok z dystansu pokazujący całą planetę
- Umożliw zoom, obracanie, ale **zablokuj zbliżanie** poniżej określonej odległości
- Smooth damping dla płynnych ruchów

### 6. Efekty dodatkowe
- **Atmosphere glow:** trzecia, większa sfera z shaderem tworzącym pomarańczową poświatę wokół planety
- **Post-processing bloom** (opcjonalnie, jeśli to nie spowolni)
- **Tło:** realistyczne star field lub czarna przestrzeń kosmiczna

---

## SPECYFIKACJE TECHNICZNE

### Framework i Format
- **Framework:** Three.js (najnowsza wersja z CDN)
- **Format:** HTML + embedded JavaScript (single file artifact)
- **Responsywność:** canvas fullscreen, automatyczne dopasowanie do okna

### Optymalizacja
- Geometry z odpowiednią liczbą segmentów (64x64 dla smooth sphere)
- Efficient texture loading
- requestAnimationFrame dla animacji
- Target: 60fps performance

---

## DETALE IMPLEMENTACYJNE

### Przykładowa struktura kodu

```javascript
// Bazowy Jowisz
const jupiterGeometry = new THREE.SphereGeometry(radius, 64, 64);
const jupiterMaterial = new THREE.MeshPhongMaterial({
  // konfiguracja z teksturą lub procedural
  map: jupiterTexture,
  bumpMap: jupiterTexture,
  bumpScale: 0.02
});
const jupiterMesh = new THREE.Mesh(jupiterGeometry, jupiterMaterial);

// Warstwa chmur
const cloudsGeometry = new THREE.SphereGeometry(radius * 1.05, 64, 64);
const cloudsMaterial = new THREE.MeshPhongMaterial({
  map: cloudsTexture,
  transparent: true,
  opacity: 0.7,
  depthWrite: false,
  side: THREE.DoubleSide,
  // opcjonalnie: blending: THREE.AdditiveBlending
});
const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);

// Glow atmosphere (shader lub dodatkowa sfera)
const glowGeometry = new THREE.SphereGeometry(radius * 1.15, 32, 32);
const glowMaterial = new THREE.ShaderMaterial({
  // custom shader material dla glow effect
});

// Animacja
function animate() {
  jupiterMesh.rotation.y += 0.0003;
  cloudsMesh.rotation.y += 0.0005;
  
  // Opcjonalnie - przepływ tekstury
  cloudsTexture.offset.x += 0.0001;
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

---

## TEKSTURY - OPCJE

Jeśli nie możesz załadować zewnętrznych tekstur Jowisza, użyj jednej z opcji:

1. **Proceduralne tekstury** używając Canvas API z charakterystycznymi pasami
2. **Kolorowe gradienty** z noise pattern
3. **Proste paski** w odcieniach:
   - `#D4A574` (jasny beż)
   - `#C89968` (ciemny beż)
   - `#B67E52` (brąz)
   - `#E8D4B8` (kremowy)

### Źródła tekstur (opcjonalnie)
- Planet Pixel Emporium: planetpixelemporium.com/jupiter.html
- Solar System Scope: solarsystemscope.com/textures
- NASA Resources: NASA Goddard Space Flight Center

---

## VISUAL REFERENCE

### Efekt powinien przypominać:
- Stronę **earth.plus360degrees.com** (ruchome chmury nad statyczną powierzchnią)
- Realistyczny Jowisz z wirującymi pasami atmosfery
- Wielka Czerwona Plama (opcjonalnie jako dodatkowa warstwa lub część tekstury)
- Dynamiczny, żywy wygląd planety

---

## UI/UX

- **Brak UI controls** (pure 3D experience)
- Intuicyjne OrbitControls
- Smooth performance
- Loading indicator jeśli tekstury ładują się z zewnątrz

---

## KOLOR I ATMOSFERA

### Paleta kolorów
- **Główne kolory:** ciepłe odcienie pomarańczy, beży, brązy
- **Glow:** pomarańczowy/złoty
- **Tło:** głęboka czerń z subtelnymi gwiazdami
- **Oświetlenie:** ciepłe, symulujące słońce

---

## OUTPUT

### Wymagania końcowe

Stwórz jeden kompletny **artifact HTML** z:
- Wszystkim niezbędnym kodem
- Komentarzami wyjaśniającymi kluczowe sekcje
- Gotowy do immediate deployment
- Działający out of the box

### Kod powinien być:
- ✅ Czysty i dobrze zorganizowany
- ✅ Wydajny (60fps)
- ✅ Łatwy do modyfikacji (zmiana kolorów, prędkości, rozmiaru)
- ✅ Zgodny z najlepszymi praktykami Three.js

---

## CHECKLIST IMPLEMENTACJI

- [ ] Scena Three.js z odpowiednim setupem
- [ ] Dwie sfery (bazowa + chmury) z różnymi prędkościami rotacji
- [ ] Oświetlenie (DirectionalLight + AmbientLight)
- [ ] OrbitControls z ograniczeniami
- [ ] Tekstury (proceduralne lub załadowane)
- [ ] Glow/atmosphere effect
- [ ] Starfield background
- [ ] Responsywny canvas
- [ ] Optymalizacja wydajności
- [ ] Komentarze w kodzie

---

## DODATKOWE UWAGI

- Użyj najnowszej stabilnej wersji Three.js z CDN
- Upewnij się, że kod działa w nowoczesnych przeglądarkach (Chrome, Firefox, Safari, Edge)
- Przetestuj wydajność na różnych urządzeniach
- Zachowaj modularność kodu dla łatwiejszych modyfikacji

---

**Koniec promptu**