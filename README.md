# GitMorphosis

Generador autocontenido de README para perfiles de GitHub. Funciona completamente en el navegador: consulta únicamente la API oficial de GitHub, crea los gráficos como SVG locales y entrega un ZIP listo para instalar en el repositorio del perfil.

[Demo](https://carlos-coronel.github.io/GitMorphosis/) · [Errores y sugerencias](https://github.com/Carlos-Coronel/GitMorphosis/issues) · [Licencia MIT](LICENSE)

## Características

- Cuatro plantillas: Minimalista, Portafolio, Creativa y Terminal.
- Estadísticas, lenguajes, proyectos, trofeos, rachas, actividad, cabeceras y snake generados localmente.
- Variantes claras y oscuras mediante rutas relativas.
- Exportación ZIP con `README.md`, `assets/*.svg` y una guía de instalación.
- Vista previa fiel a los archivos descargados.
- Guía interactiva integrada que acompaña la generación e instalación.
- Editor de enlaces sociales; los enlaces son navegables, pero no se cargan imágenes de terceros.
- Token PAT opcional guardado solamente en `sessionStorage`.
- Sin backend, telemetría, fuentes remotas ni servicios de tarjetas.

La única comunicación de red realizada por el producto es con `https://api.github.com`. Sin token se aplican los límites públicos de GitHub. Con token se amplía el límite y se consultan repositorios fijados y contribuciones mediante GraphQL. El token nunca se envía a GitMorphosis ni se persiste después de cerrar la pestaña.

## Guía rápida

1. Introduce un usuario público de GitHub.
2. Elige una plantilla y abre **Opciones avanzadas** si quieres añadir enlaces, activar el contribution snake o usar un token.
3. Revisa la vista previa y descarga **ZIP completo**.
4. Crea —si todavía no existe— un repositorio público cuyo nombre sea exactamente igual a tu usuario: `<usuario>/<usuario>`.
5. Extrae y sube `README.md` y la carpeta `assets/` a la raíz de ese repositorio, conservando sus nombres y estructura.
6. Confirma los archivos en el mismo commit. GitHub mostrará el README en la portada de tu perfil.

> [!IMPORTANT]
> Copiar únicamente el Markdown no es suficiente: los gráficos usan rutas relativas hacia los SVG incluidos en `assets/`.

### Contenido de la descarga

```text
<usuario>-readme.zip
├── README.md
├── INSTALACION.md
└── assets/
    ├── stats-dark.svg
    ├── stats-light.svg
    ├── languages-dark.svg
    ├── languages-light.svg
    └── ... según la plantilla elegida
```

`INSTALACION.md` repite las instrucciones dentro del propio paquete. GitHub necesita que el repositorio del perfil sea público y que su nombre coincida con el usuario.

### Token y límites de GitHub

El token es opcional. Sin token, GitMorphosis funciona con el límite público de la API y usa los repositorios más populares como alternativa a los fijados. Con token puede consultar los repositorios fijados reales y datos GraphQL adicionales.

Las tarjetas siempre distinguen entre datos conocidos y datos no disponibles: sin contribuciones GraphQL se omiten la racha y la actividad, en lugar de presentar ceros engañosos. Las estadísticas generales solo muestran valores verificables mediante la API pública.

- El token se conserva exclusivamente en `sessionStorage` y desaparece al cerrar la pestaña.
- Solo se envía a `api.github.com`; nunca se incluye en el ZIP ni en el Markdown.
- Para perfiles públicos utiliza un token de permisos mínimos y no habilites acceso de escritura.
- Un error `403` o `429` normalmente indica que el límite se agotó; espera el reinicio o usa un token válido.

## Privacidad y autonomía

La aplicación desplegada no usa backend propio, analítica, cookies, fuentes remotas ni proveedores externos de tarjetas. Las imágenes del README son SVG generados localmente. Los enlaces normales a GitHub, correo, redes sociales o sitios personales pueden aparecer en el resultado, pero no se cargan recursos visuales ni scripts desde esos destinos.

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
pnpm verify         # lint, código muerto, tipos, cobertura y build
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

## Solución de problemas

- **El usuario no aparece:** comprueba que el perfil sea público y que el nombre esté escrito correctamente.
- **Faltan repositorios fijados:** genera de nuevo con un token válido; REST no expone esa información.
- **No se ven los gráficos en el perfil:** verifica que `assets/` esté junto a `README.md` y que no hayas renombrado sus SVG.
- **GitHub no muestra el README en el perfil:** el repositorio debe ser público y llamarse exactamente igual que tu usuario.
- **El ZIP fue bloqueado por el navegador:** permite descargas para el sitio y vuelve a pulsar **Descargar ZIP completo**.
