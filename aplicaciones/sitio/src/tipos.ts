export type TuitsPorHora = {
  fecha: Date;
  valor: number;
  dia: number;
  tipo?: TuitsTiposObj;
};

export type TuitsTiposObj = {
  original?: number;
  quoted?: number;
  replied_to?: number;
  retweeted?: number;
};

export type TuitsTipos = 'todos' | 'tipos' | 'quoted' | 'replied_to' | 'original' | 'retweeted';
export type TuitsDatos = [fecha: string, hora: number, cantidad: number, tipo?: TuitsTiposObj];

export type FuenteTuitsPorHora = [fecha: string, dia: number, cantidad: number];

export type FuenteDatos = {
  [llave: string]: { maximo: number; datos: TuitsPorHora[] };
};
