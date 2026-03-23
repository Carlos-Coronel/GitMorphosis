# Generador de Perfil GitHub

Una aplicación web moderna que genera automáticamente perfiles README.md profesionales para usuarios de GitHub extrayendo datos públicos.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwindcss)

## Características

- **Sin Requerimientos de API Key** - Extrae datos públicos de GitHub sin autenticación
- **4 Plantillas Profesionales** - Minimalista, Portafolio, Creativa (animada), Terminal (estilo hacker)
- **Previsualización en Tiempo Real** - Mira tu README renderizado mientras personalizas
- **Descarga con Un Clic** - Exporta como archivo `.md` listo para tu perfil
- **Insignias Auto-generadas** - Estadísticas GitHub, racha de contribuciones, trofeos e insignias de lenguajes
- **Arquitectura Limpia** - Diseño dirigido por dominio con separación de responsabilidades

## Pila Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **Arquitectura**: Clean Architecture (capas Domain, Application, Infrastructure)

## Comenzando

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/github-profile-generator.git

# Navegar al proyecto
cd github-profile-generator

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

### Uso

1. Ingresa un nombre de usuario de GitHub en el campo de búsqueda
2. Espera a que se extraigan los datos del perfil
3. Selecciona un estilo de plantilla (Minimalista, Portafolio, Creativa o Terminal)
4. Previsualiza el README generado
5. Haz clic en "Descargar README.md" para guardar el archivo
6. Copia el archivo a tu repositorio de perfil GitHub (`usuario/usuario`)

## Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── profile/[username]/  # Obtener datos del perfil de usuario
│   │   ├── generate/            # Generar contenido del README
│   │   ├── templates/           # Listar plantillas disponibles
│   │   └── download/            # Descargar archivo README
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── profile-generator.tsx    # Componente principal de la aplicación
│   ├── username-input.tsx       # Entrada de búsqueda con validación
│   ├── template-selector.tsx    # Tarjetas selectoras de plantilla
│   ├── readme-preview.tsx       # Vista dual (renderizada/código)
│   └── profile-stats.tsx        # Visualización de estadísticas del usuario
├── lib/
│   ├── domain/
│   │   └── types.ts             # Interfaces y tipos de TypeScript
│   ├── application/
│   │   ├── profile-service.ts   # Servicio de orquestación de perfil
│   │   └── readme-builder.ts    # Generación README (patrón Builder)
│   ├── infrastructure/
│   │   └── scraping/
│   │       └── github-scraper.ts # Extractor HTML de GitHub
│   └── utils/
│       └── export.ts            # Utilidades de exportación
└── scripts/
    └── generate-readme.ts       # Script de automatización CLI
```

## Arquitectura

Este proyecto sigue los principios de **Arquitectura Limpia**:

### Capa de Dominio
Contiene entidades de negocio e interfaces:
- `GitHubUser` - Estructura de datos del perfil de usuario
- `Repository` - Información del repositorio
- `LanguageStats` - Estadísticas de lenguajes de programación
- Tipos de error personalizados para manejo de errores

### Capa de Aplicación
Contiene lógica de negocio y casos de uso:
- `ProfileService` - Orquesta la extracción de perfil y generación de README
- `ReadmeBuilder` - Implementa patrón Builder para construcción flexible del README
- Estrategias de plantilla para diferentes estilos de README

### Capa de Infraestructura
Contiene implementaciones de servicios externos:
- `GitHubScraper` - Extrae perfiles GitHub usando análisis de regex
- Sin dependencias de API externas requeridas

## Plantillas

| Plantilla | Descripción |
|-----------|-------------|
| **Minimalista** | Diseño limpio y simple enfocado en información esencial |
| **Portafolio** | Orientado a exhibición con destacados de proyectos y estadísticas detalladas |
| **Creativa** | Elementos animados con efectos de escritura y estilo visual |
| **Terminal** | Estilo hacker con arte ASCII y estética de línea de comandos |

## Referencia de API

### GET `/api/profile/[username]`
Obtiene datos del perfil extraído de un usuario de GitHub.

**Respuesta:**
```json
{
  "user": {
    "username": "octocat",
    "name": "The Octocat",
    "bio": "...",
    "avatarUrl": "...",
    "followers": 1000,
    "following": 10,
    "repositories": 50,
    "contributions": 365,
    "languages": { "JavaScript": 45, "TypeScript": 30 }
  }
}
```

### POST `/api/generate`
Genera contenido README basado en perfil y plantilla.

**Cuerpo de Solicitud:**
```json
{
  "username": "octocat",
  "template": "minimalista",
  "options": {
    "includeStats": true,
    "includeLanguages": true,
    "includeTrophies": true
  }
}
```

### POST `/api/download`
Retorna README como archivo descargable.

## Uso de CLI

Para automatización y pipelines de CI/CD:

```bash
# Generar README para un usuario
npx ts-node scripts/generate-readme.ts octocat

# Con plantilla específica
npx ts-node scripts/generate-readme.ts octocat --template=terminal

# Salida a archivo específico
npx ts-node scripts/generate-readme.ts octocat --output=./profile/README.md
```

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama de característica (`git checkout -b feature/caracteristica-sorprendente`)
3. Confirma tus cambios (`git commit -m 'Añadir característica sorprendente'`)
4. Envía a la rama (`git push origin feature/caracteristica-sorprendente`)
5. Abre un Pull Request

## Licencia

Licencia MIT - ver [LICENSE](LICENSE) para detalles.

---

Construido con Next.js y desplegado en Vercel.
