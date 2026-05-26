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

- **🔑 Sin API Key** — Usa la API REST pública de GitHub directamente desde el navegador.
- **🌐 Sin Servidor** — Funciona 100% en el cliente (Client-side), desplegable en GitHub Pages totalmente gratis.
- **⚡ Vista Previa Instantánea** — Las tarjetas SVG se generan localmente en milisegundos (sin peticiones a servidores externos).
- **🎨 Tema Claro y Oscuro** — Alterna entre el tema claro y oscuro de GitHub en la vista previa interactiva.
- **🐍 Snake Hermoso** — Animación del clásico juego de la serpiente de contribuciones con brillo, gradientes y diseño moderno.
- **📄 4 Plantillas Pro** — Minimalista · Portafolio · Creativa · Terminal.
- **📤 Exportación a un Clic** — Descarga directa de tu `README.md` listo para usar.

## 🛠️ Tecnologías

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Static Export) |
| Lenguaje | TypeScript 5.7 |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Datos | GitHub REST API (pública, sin autenticación) |
| Generación SVG | TypeScript Puro, Client-side |
| Despliegue | GitHub Pages vía GitHub Actions |

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Carlos-Coronel/GitMorphosis.git
cd GitMorphosis

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

### Despliegue a GitHub Pages (Automático)

> **Configuración de una sola vez — luego cada push a `main` se despliega automáticamente.**

1. **Haz un Fork** de este repositorio hacia tu propia cuenta de GitHub.

2. Ve a tu fork → **Settings** → **Pages**
   - Source: Selecciona `Deploy from a branch`
   - Branch: `gh-pages` / `/ (root)`
   - Haz clic en **Save**

3. Ve a **Settings** → **Actions** → **General**
   - En la sección "Workflow permissions", asegúrate de seleccionar **Read and write permissions**.
   - Marca la casilla **Allow GitHub Actions to create and approve pull requests**.

4. Dispara el primer despliegue manualmente:
   ```bash
   git commit --allow-empty -m "trigger deploy"
   git push
   ```

5. ¡Tu aplicación estará en vivo en: `https://<tu-usuario>.github.io/GitMorphosis/`!

> El flujo de trabajo en [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) se ejecuta automáticamente en cada push a la rama `main`.

## 📁 Estructura del Proyecto

```
GitMorphosis/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Auto-deploy a GitHub Pages
│       └── ci.yml              # Type-check en Pull Requests
│
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── profile-generator.tsx   # Componente principal de la app
│   ├── readme-preview.tsx      # Vista previa en vivo con cambio de tema
│   └── ...
│
├── lib/
│   ├── client/                 # ← Módulos client-side (funcionan en GH Pages)
│   │   ├── github-api.ts       # Cliente de la API de GitHub
│   │   └── svg/
│   │       ├── stats-card.ts   # Generador de estadísticas
│   │       ├── top-langs-card.ts
│   │       ├── pin-card.ts
│   │       └── snake-card.ts   # 🐍 Generador de serpiente animada
│   │
│   ├── application/
│   │   └── readme-builder.ts   # Patrón Builder para generar Markdown
│   └── domain/
│       └── types.ts            # Interfaces TypeScript
│
└── public/
```

## 🏗️ Arquitectura

```
Navegador
  │
  ├─ fetchGitHubProfile()  ──→  api.github.com  (pública, sin CORS, sin Auth)
  │
  ├─ readme-builder.ts     ──→  Genera la cadena Markdown (TS puro)
  │
  └─ SVG generators        ──→  stats-card.ts, snake-card.ts, etc.
                                 Devuelven URIs de datos (data URIs) para vista previa.
                                 El README exportado usa URLs públicas.
```

**Cómo funciona el Snake en el README generado:**

Cuando la aplicación corre estáticamente en GitHub Pages, el Snake en el README final apunta a:
```
https://raw.githubusercontent.com/<usuario>/<usuario>/output/github-contribution-grid-snake.svg
```
Este archivo debe ser generado por un **GitHub Action en tu propio repositorio de perfil**. Para configurarlo, crea este workflow en `<tu-usuario>/<tu-usuario>/.github/workflows/snake.yml`:

```yaml
name: Generate Snake
on:
  schedule: [{ cron: '0 */12 * * *' }]
  workflow_dispatch:
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk@v3
        with:
          github_user_name: ${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark
      - uses: crazy-max/ghaction-github-pages@v3
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 📊 Límites de la API (Rate Limits)

| Modo | Límite |
|---|---|
| Anónimo (Por defecto) | 60 peticiones / hora / IP |
| Con token personal (Opcional) | 5,000 peticiones / hora |

Cada generación de perfil consume ~2 peticiones a la API (perfil del usuario + repositorios). Si se alcanza el límite, se notificará en la interfaz.

## 🎨 Plantillas Disponibles

| Plantilla | Descripción |
|---|---|
| **Minimalista** | Limpia, diseño minimalista, solo con la información esencial |
| **Portafolio** | Escaparate completo con estadísticas, trofeos y repositorios destacados |
| **Creativa** | Diseño vibrante con animación SVG tipo máquina de escribir |
| **Terminal** | Estética Hacker/Retro con arte ASCII |

## 🤝 Contribuir

```bash
# Haz Fork → Clona → Crea Rama
git checkout -b feature/mi-funcionalidad

# Desarrolla
npm run dev

# Valida
npm run type-check
npm run build

# ¡Crea un PR!
```

## 📄 Licencia

MIT © 2024–2026 [Carlos Coronel](https://github.com/Carlos-Coronel)

---

<div align="center">
Construido con ❤️ usando Next.js · Funciona en cualquier parte · Despliegue a un clic
</div>
