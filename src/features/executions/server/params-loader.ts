import { createLoader } from "nuqs/server";
import { executionsParams } from '../params';


// Se usa en el entorno del server para leer y manejar el estado de los parámetros de la URL.

export const executionsParamsLoader = createLoader(executionsParams); 