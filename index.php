<?php

    // Automatically load dependency classes file
    spl_autoload_register(function ($class_name) 
    {
        include $class_name.'.php';
    });


    // Parse the requested handler
    $route = parse_url('http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
    $slug = explode(basename(__DIR__), $route['path']);
    $slug = $slug[1] ?? $slug[0];
    
    // Register routes
    App\Controller\Routes::registerHandlers();

    // And finally dispatch the request
    App\Helper\Router::dispatchRequest($slug);
?>