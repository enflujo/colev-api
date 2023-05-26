export type TuitsPorHora = {
  fecha: Date;
  valor: number;
  dia: number;
  tipo?: TuitsTipos;
};
export type TuitsTipos = 'todos' | 'tipos' | 'quoted' | 'replied_to' | 'original' | 'retweeted';
export type TuitsDatos = [fecha: string, hora: number, cantidad: number, tipo?: TuitsTipos];
