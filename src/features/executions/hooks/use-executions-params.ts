import { useQueryStates } from "nuqs";
import { executionsParams } from "../params";


// Se usa en el entorno del cliente para leer y manejar el estado de los parámetros de la URL.

export const useExecutionsParams = () => {
  return useQueryStates(executionsParams);    // Lee y gestiona el estado de los parámetros de la URL.
}