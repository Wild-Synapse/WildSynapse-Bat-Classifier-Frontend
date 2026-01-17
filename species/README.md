Place species images here named using a slugified species name, for example:

- `eptesicus-fuscus.jpg`
- `myotis-lucifugus.jpg`

The app will attempt to load `/species/{slug}.jpg` for species images. If an image is missing, the UI falls back to `/bat.jpg`.

Slugify rules:
- Lowercase
- Replace non-alphanumeric characters with `-`
- Trim leading/trailing `-`

Recommended image size: 400x400 (JPEG or PNG).