# 11° Congreso Internacional ICEA 2026

Plataforma web del programa académico del Congreso ICEA 2026.

## Estructura

```text
index.html
styles.css
app.js
data/programa.json
assets/images/
assets/logos/
carteles/
constancias/ponencias/
constancias/carteles/
```

## Cómo subir a GitHub

Sube **todo el contenido** de esta carpeta a la raíz del repositorio, no la carpeta completa dentro de otra carpeta.

Debe verse así en GitHub:

```text
README.md
index.html
styles.css
app.js
data/
assets/
carteles/
constancias/
```

## Nombres de archivos para evitar errores

### Carteles

Los carteles se nombran exactamente con el código del trabajo:

```text
carteles/CAR-003.pdf
carteles/CAR-006.pdf
carteles/CAR-014.pdf
```

### Constancias de ponencias

Las constancias de ponencia también se nombran con el código:

```text
constancias/ponencias/PON-001.pdf
constancias/ponencias/PON-002.pdf
constancias/ponencias/PON-007.pdf
```

### Constancias de carteles

```text
constancias/carteles/CAR-003.pdf
constancias/carteles/CAR-006.pdf
constancias/carteles/CAR-014.pdf
```

## Regla de oro

Usar siempre:

- Código exacto del trabajo.
- Mayúsculas como aparece en el programa.
- Guion medio `-`.
- Extensión `.pdf` en minúsculas.

Evitar:

- Espacios.
- Acentos.
- Paréntesis.
- Nombres de personas en el archivo.

## Semblanzas

Las semblanzas se consultan en pantalla, no se descargan.

Se agregan en `data/programa.json`, dentro de cada trabajo, usando el campo:

```json
"semblanza": "Texto de la semblanza de quien presenta la ponencia."
```

Para los eventos destacados —Conferencia Magistral, Foro de Turismo y Panel de Economía— las semblanzas se editan en `app.js`, en el bloque `eventDetails`.

## Croquis

El croquis debe estar en:

```text
assets/images/croquis-icea.png
```

Si no aparece en Netlify, revisar que la carpeta `assets/images/` sí se haya subido completa.

