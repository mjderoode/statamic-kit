import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/site.css', 'resources/js/site.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        // Statamic recompiles Antlers into this directory on every request;
        // watching it puts Vite in a reload loop.
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
