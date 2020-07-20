<?php
    namespace App\Helper;

    class Hook
    {
        private static $storage=[];

        // Register simple data/array
        public static function register($key, $payload)
        { 
            !isset(self::$storage[$key]) ? self::$storage[$key]=[] : 0;

            self::$storage[$key][]=$payload;
        }

        public static function get($key)
        {
            return self::$storage[$key] ?? [];
        }
    }
?>