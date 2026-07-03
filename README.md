# 11° Congreso Internacional ICEA 2026

Sitio oficial del programa académico del Congreso ICEA.

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

## Carteles

Nombra cada cartel con el código exacto del trabajo:

```text
carteles/CAR-003.pdf
carteles/CAR-006.pdf
carteles/CAR-095.pdf
```

Reglas: sin acentos, sin espacios, sin paréntesis. Usa el código en mayúsculas.

## Constancias

Las constancias se enlazan desde `data/programa.json`, en el campo `pdf` de cada persona.

Recomendación para nombres de archivo:

```text
constancias/ponencias/Nombre_Apellido.pdf
constancias/carteles/Nombre_Apellido.pdf
```

Ejemplo:

```text
constancias/ponencias/Aide_Maricel_Carrizal_Alonso.pdf
constancias/carteles/Juan_Jesus_Solis_Munoz.pdf
```

Reglas seguras:

- Sin acentos.
- Sin ñ.
- Sin espacios.
- Sin comas.
- Sin paréntesis.
- Usar guion bajo `_`.
- Mantener exactamente el mismo nombre que aparece en `data/programa.json`.

## Mejoras incluidas en etapa 3

- Hero con fotografía del acceso del ICEA, menos pasto y más edificio.
- Búsqueda de constancias más estable y ligera.
- Búsqueda de programa con foco conservado para escribir corrido.
- Explorador visual de mesas temáticas por color.
- Modo asistente en la página principal.
- Tarjetas por mesa con identidad cromática.
- Cuenta regresiva con días, horas, minutos y segundos.

## Publicación

Subir todos los archivos al repositorio GitHub. Netlify publicará automáticamente si está conectado al repositorio.
