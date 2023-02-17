import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { CasosPorDia, RespuestaCasosPorDia } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';

const casosPorDia = async () => {
  return peticion('casosPorDia', (bd: Db) => {
    return new Promise(async (resolver) => {
      const coleccion = bd.collection(colecciones.casos);
      const casos = (await coleccion
        .aggregate([
          {
            $group: {
              _id: '$fechaNot',
              total: { $sum: 1 },
              muertos: {
                $sum: {
                  $cond: [{ $eq: ['$recuperado', 'fallecido'] }, 1, 0],
                },
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray()) as RespuestaCasosPorDia[];

      // Aplanar respuesta de objetos a arrays para que sea la menor cantidad de bits que se mandan desde la API.
      if (casos && casos.length) {
        const datos = casos.map((obj): CasosPorDia => [obj._id, obj.muertos, obj.total]);
        resolver(datos);
      }
    });
  });
};

export const rutaCasosPorDia: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/casos-por-dia', async (request, reply) => {
    const datos = await casosPorDia();
    reply.send(datos);
  });

  listo();
};
