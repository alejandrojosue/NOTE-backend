import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::factura.factura', ({ strapi }) => ({
  async createVenta(ctx) {
    try {
      const data = ctx.request.body;

      // Llamar al servicio que maneja toda la transacción
      const factura = await strapi
        .service('api::factura.factura')
        .createVenta(data);

      ctx.body = {
        status: 'success',
        data: factura,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: error.message,
      };
    }
  },
}));
