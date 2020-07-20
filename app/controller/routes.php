<?php

namespace App\Controller;
use App\Helper\Router;

class Routes
{
    // Register request handlers
    public static function registerHandlers()
    {
        Router::get('/', 'App\Controller\HomeController@loadHomePage');
        Router::post('/getGallery', 'App\Controller\FileController@getGallery');
        Router::post('/saveModifiedFile', 'App\Controller\FileController@saveModifiedFile');
        Router::post('/uploadFile', 'App\Controller\FileController@uploadFile');
    }
}

