# 11° Congreso Internacional ICEA 2026

Plataforma web del Congreso Internacional de Investigación en Ciencias Económico-Administrativas.

## Estructura

```text
index.html
styles.css
app.js
data/programa.json
assets/logos/logo-icea-uaeh.png
assets/images/acceso-icea.jpeg
assets/images/campus-jardin.png
assets/images/banner-congreso.jpg
assets/images/croquis-icea.png
carteles/
constancias/ponencias/
constancias/carteles/
```

## Cómo nombrar carteles

Los carteles deben subirse en PDF dentro de la carpeta `carteles/` usando el código exacto del trabajo.

Ejemplos:

```text
carteles/CAR-003.pdf
carteles/CAR-006.pdf
carteles/CAR-014.pdf
```

Reglas:

- Usa el código exacto que aparece en el programa.
- Usa mayúsculas en `CAR`.
- No uses espacios, acentos ni paréntesis.
- Formato recomendado: PDF.

## Cómo nombrar constancias

Las constancias de ponencias van en:

```text
constancias/ponencias/
```

Las constancias de carteles van en:

```text
constancias/carteles/
```

Nombre recomendado:

```text
Nombre_Apellido.pdf
```

Ejemplos:

```text
constancias/ponencias/Maria_Concepcion_Garcia_Perez.pdf
constancias/ponencias/Melissa_Areli_Lucio_Deanda.pdf
constancias/carteles/Juan_Jesus_Solis_Munoz.pdf
```

Reglas para evitar errores:

- Sin acentos.
- Sin espacios.
- Sin comas.
- Sin paréntesis.
- Usa guion bajo `_`.
- Mantén el mismo nombre que aparece en `data/programa.json` convertido a formato seguro.

## Semblanzas

Las semblanzas se muestran en pantalla, no como descarga.

Dónde se consideran semblanzas:

1. En cada ponencia, para la persona que presenta.
2. En la Conferencia Magistral.
3. En ponentes del Foro de Turismo.
4. En panelistas del Panel de Economía.

Para agregar semblanza por ponencia, en `data/programa.json` añade el campo:

```json
"semblanza": "Texto breve de la trayectoria de la persona ponente."
```

Si no hay semblanza, la plataforma muestra un texto temporal de “Semblanza pendiente”.

## Publicación en Netlify

Este proyecto no requiere build.

En Netlify deja:

```text
Branch: main
Base directory: vacío
Build command: vacío
Publish directory: vacío
```

Después de subir cambios a GitHub, Netlify publica automáticamente.
