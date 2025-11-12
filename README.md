This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Flujo de Nodos en el Editor

La aplicación utiliza `ReactFlow` para la visualización y gestión de los flujos de trabajo. Comprender cómo se renderizan los diferentes tipos de nodos es fundamental:

1.  **`editor.tsx` (Componente Principal):**
    *   Este componente contiene la instancia de `ReactFlow`.
    *   Gestiona el estado global de los nodos (`nodes`) y las aristas (`edges`) del flujo.
    *   Es crucial la propiedad `nodeTypes` que se le pasa a `ReactFlow`:
        ```typescript
        <ReactFlow
          // ...
          nodeTypes={nodeComponents} // Mapea tipos de nodo a componentes React
          // ...
        />
        ```
    *   `nodeComponents` (definido en `src/config/node-components.ts`) es un objeto que asocia cada `NodeType` (ej. `INITIAL`, `HTTP_REQUEST`) con su componente React correspondiente (ej. `InitialNode`, `HttpRequestNode`).

2.  **`initial-node.tsx` (Nodo Inicial):**
    *   Cuando se crea un nuevo flujo, el primer nodo es de tipo `INITIAL`, renderizado por `InitialNode`.
    *   Este nodo contiene un `NodeSelector` que se activa al hacer clic en él.

3.  **`node-selector.tsx` (Selector de Nodos):**
    *   Este componente permite al usuario elegir el tipo de nodo que desea añadir al flujo (ej. "HTTP Request", "Manual Trigger").
    *   La función clave es `handleNodeSelect`. Su responsabilidad **no es renderizar un componente directamente**, sino **actualizar el estado `nodes`** en `editor.tsx`.
    *   Cuando se selecciona un tipo de nodo, `handleNodeSelect` crea un nuevo objeto de nodo con el `type` seleccionado (ej. `NodeType.HTTP_REQUEST`) y lo añade (o reemplaza el nodo `INITIAL`) al array `nodes` del estado global.

4.  **Renderizado por `ReactFlow`:**
    *   Una vez que el estado `nodes` en `editor.tsx` se actualiza, `ReactFlow` detecta el cambio.
    *   Consulta el mapa `nodeComponents` para encontrar el componente React asociado al `type` del nuevo nodo.
    *   Finalmente, `ReactFlow` renderiza el componente correspondiente (ej. `HttpRequestNode`) en el lienzo, mostrando visualmente el nuevo nodo.

Este ciclo de **Acción del Usuario -> Actualización de Datos -> Re-renderizado de la Vista** es fundamental para la extensibilidad del sistema.
