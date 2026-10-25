import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * En GitHub Pages el sitio se sirve bajo el nombre del repositorio
 * (https://rebeca07-pedrozo.github.io/TORNS_Aplicativo_Simulacion/), así que
 * todas las rutas tienen que llevar ese prefijo.
 *
 * Se puede cambiar sin tocar este archivo con la variable BASE_PATH, por si
 * algún día el sitio se mueve a un dominio propio (entonces sería '/').
 */
const base = process.env.BASE_PATH ?? '/TORNS_Aplicativo_Simulacion/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2022',
  },
});
