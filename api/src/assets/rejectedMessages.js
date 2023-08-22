module.exports.generic = [
  {
    id: 11,
    name: 'Cliente reclama pedido no entregado',
    descriptionES: 'Cliente reclama pedido no entregado',
    descriptionPT: 'Cliente reclama pedido no entregado',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 6,
    name: 'Zona peligrosa',
    descriptionES: 'Zona peligrosa',
    descriptionPT: 'Zona peligrosa',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 5,
    name: 'Cliente cancela pedido',
    descriptionES: 'Cliente cancela pedido',
    descriptionPT: 'Cliente cancela pedido',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 7,
    name: 'Sin cambio',
    descriptionES: 'Sin cambio',
    descriptionPT: 'Sin cambio',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 2,
    name: 'Domicilio erroneo',
    descriptionES: 'Domicilio erroneo',
    descriptionPT: 'Domicilio erroneo',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 10,
    name: 'Zona no corresponde',
    descriptionES: 'Zona no corresponde',
    descriptionPT: 'Zona no corresponde',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 1,
    name: 'Sin producto/variedad',
    descriptionES: 'Sin producto/variedad',
    descriptionPT: 'Sin producto/variedad',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 4,
    name: 'Repartidor accidentado',
    descriptionES: 'Repartidor accidentado',
    descriptionPT: 'Repartidor accidentado',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 3,
    name: 'Sin repartidor',
    descriptionES: 'Sin repartidor',
    descriptionPT: 'Sin repartidor',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 8,
    name: 'Cliente no solicita pedido',
    descriptionES: 'Cliente no solicita pedido',
    descriptionPT: 'Cliente no solicita pedido',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 9,
    name: 'No sale nadie',
    descriptionES: 'No sale nadie',
    descriptionPT: 'No sale nadie',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  }
];

module.exports.negatives = [
  {
    id: -1,
    name: 'Orden expirada por tiempo',
    descriptionES: 'Orden expirada por tiempo',
    descriptionPT: 'Orden expirada por tiempo',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    name: 'Orden rechazada por local cerrado',
    descriptionES: 'Orden rechazada por local cerrado',
    descriptionPT: 'Orden rechazada por local cerrado',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true,
    id: -3
  },
  {
    id: -2,
    name: 'Orden rechazada por plataforma',
    descriptionES: 'Orden rechazada por plataforma',
    descriptionPT: 'Orden rechazada por plataforma',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: -4,
    name: 'Orden rechazada por local inactivo',
    descriptionES: 'Orden rechazada por local inactivo',
    descriptionPT: 'Orden rechazada por local inactivo',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  }
];

module.exports.peyaRejects = [
  {
    id: 100,//ADDRESS_INCOMPLETE_MISSTATED
    name: 'Domicilio erroneo API',
    descriptionES: 'Domicilio erroneo API',
    descriptionPT: 'Domicilio erroneo API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 101,//BAD_WEATHER
    name: 'Mal clima API',
    descriptionES: 'Mal clima API',
    descriptionPT: 'Mal clima API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true    
  },
  {
    id: 102,//CLOSED
    name: 'Orden rechazada por local cerrado API',
    descriptionES: 'Orden rechazada por local cerrado API',
    descriptionPT: 'Orden rechazada por local cerrado API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  },
  {
    id: 103,//ITEM_UNAVAILABLE
    name: 'Sin producto/variedad API',
    descriptionES: 'Sin producto/variedad API',
    descriptionPT: 'Sin producto/variedad API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
    
  },
  {
    id: 104,//MENU_ACCOUNT_SETTINGS
    name: 'Problemas producto/variedad API',
    descriptionES: 'Problemas producto/variedad API',
    descriptionPT: 'Problemas producto/variedad API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true  
  },
  {
    id: 105,//NO_COURIER
    name: 'Sin repartidor API',
    descriptionES: 'Sin repartidor API',
    descriptionPT: 'Sin repartidor API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true   
  },
  {
    id: 106,//OUTSIDE_DELIVERY_AREA
    name: 'Zona no corresponde API',
    descriptionES: 'Zona no corresponde API',
    descriptionPT: 'Zona no corresponde API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true  
  },
  {
    id: 107,//TOO_BUSY
    name: 'Hay mucha demanda en el local API',
    descriptionES: 'Hay mucha demanda en el local API',
    descriptionPT: 'Hay mucha demanda en el local API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true    
  },
  {
    id: 108,//UNABLE_TO_PAY
    name: 'Sin cambio API',
    descriptionES: 'Sin cambio API',
    descriptionPT: 'Sin cambio API',
    forRestaurant: true,
    forLogistics: true,
    forPickup: true
  }
];

module.exports.peyaRejectsToSearch = [
  {
    id: 100,
    reason: "ADDRESS_INCOMPLETE_MISSTATED",
    message:"Domicilio erroneo API"
  },
  {
    id: 101,
    reason: "BAD_WEATHER",
    message:"Mal clima API"  
  },
  {
    id: 102,
    reason: "CLOSED",
    message:"Orden rechazada por local cerrado API"
  },
  {
    id: 103,
    reason: "ITEM_UNAVAILABLE",
    message:"Sin producto/variedad API"
  },
  {
    id: 104,
    reason: "MENU_ACCOUNT_SETTINGS",
    message:"Problemas producto/variedad API'"
  },
  {
    id: 105,
    reason: "NO_COURIER",
    message:"Sin repartidor API"  
  },
  {
    id: 106,
    reason: "OUTSIDE_DELIVERY_AREA",
    message:"Zona no corresponde API"
  },
  {
    id: 107,
    reason: "TOO_BUSY",
    message:"Hay mucha demanda en el local API"
  },
  {
    id: 108,
    reason: "UNABLE_TO_PAY",
    message:"Sin cambio API"
  }
];