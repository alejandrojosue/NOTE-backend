/**
 * factura service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::factura.factura', ({ strapi }) => ({

  async createVenta(data) {
    return await strapi.db.transaction(async () => {

      // ==========================================================
      // 0️⃣ VALIDAR CONFIGURACIÓN CONTABLE DEL USUARIO
      // ==========================================================

      if (!data.usuario) {
        throw new Error("El usuario es requerido para generar una factura.");
      }

      const usuario = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: data.usuario, blocked: false, confirmed: true },
        populate: { config_contable: true },
      });

      if (!usuario || !usuario.config_contable) {
        throw new Error("El usuario no tiene una configuración contable asignada.");
      }

      const configContable = usuario.config_contable;

      // 0.1️⃣ Validar que la fecha actual no exceda el límite permitido
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaLimiteConfig = new Date(configContable.fechaLimite + 'T00:00:00');
      fechaLimiteConfig.setHours(0, 0, 0, 0);

      if (hoy > fechaLimiteConfig) {
        throw new Error("La fecha actual excede la fecha límite permitida para facturar." + hoy + "|" + fechaLimiteConfig);
      }

      // ==========================================================
      // 1️⃣ GENERAR NÚMERO DE FACTURA (CORRELATIVO)
      // ==========================================================

      let correlativo = Number(configContable.correlativoActual) + 1;
      let correlativoValido = false;

      while (!correlativoValido) {

        // Verificar si alguna factura YA usa ese número
        const facturaExistente = await strapi.db.query('api::factura.factura').findOne({
          where: { noFactura: correlativo, codigoNumFactura: configContable.codigoNumFactura },
        });

        if (!facturaExistente) {
          correlativoValido = true; // listo
        } else {
          correlativo += 1; // seguir probando
        }

        // Verificar límite máximo del rango permitido
        if (correlativo > configContable.rangoFinal) {
          throw new Error(
            "Se ha excedido el límite de facturas, por favor contactarse con el contador de la empresa."
          );
        }
      }

      // Asegurar que nunca sea menor al rango Inicial
      if (correlativo < configContable.rangoInicial || correlativo <= 0) {
        throw new Error('Correlativo de factura inválido según la configuración contable.');
      }

      // ==========================================================
      // 2️⃣ VALIDAR SUCURSAL
      // ==========================================================
      if(!data.empresa) throw new Error("La empresa es requerida para generar una factura.");

      const sucursal = await strapi.db.query('api::sucursal.sucursal').findOne({
        where: { id: data.sucursal, activa: true },
      });

      if (!sucursal) {
        throw new Error(
          `Sucursal con ID ${data.sucursal} no existe, no pertenece a la empresa o no está activa.`
        );
      }

      // ==========================================================
      // 3️⃣ VALIDAR PRODUCTOS
      // ==========================================================

      for (const detalle of data.Productos) {
        const productoExistente = await strapi.db.query('api::producto.producto').findOne({
          where: { id: detalle.producto, activo: true },
        });

        if (!productoExistente) {
          throw new Error(`Producto con ID ${detalle.producto} no existe o ha sido eliminado.`);
        }
      }

      // ==========================================================
      // 4️⃣ CREAR LA FACTURA
      // ==========================================================

      const factura = await strapi.db.query('api::factura.factura').create({
        data: {
          noFactura: correlativo,
          fechaLimite: configContable.fechaLimite,
          cai: configContable.cai,
          codigoNumFactura: configContable.codigoNumFactura,
          rtnCliente: data.rtnCliente,
          nombreCliente: data.nombreCliente,
          subtotal: data.subtotal,
          totalImpuestoQ: data.totalImpuestoQ,
          totalImpuestoD: data.totalImpuestoD,
          totalDescuento: data.totalDescuento,
          total: data.total,
          estado: 'PAGADO',
          noCompraExenta: data.noCompraExenta,
          noConstRegExonerado: data.noConstRegExonerado,
          noSAG: data.noSAG,
          adjunto: data.adjunto,
          Productos: data.Productos
        },
      });

      // ==========================================================
      // 5️⃣ CREAR MOVIMIENTOS DE INVENTARIO Y ACTUALIZAR EXISTENCIAS
      // ==========================================================

      for (const detalle of data.Productos) {
        // const inventario = await strapi.db.query('api::inventario.inventario').findOne({
        //   where: {
        //     producto: detalle.producto,
        //     empresa: data.empresa,
        //     sucursal: data.sucursal,
        //   },
        // });
        const inventario = null
        if (!inventario) {
          throw new Error(
            `Inventario no encontrado para el producto ${detalle.producto} en la sucursal ${data.sucursal}.`
          );
        }

        const nuevaExistencia = inventario.existencia - detalle.cantidad;
        if (nuevaExistencia < 0) {
          throw new Error(
            `Inventario insuficiente para el producto ${detalle.producto} en la sucursal ${data.sucursal}.`
          );
        }

        await strapi.db.query('api::inventario-movimiento.inventario-movimiento').create({
          data: {
            producto: detalle.producto,
            empresa: data.empresa,
            sucursal: data.sucursal,
            usuario: data.usuario,
            cantidad: detalle.cantidad,
            tipoMovimiento: 'SALIDA',
            comentario: `Venta: factura #${correlativo}`,
            precioCompra: inventario.precioCompra,
            precioVenta: detalle.precio,
          },
        });

        await strapi.db.query('api::inventario.inventario').update({
          where: { id: inventario.id },
          data: { existencia: nuevaExistencia },
        });
      }

      // ==========================================================
      // 6️⃣ ACTUALIZAR CORRELATIVO DE CONFIGCONTABLE
      // ==========================================================

      await strapi.db.query('api::config-contable.config-contable').update({
        where: { id: configContable.id },
        data: { correlativoActual: correlativo },
      });

      // ==========================================================
      // 7️⃣ RETORNAR FACTURA
      // ==========================================================

      return factura;
    });
  },
}));
