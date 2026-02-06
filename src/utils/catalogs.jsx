import {
  Home,
  Folder,
  Calculator,
  Gavel,
  Lightbulb,
  Proportions,
  Gauge,
  Handshake,
  BriefcaseBusiness,
  Palette,
  Paintbrush,
  KeyRound,
  Mic,
  Laptop,
  HandPlatter,
  ShoppingBag,
  UsersRound,
} from 'lucide-react';
import { capitalizeFirst } from './utils';

export const mapCatalogToOptions = (catalogList) => {
  return catalogList.map((it) => ({ label: it.name, value: `${it.id}` }));
};

export const mapArrayToOptions = (catalogList) => {
  return catalogList.map((it) => ({ label: it, value: `${it}` }));
};

export const mapArrayToColorimetry = (array) => {
  return array.map((it) => ({ label: it.name, value: `${it.name}`, colors: it.colors }));
};

export const mapShareholdersToCards = (shareholders) => {
  return shareholders.map((shareholder) => ({
    id: shareholder.id,
    name: capitalizeFirst(shareholder.type),
    description: (
      <span className="flex flex-col space-y-1">
        <p className="display m-none space-x-2 font-semibold">{`${shareholder.full_name} ${shareholder.rut}`}</p>
        <p className="m-none space-x-2">
          <span>{shareholder.email}</span>
          <span>{shareholder.phone}</span>
        </p>
      </span>
    ),
    image:
      shareholder.type === 'SOCIO'
        ? '/images/dashboard/legal_services/shareholders_registry_1.png'
        : '/images/dashboard/legal_services/shareholders_registry_2.png',
  }));
};

export const normalize = (s = '') =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const addIconsToMenu = (menu = []) => {
  const ICON_BY_NAME = {
    home: Home,
    'creacion de empresa': Folder,
    'facturas y contabilidad': Calculator,
    'servicios legales': Gavel,
    conceptualizacion: Lightbulb,
    'orientacion empresarial': Gauge,
    'diseno grafico': Proportions,
    'cumplimiento legal y tributario (compliance)': Handshake,
    'business profile': BriefcaseBusiness,
    'diseno de logo': Palette, // Nuevo hijo
    ordenes: Folder,
    dashboard: Home,
    empresas: UsersRound,
    usuarios: UsersRound,
  };

  const ICON_BY_FEATURE = {
    1: Home,
    2: Gauge,
    3: Folder,
    4: Calculator,
    5: Gavel,
    6: Lightbulb,
    7: Palette,
    10: Folder,
    11: Folder,
    12: Folder,
    13: Folder,
  };
  return menu.map((m) => {
    const key = normalize(m.name);
    const Icon = ICON_BY_NAME[key] || ICON_BY_FEATURE[m.feature_id] || null;
    const mapped = { ...m, icon: Icon };
    if (key === 'diseno grafico') {
      mapped.children = [
        {
          id: `${m.id}-child-logo`,
          name: 'Diseño de Logo',
          link: `${m.link}/logo_design`,
          icon: ICON_BY_NAME['diseno de logo'],
        },
      ];
    }

    return mapped;
  });
};

export const addIconsToOfferingServiceType = (items = []) => {
  const ICON_BY_NAME = {
    'alimentos, restaurantes y hospitalidad': HandPlatter,
    'comercio minorista y consumo masivo': ShoppingBag,
    'bienes fisicos y productos materiales': BriefcaseBusiness,
    'servicios profesionales y personales': KeyRound,
    'ocio y hospitalidad': HandPlatter,
    'contenido original y productos digitales': Mic,
    'tecnologia y software': Laptop,
  };

  const ICON_BY_FEATURE = {
    1: BriefcaseBusiness,
    2: KeyRound,
    3: HandPlatter,
    4: Mic,
    5: Laptop,
  };
  return items.map((m) => {
    delete m.image;
    const key = normalize(m.name);
    const Icon = ICON_BY_NAME[key] || ICON_BY_FEATURE[m.feature_id] || null;

    const mapped = { ...m, icon: Icon };

    return mapped;
  });
};

export const getIconByOfferingServiceType = (item) => {
  const ICON_BY_NAME = {
    'bienes fisicos': BriefcaseBusiness,
    servicios: KeyRound,
    'ocio y hospitalidad': HandPlatter,
    'contenido original': Mic,
    'tecnologia y software': Laptop,
  };

  const key = normalize(item);
  const Icon = ICON_BY_NAME[key] || null;

  return Icon;
};
