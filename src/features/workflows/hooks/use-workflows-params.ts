import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params";


// Se usa en el entorno del cliente para leer y manejar el estado de los parámetros de la URL.

export const useWorkflowsParams = () => {
  return useQueryStates(workflowsParams);    // Lee y gestiona el estado de los parámetros de la URL.
}