import { PAGINATION } from "@/config/constants";
import { use, useEffect, useState } from "react";
import { set } from "zod";


interface useEntitySearchProp<T extends { search: string; page: number}> {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
}

export function useEntitySearch<T extends { search: string; page: number}>({
  params,
  setParams,
  debounceMs = 500,
}: useEntitySearchProp<T>) {

  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {

    if(localSearch === "" && params.search !== ""){ // Si el valor del search cambia y es el default, se borra el query
      setParams({
        ...params,
        search: "",
        page: PAGINATION.DEFAULT_PAGE,
      })
      return;
    }

    const timer = setTimeout(() => {
      if(localSearch !== params.search){           // Si el valor del search cambia y no es el default, se actualiza el query
        setParams({
          ...params,
          search: localSearch,
          page: PAGINATION.DEFAULT_PAGE,
        })
      }
    }, debounceMs);                                // Se ejecuta el timer para que se actualice el query solo despues de un tiempo

    return () => clearTimeout(timer);              // Se limpia el timer cuando se desactive la función

  },[localSearch, params, setParams, debounceMs])
    
  useEffect(() => {
    setLocalSearch(params.search);                 // Se actualiza el estado local con el valor del search
  },[params.search])

  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  }

}