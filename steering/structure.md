# Estructura del proyecto

## Layout general

empowermefront/
├── public/ # Assets públicos
├── src/
│   ├── api/ # Configuración y clientes de API
│   ├── assets/ # Recursos estáticos
│   ├── components/ # Componentes reutilizables
│   ├── constants/ # Constantes globales
│   ├── context/ # Context providers
│   ├── features/ # Módulos por dominio funcional
│   ├── hooks/ # Hooks reutilizables
│   ├── locales/ # Archivos de traducción
│   ├── routes/ # Definición de rutas
│   ├── services/ # Integraciones y llamadas al backend
│   └── utils/ # Utilidades compartidas
└── steering/ # Documentación de dirección técnica y de producto

## Convenciones clave
- Componentes funcionales en JavaScript.
- Organización por feature en `src/features` para mantener cohesión por dominio.
- Lógica de acceso a datos centralizada en `services` y/o `api`.
- Hooks para encapsular comportamiento reutilizable.
- Estilos con clases de Tailwind y patrones visuales existentes del proyecto.

## Diseño y UX
- Mobile first: vistas y componentes adaptables a pantallas pequeñas.
- Consistencia visual entre dashboard, formularios y wizards.
- Reutilización de componentes para reducir duplicidad y mantener mantenibilidad.
