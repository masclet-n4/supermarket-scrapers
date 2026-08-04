# Supermarket Scraper

Servicio en **Bun + TypeScript** que obtiene productos de supermercados, los normaliza y los guarda en **PocketBase**.

## Qué hace

El servicio:

1. Consulta en PocketBase los supermercados configurados y activos.
2. Crea un scraper para cada supermercado soportado.
3. Ejecuta cada scraper según su expresión cron.
4. Obtiene los productos mediante la API del supermercado.
5. Guarda el producto original, el producto normalizado y sus precios.

La configuración de supermercados y horarios se lee al arrancar el servicio. Para aplicar cambios en esa configuración hay que reiniciarlo.

## Arquitectura

Cada supermercado se integra mediante dos piezas:

- **Client**: obtiene los productos de la API o página del supermercado.
- **Normalizer**: convierte la respuesta original al modelo común de la aplicación.

El `BaseScraper` coordina el flujo común y la persistencia en PocketBase. Para añadir otro supermercado solo hay que implementar su cliente y su normalizador, registrarlo en `src/index.ts` y añadir su configuración en la colección `supermarkets`.

Actualmente están disponibles:

- Mercadona
- Consum

## Configuración

El servicio autentica el superusuario al iniciar y vuelve a autenticarse automáticamente si PocketBase devuelve un error `401` o `403`.

No guardes las credenciales en el repositorio. Usa un archivo `.env` local o variables de entorno del sistema/entorno de despliegue.

## Instalación

```bash
bun install
```

## Ejecución

Ejecutar el planificador:

```bash
bun run start:cron
```

Ejecutar un scraper individual:

```bash
bun run start:scraper:mercadona
bun run start:scraper:consum
```

## Estructura principal

```text
src/
├── base/                 # Flujo común de scraping
├── persistence/          # Cliente y operaciones de PocketBase
├── supermarkets/
│   ├── consum/            # Cliente y normalizador de Consum
│   └── mercadona/         # Cliente y normalizador de Mercadona
├── index.ts               # Planificador principal
└── models.ts              # Modelos comunes
```

## Añadir un supermercado

1. Crear `client.ts`, `normalizer.ts`, `models.ts` y `enums.ts` dentro de `src/supermarkets/<slug>`.
2. Implementar el cliente y el normalizador siguiendo los existentes.
3. Registrar el scraper en `src/index.ts`.
4. Crear el supermercado en PocketBase con su `slug`, `enabled` y `scraper_schedule`.
5. Reiniciar el servicio.
