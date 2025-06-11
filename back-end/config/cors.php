<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie','api/stream-glb/*','storage/*', 'rental-agreements/generate', 'rental-agreements/download',
     'rental-agreements/send-notification',
   ],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    // --- THIS IS THE MOST IMPORTANT PART TO FIX ---
    // In config/cors.php

'allowed_headers' => ['*'],
    'exposed_headers' => [],

    'max_age' => 0,

    // --- ENSURE THIS IS `true` ---
    'supports_credentials' => true,

];
