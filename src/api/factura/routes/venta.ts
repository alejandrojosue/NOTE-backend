export default {
  routes: [
    {
      method: 'POST',
      path: '/ventas',
      handler: 'venta.createVenta',
      config: {
        policies: [],
      },
    },
  ],
};
