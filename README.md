# GitMorphosis

Generador autocontenido de README para perfiles de GitHub. Funciona como una aplicación estática en GitHub Pages: consulta únicamente la API oficial de GitHub y crea todos los gráficos como SVG dentro del navegador.

[Demo](https://carlos-coronel.github.io/GitMorphosis/) · [Errores y sugerencias](https://github.com/Carlos-Coronel/GitMorphosis/issues) · [Licencia MIT](LICENSE)

## Características

- Cuatro plantillas: Minimalista, Portafolio, Creativa y Terminal.
- Estadísticas, lenguajes, proyectos, trofeos, rachas, actividad, cabeceras y snake generados localmente.
- Variantes claras y oscuras mediante rutas relativas.
- Exportación ZIP con `README.md`, `assets/*.svg` y una guía de instalación.
- Vista previa fiel a los archivos descargados.
- Editor de enlaces sociales; los enlaces son navegables, pero no se cargan imágenes de terceros.
- Token PAT opcional guardado solamente en `sessionStorage`.
- Sin backend, telemetría, fuentes remotas ni servicios de tarjetas.

La única comunicación de red realizada por el producto es con `https://api.github.com`. Sin token se aplican los límites públicos de GitHub. Con token se amplía el límite y se consultan repositorios fijados y contribuciones mediante GraphQL. El token nunca se envía a GitMorphosis ni se persiste después de cerrar la pestaña.

## Uso

1. Introduce un usuario público de GitHub.
2. Elige una plantilla y, opcionalmente, configura enlaces o el contribution snake.
3. Descarga el ZIP completo.
4. Copia `README.md` y la carpeta `assets/` a la raíz del repositorio de perfil `<usuario>/<usuario>`.
5. Sube ambos elementos en el mismo commit.

Copiar únicamente el Markdown no es suficiente: sus gráficos utilizan los SVG locales incluidos en `assets/`.

## Desarrollo

Requisitos: Node.js 22 y pnpm 11.5.0. Las versiones están declaradas en `.nvmrc` y `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Comandos disponibles:

```bash
pnpm lint           # ESLint sin advertencias
pnpm dead-code      # archivos, exports y dependencias sin uso
pnpm type-check     # TypeScript estricto
pnpm test           # tests unitarios, integración y UI
pnpm test:coverage  # tests con umbrales de cobertura
pnpm build:pages    # exportación bajo /GitMorphosis
pnpm test:e2e       # Chromium escritorio y móvil
pnpm verify         # lint, tipos, cobertura y build
pnpm clean          # elimina .next y out en Windows/Linux/macOS
```

Para ejecutar E2E por primera vez:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

## Arquitectura

- `lib/infrastructure/github-api.ts`: REST/GraphQL, token de sesión y tratamiento de límites y errores.
- `lib/application/readme-builder.ts`: estrategias de las cuatro plantillas.
- `lib/application/local-assets.ts`: manifiesto y composición de recursos SVG.
- `lib/application/svg/`: generadores gráficos puros y deterministas.
- `lib/utils/export-bundle.ts`: validación de rutas y empaquetado ZIP.
- `hooks/use-profile-generator.ts`: orquestación del flujo cliente.

El tipo `GeneratedReadme` contiene el Markdown y un manifiesto `assets` con `{ path, content, mimeType }`. Ninguna plantilla puede introducir hosts gráficos externos; las pruebas verifican esta condición.

Las dependencias apuntan hacia el dominio: `application` contiene los casos de uso y renderizadores puros, mientras `infrastructure` se limita a GitHub. ESLint impide importaciones desde `application` hacia `infrastructure`. El catálogo de plantillas vive únicamente en el motor y la UI lo consulta, evitando configuraciones duplicadas.

## Calidad y despliegue

La integración continua exige instalación congelada, lint, análisis de código muerto, tipos, cobertura, build estático y E2E. Los umbrales mínimos son 75% de líneas y sentencias, 80% de funciones y 60% de ramas. El workflow de `main` solo publica el artefacto `out/` en GitHub Pages después de superar esas puertas. Los directorios `out/`, `.next/`, cobertura y resultados de Playwright nunca se versionan.

GitMorphosis se distribuye bajo la [licencia MIT](LICENSE).
