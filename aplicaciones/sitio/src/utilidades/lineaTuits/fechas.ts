import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import zonaHoraria from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(zonaHoraria);
export const instanciaFechas = () => dayjs;
