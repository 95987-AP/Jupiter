# 🧪 Quick Test Guide

## Sprawdź czy strona działa:

### 1. Otwórz stronę
```
http://localhost:3001/
```

### 2. Co powinno być widoczne NATYCHMIAST:

✅ **Tło galaktyki** - fioletowo-pomarańczowa spiralna galaktyka z 40,000 cząstek
✅ **Jowisz** - duża planeta w centrum z realistyczną teksturą
✅ **4 Księżyce** - Io, Europa, Ganymede, Callisto na orbitach
✅ **~60 Asteroidów** - kamienne obiekty orbitujące wokół
✅ **800 Cząstek debris** - małe świecące punkty
✅ **Lens flares** - białe/pomarańczowe/niebieskie świetlne efekty
✅ **Gwiazdy** - tło z gwiazdami

### 3. Przetestuj scroll:

**Na początku (0% scroll):**
- Kamera daleko (z=12)
- Jowisz mały
- Wszystko widoczne

**W połowie (50% scroll):**
- Kamera się zbliża
- Jowisz rośnie
- Asteroidy wirują

**Na końcu (100% scroll):**
- Kamera bardzo blisko (z=3.5)
- Jowisz wypełnia ekran (1.5× większy)
- Księżyce zniknęły (za kamerą)
- Widać szczegóły tekstury Jowisza

### 4. Sprawdź konsolę (F12):

**NIE POWINNO BYĆ:**
- ❌ Błędów THREE.js
- ❌ Błędów TypeScript
- ❌ "Cannot read property..."
- ❌ "NaN" w logach

**MOŻE BYĆ:**
- ⚠️ Warnings o chunk size (to normalne)

### 5. Sprawdź wydajność:

**Otwórz Performance (F12 → Performance → Record)**
- FPS: powinno być ~60 (minimum 30)
- Frame time: ~16ms (maximum 33ms)

Jeśli FPS < 30:
- Zmniejsz asteroidy w GalaxyBackground.tsx: `<AsteroidField count={30} />`
- Zmniejsz debris: `<DebrisField count={400} />`

### 6. Sprawdź tekstury:

**Network tab (F12 → Network → Img)**

Powinny załadować się:
- ✅ `2k_jupiter.jpg` (499 KB)
- ✅ `immo-wegmann-uvKYxUxaAi4-unsplash.jpg` (3.9 MB)

Jeśli 404:
- Sprawdź czy pliki są w `public/textures/`
- Zrestartuj serwer dev

---

## ⚡ Quick Fixes:

### Problem: Czarny ekran
```bash
# Wyczyść cache i zbuduj od nowa
rm -rf node_modules dist .vite
npm install
npm run dev
```

### Problem: TypeScript errors
```bash
# Sprawdź błędy
npx tsc --noEmit

# Jeśli są błędy - zobacz TROUBLESHOOTING.md
```

### Problem: Lag/Low FPS
**W GalaxyBackground.tsx zmień:**
```typescript
<AsteroidField count={30} scrollY={scrollY} />  // było 60
<DebrisField count={400} scrollY={scrollY} />   // było 800
<GalaxyParticles count={20000} scrollY={scrollY} /> // było 40000
```

---

## ✅ Jeśli wszystko działa:

Powinieneś widzieć:
- 🪐 Rotujący Jowisz z realistyczną teksturą
- 🌙 4 księżyce krążące na orbitach
- ☄️ Asteroidy z lens flares
- 🌌 Spiralną galaktykę w tle
- ⭐ Gwiazdy na różnych głębokościach
- 🎬 Smooth zoom effect przy scrollowaniu

**Gratulacje! Strona działa! 🎉**
