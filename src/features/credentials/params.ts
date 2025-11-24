import { parseAsInteger, parseAsString } from "nuqs/server";
import { PAGINATION } from "@/config/constants";



// Configuración de los params con nuqs

export const credentialsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)    // default value
    .withOptions({ clearOnDefault: true }),  // Si el valor es el default, se borra el query
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
}