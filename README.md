# 11° Congreso Internacional ICEA 2026

Sitio oficial del programa académico del Congreso ICEA.

## Archivos principales

- `index.html`: entrada principal del sitio.
- `styles.css`: diseño visual.
- `app.js`: navegación, filtros, buscador y Mi Agenda.
- `data/programa.json`: datos del programa, carteles y constancias.
- `assets/`: logos e imágenes institucionales.
- `carteles/`: subir aquí los carteles en PDF. Recomendado: `CAR-003.pdf`.
- `constancias/ponencias/`: constancias de ponencias.
- `constancias/carteles/`: constancias de carteles.

## Publicación en Netlify

Como es HTML/CSS/JS puro:

- Build command: vacío
- Publish directory: vacío
- Branch: main

## Mi Agenda

Funciona con LocalStorage del navegador. Cada asistente puede guardar actividades sin crear cuenta.


## Cómo nombrar archivos para evitar errores

### Carteles
Sube cada cartel a la carpeta `carteles/` usando exactamente el código del trabajo:

- `carteles/CAR-003.pdf`
- `carteles/CAR-006.pdf`
- `carteles/CAR-095.pdf`

No uses acentos, espacios, paréntesis ni nombres largos. El dashboard ya busca los carteles con la ruta `carteles/CAR-XXX.pdf`.

### Constancias
Sube las constancias a la carpeta correspondiente:

- Ponencias: `constancias/ponencias/Nombre_Apellido.pdf`
- Carteles: `constancias/carteles/Nombre_Apellido.pdf`

El nombre debe coincidir con la ruta que aparece en `data/programa.json`, dentro del bloque `constancias`. Para evitar errores, usa guion bajo `_`, sin espacios y sin acentos.

Ejemplos:

- `constancias/ponencias/Maria_Concepcion_Garcia_Perez.pdf`
- `constancias/ponencias/Melissa_Areli_Lucio_Deanda.pdf`
- `constancias/carteles/Valeria_Ortiz_Hernandez.pdf`

Recomendación operativa: antes de subir todas, prueba con 2 constancias y 2 carteles. Si abren bien desde Netlify, sube el resto.
