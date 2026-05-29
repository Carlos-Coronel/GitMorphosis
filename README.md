<div align="center">

# 🐍 GitMorphosis

**Genera impresionantes READMEs para tu perfil de GitHub automáticamente — sin necesidad de API keys.**

[![Deploy](https://github.com/Carlos-Coronel/GitMorphosis/actions/workflows/deploy.yml/badge.svg)](https://github.com/Carlos-Coronel/GitMorphosis/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://typescriptlang.org)

[**🚀 Demo en Vivo**](https://carlos-coronel.github.io/GitMorphosis/) · [Reportar Error](https://github.com/Carlos-Coronel/GitMorphosis/issues) · [Sugerir Funcionalidad](https://github.com/Carlos-Coronel/GitMorphosis/issues)

</div>

---

## ✨ Características

- **🔑 Sin API Key requerida** — Usa la API REST pública de GitHub directamente desde el navegador. Opcionalmente agrega un token PAT para obtener 5,000 req/hora y repos fijados reales vía GraphQL.
- **🌐 100% Client-side** — Funciona sin servidor. Desplegable gratuitamente en GitHub Pages.
- **⚡ Vista Previa Instantánea** — Tarjetas SVG generadas localmente en milisegundos, sin peticiones externas.
- **🎨 Temas Claro y Oscuro** — Alterna entre el tema claro y oscuro de GitHub en la vista previa interactiva.
- **📄 4 Plantillas Profesionales** — Minimalista · Portafolio · Creativa · Terminal.
- **🔗 Redes Sociales Personalizables** — Editor de links para LinkedIn, Twitter/X, YouTube, Discord y más.
- **📤 Exportación a un Clic** — Descarga directa del `README.md` o copia al portapapeles.
- **🐍 Contribution Snake Opcional** — Animación de serpiente de contribuciones (requiere GitHub Action propio).
- **🛡️ Health Check de Servicios** — Monitoreo en tiempo real del estado de apis externas (github-readme-stats, streak-stats, etc.).

---

## 🛠️ Tecnologías

| Capa            | Tecnología                                          |
|-----------------|-----------------------------------------------------|
| Framework       | Next.js 16 (App Router, Static Export)              |
| Lenguaje        | TypeScript 5.7                                      |
| Estilos         | Tailwind CSS v4 + shadcn/ui + CSS Variables (OKLCH) |
| Datos           | GitHub REST API + GraphQL API (opcional con PAT)    |
| Generación SVG  | TypeScript puro, client-side                        |
| Gestión Estado  | React Hooks personalizados (`useProfileGenerator`)  |
| Despliegue      | GitHub Pages vía GitHub Actions                     |

---

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Carlos-Coronel/GitMorphosis.git
cd GitMorphosis

# 2. Instalar dependencias (usa pnpm)
pnpm install

# 3. Iniciar el servidor de desarrollo
pnpm dev

# Abrir http://localhost:3000
```

### Comandos Disponibles

```bash
pnpm dev          # Servidor de desarrollo con Turbopack
pnpm build        # Build de producción (export estático)
pnpm type-check   # Verificación de tipos TypeScript sin compilar
pnpm lint         # Análisis estático de código con ESLint
```

### Despliegue a GitHub Pages (Automático)

> **Configuración de una sola vez — luego cada push a `main` se despliega automáticamente.**

1. **Haz un Fork** de este repositorio hacia tu propia cuenta de GitHub.

2. Ve a tu fork → **Settings** → **Pages**
   - Source: `Deploy from a branch`
   - Branch: `gh-pages` / `/ (root)` → **Save**

3. Ve a **Settings** → **Actions** → **General**
   - Permisos de workflow: **Read and write permissions**
   - Marca **Allow GitHub Actions to create and approve pull requests**

4. Dispara el primer despliegue:
   ```bash
   git commit --allow-empty -m "trigger: first deploy"
   git push
   ```

5. Tu app estará en vivo en `https://<tu-usuario>.github.io/GitMorphosis/`

> El workflow en [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) se ejecuta automáticamente en cada push a `main`.

---

## 📁 Estructura del Proyecto

```
GitMorphosis/
│
├── app/                            # Next.js App Router (rutas y página principal)
│   ├── globals.css                 # Sistema de diseño completo: temas, animaciones, glassmorphism
│   ├── layout.tsx                  # Layout raíz: fuentes, metadata SEO, ThemeProvider
│   └── page.tsx                    # Punto de entrada → monta <ProfileGenerator />
│
├── components/
│   ├── generator/                  # Sub-componentes del generador (UI declarativa)
│   │   ├── action-buttons.tsx      # Botones de descarga, copia y links a GitHub
│   │   ├── advanced-settings.tsx   # Acordeón de opciones avanzadas (PAT, social links, servers)
│   │   ├── generator-hero.tsx      # Encabezado, título animado y badges de características
│   │   └── service-status.tsx      # Badges de estado de APIs externas y Rate Limit
│   │
│   ├── ui/                         # Componentes base de shadcn/ui (Button, Badge, Switch…)
│   │
│   ├── analytics-wrapper.tsx       # Wrapper de Vercel Analytics (lazy, sin bloqueo)
│   ├── github-token-input.tsx      # Input seguro para token PAT con validación en tiempo real
│   ├── profile-generator.tsx       # 🎯 Componente orquestador (< 140 líneas, solo layout)
│   ├── profile-stats.tsx           # Sidebar con avatar, estadísticas y lenguajes del perfil
│   ├── readme-preview.tsx          # Vista previa Markdown con renderer propio, temas y fullscreen
│   ├── social-links-editor.tsx     # Editor de redes sociales con detección automática
│   ├── template-selector.tsx       # Selector visual de plantilla con tarjetas animadas
│   ├── theme-provider.tsx          # Provider de tema claro/oscuro (next-themes)
│   └── username-input.tsx          # Input principal de búsqueda de usuario de GitHub
│
├── hooks/                          # Lógica de negocio desacoplada de la UI
│   ├── use-profile-generator.ts    # Hook principal: orquesta generación, caché, debounce y config
│   └── use-rate-limit.ts           # Hook de gestión del Rate Limit con refresco automático
│
├── lib/
│   ├── application/                # Casos de uso (Capa de Aplicación)
│   │   ├── profile-service.ts      # Servicio orquestador de perfil (Inyección de Dependencias)
│   │   └── readme-builder.ts       # Patrón Builder + Strategy para generar Markdown por plantilla
│   │
│   ├── domain/                     # Definiciones puras del dominio (sin dependencias externas)
│   │   └── types.ts                # Interfaces: GitHubProfile, Template, GenerateResult, etc.
│   │
│   ├── infrastructure/             # Implementaciones de acceso a datos y servicios externos
│   │   ├── github-api.ts           # Cliente GitHub REST + GraphQL API (token, cache, rate limit)
│   │   ├── service-health.ts       # Health checks periódicos de APIs externas con caché
│   │   ├── scraping/               # (Reservado — sin scraping activo en producción)
│   │   └── svg/                    # Generadores de tarjetas SVG 100% client-side
│   │       ├── stats-card.ts       # Tarjeta de estadísticas de GitHub
│   │       ├── top-langs-card.ts   # Tarjeta de lenguajes más usados
│   │       ├── pin-card.ts         # Tarjeta de repositorio fijado
│   │       ├── snake-card.ts       # 🐍 Animación de serpiente de contribuciones
│   │       └── trophy-card.ts      # Tarjeta de trofeos de GitHub
│   │
│   └── utils.ts                    # Utilidades compartidas (cn, clsx, tailwind-merge)
│
├── tools/                          # Scripts de desarrollo y utilidades CLI
│   ├── generate-readme.ts          # CLI para generar README desde terminal (Node.js)
│   └── check-services.js           # Script de diagnóstico de salud de servicios externos
│
├── public/                         # Assets estáticos servidos directamente
├── .github/workflows/              # CI/CD: deploy.yml (GitHub Pages) + ci.yml (type-check en PRs)
├── components.json                 # Configuración de shadcn/ui
├── next.config.mjs                 # Configuración de Next.js (Static Export, basePath)
├── postcss.config.mjs              # Configuración de PostCSS para Tailwind v4
├── pnpm-lock.yaml                  # Lockfile de dependencias (gestor: pnpm)
└── tsconfig.json                   # Configuración TypeScript con alias de ruta @/
```

---

## 🏗️ Arquitectura

El proyecto sigue principios de **Arquitectura Limpia / Hexagonal**, desacoplando completamente la UI de la lógica de negocio:

```
┌─────────────────────────────────────────────────────────────────┐
│                      UI (Presentación)                          │
│  profile-generator.tsx  →  Orquestador declarativo (<140 líneas)│
│  components/generator/  →  Subcomponentes visuales puros        │
└────────────────────────────┬────────────────────────────────────┘
                             │ consume
┌────────────────────────────▼────────────────────────────────────┐
│                     Hooks (Lógica de Estado)                    │
│  useProfileGenerator  →  Orquesta fetch, caché, debounce, config│
│  useRateLimit         →  Gestión y refresco del Rate Limit       │
└────────────────────────────┬────────────────────────────────────┘
                             │ consume
┌────────────────────────────▼────────────────────────────────────┐
│                  Aplicación (Casos de Uso)                      │
│  readme-builder.ts    →  Patrón Builder + Strategy por plantilla│
│  profile-service.ts   →  Servicio de perfil (DI-ready)          │
└────────────────────────────┬────────────────────────────────────┘
                             │ consume
┌────────────────────────────▼────────────────────────────────────┐
│               Infraestructura (Implementaciones)                │
│  github-api.ts        →  REST + GraphQL API Client              │
│  service-health.ts    →  Health checks con caché                │
│  svg/                 →  Generadores SVG client-side            │
└─────────────────────────────────────────────────────────────────┘
                             │ accede
                    api.github.com (CORS público)
```

**Flujo de datos en una generación:**
1. El usuario ingresa un username → `UsernameInput` llama a `handleGenerate`.
2. `useProfileGenerator` verifica la caché → si miss, llama a `fetchGitHubProfile()` (REST + GraphQL opcional).
3. Se mezclan los social links del usuario con los datos del perfil.
4. `createReadmeBuilder().build()` aplica la estrategia de plantilla elegida y genera el Markdown.
5. La UI actualiza la vista previa con el Markdown renderizado, usando SVGs locales como placeholders.

---

## 📊 Límites de la API (Rate Limits)

| Modo                        | Límite                            |
|-----------------------------|-----------------------------------|
| Anónimo (por defecto)       | 60 peticiones / hora / IP         |
| Con token PAT (opcional)    | 5,000 peticiones / hora           |
| GraphQL (repos fijados)     | Requiere token PAT con `read:user`|

Cada generación de perfil consume **~2 peticiones REST** (perfil + repositorios). El indicador de Rate Limit en la interfaz se refresca automáticamente cada 60 segundos.

---

## 🎨 Plantillas Disponibles

| Plantilla       | Descripción                                                        |
|-----------------|--------------------------------------------------------------------|
| **Minimalista** | Diseño limpio y esencial con stats y proyectos destacados          |
| **Portafolio**  | Showcase profesional completo: tech stack, stats, trofeos y repos  |
| **Creativa**    | Animación SVG tipo máquina de escribir, header degradado y tabla de skills |
| **Terminal**    | Estética hacker/retro con arte ASCII y estadísticas al estilo CLI  |

---

## 🐍 Contribution Snake en el README generado

Cuando habilitas la opción Snake en las Opciones Avanzadas, el README generado apuntará a:
```
https://raw.githubusercontent.com/<usuario>/<usuario>/output/github-contribution-grid-snake.svg
```

Debes configurar el siguiente GitHub Action en tu repositorio de perfil (`<usuario>/<usuario>`):

```yaml
# .github/workflows/snake.yml
name: Generate Snake Animation
on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk/svg-only@v3
        with:
          github_user_name: ${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark
      - uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 🤝 Contribuir

```bash
# 1. Haz Fork → Clona tu fork → Crea una rama descriptiva
git checkout -b feature/nueva-plantilla

# 2. Desarrolla y verifica
pnpm dev
pnpm type-check

# 3. Confirma que el build pasa sin errores
pnpm build

# 4. Crea un Pull Request con descripción de tus cambios
```

> **Buenas prácticas**: Mantén la Arquitectura Limpia al agregar funcionalidades. La lógica de negocio va en `hooks/` o `lib/`, nunca directamente en componentes.

---

## 📄 Licencia

MIT © 2024–2026 [Carlos Coronel](https://github.com/Carlos-Coronel)

---

<div align="center">
Construido con ❤️ usando <strong>Next.js</strong> · Arquitectura Limpia · Desplegable en cualquier parte
</div>
