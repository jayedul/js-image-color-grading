<?php
    namespace App\Controller;

    class HomeController
    {
        // Send html page for home screen.
        public function loadHomePage()
        {
            return ['template'=>'Index', 'payload'=>[]];
        }
    }
?>