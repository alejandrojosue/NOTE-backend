import type { Schema, Struct } from '@strapi/strapi';

export interface DetalleDetalleFactura extends Struct.ComponentSchema {
  collectionName: 'components_detalle_detalle_facturas';
  info: {
    displayName: 'DetalleFactura';
    icon: 'bulletList';
  };
  attributes: {
    cantidad: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    descuentoValor: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    isv: Schema.Attribute.Decimal & Schema.Attribute.Required;
    precio: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    producto: Schema.Attribute.Relation<'oneToOne', 'api::producto.producto'>;
  };
}

export interface DetalleHistoricoConfigContable extends Struct.ComponentSchema {
  collectionName: 'components_detalle_historico_config_contables';
  info: {
    displayName: 'HistoricoConfigContable';
    icon: 'book';
  };
  attributes: {
    datoAnterior: Schema.Attribute.JSON & Schema.Attribute.Required;
    datoNuevo: Schema.Attribute.JSON & Schema.Attribute.Required;
    fechaHora: Schema.Attribute.DateTime;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'detalle.detalle-factura': DetalleDetalleFactura;
      'detalle.historico-config-contable': DetalleHistoricoConfigContable;
    }
  }
}
