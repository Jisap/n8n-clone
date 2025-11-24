import { useQueryStates } from "nuqs";
import { credentialsParams } from "../params";


// Se usa en el entorno del cliente para leer y manejar el estado de los parámetros de la URL.

export const useCredentialsParams = () => {
  return useQueryStates(credentialsParams);    // Lee y gestiona el estado de los parámetros de la URL.
}