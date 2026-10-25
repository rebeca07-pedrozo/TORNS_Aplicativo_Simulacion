/**
 * Rutas a los archivos de `public/`, con el prefijo correcto.
 *
 * La página se sirve bajo un subdirectorio en GitHub Pages
 * (…/TORNS_Aplicativo_Simulacion/) y en la raíz cuando se trabaja en local.
 * Vite reescribe las rutas que encuentra en el HTML y en los `import`, pero no
 * las cadenas sueltas dentro del JavaScript, así que estas se arman aquí con
 * `BASE_URL`, que siempre termina en barra.
 */

const base = import.meta.env.BASE_URL;

/** La marca grande, para el intro y el pie. */
export const LOGO = `${base}lirn-logo.png`;

/** La marca pequeña, para la barra superior. */
export const MARCA = `${base}lirn-marca.png`;
