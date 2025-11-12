import type { StrapiApp } from '@strapi/strapi/admin';
import * as Icons from '@strapi/icons';
export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
       'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
  },
  bootstrap(app: StrapiApp) {
    app.addMenuLink({
      to: '/admin/audits', // o una URL externa
      icon: Icons.ClockCounterClockwise, // ícono de @strapi/icons
      intlLabel: {
        id: 'audit.menu.title',
        defaultMessage: 'Auditoría',
      },
      // Component: async () => import('./pages/AuditoriasPage/index'),
      Component: async () => import('./pages/auditPage'),
     permissions: [{ action: 'plugin::content-manager.explorer.read', subject: 'api::audit.audit' }],
    });
    const cmPlugin = app.getPlugin('content-manager');
     if (!cmPlugin) {
      console.warn('No se encontró el plugin content-manager');
      return;
    }
  },
};

