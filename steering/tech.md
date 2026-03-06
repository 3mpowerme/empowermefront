# Stack tecnológico

## Frontend
- Framework: React (JavaScript).
- Estilos: Tailwind CSS + estilos del proyecto.
- Arquitectura UI: componentes reutilizables + módulos por feature.
- Routing: enrutamiento del lado cliente en `src/routes`.
- Estado compartido: contextos y hooks.

## Integración
- Consumo de APIs del backend desde `src/services` y `src/api`.
- Manejo de utilidades comunes en `src/utils`.
- Soporte de localización a través de `src/locales`.

## Comandos comunes (referenciales)
- Instalar dependencias: `npm install`
- Ejecutar en desarrollo: `npm run dev` o `npm start`
- Build de producción: `npm run build`
- Lint (si está configurado): `npm run lint`

## Configuración de entorno
- Variables de entorno definidas por archivo `.env` según necesidades del frontend.
- No versionar secretos ni credenciales.
