<?php
    namespace App\Helper;
    use App\Helper\Hook;

    class Router
    {
        // Register htpp request handler according to 'get' and 'post' method.
        public static function __callStatic($req_method, $arguments)
        {
            $handler = $arguments[0];
            $controller = $arguments[1];

            $fragments = explode('@', $controller);

            $action =
            [
                'handler' => $handler,
                'class' => $fragments[0],
                'method' => $fragments[1],
                'request_method' => $req_method
            ];

            Hook::register('registered_route', $action);
        } 

        // Dispatch http request to the registered handler class@method
        public static function dispatchRequest(string $slug)
        {
            $routes = Hook::get('registered_route');
            $req_method = strtolower($_SERVER['REQUEST_METHOD']);

            // Loop through registered handlers
            for($i=0; $i<count($routes); $i++)
            {
                $r = $routes[$i];

                // Dispatch the request if matches
                if( $r['handler']==$slug && $req_method==$r['request_method'])
                {
                    $method_name = $r['method'];
                    $response = (new $r['class']())->$method_name();

                    if($req_method=='get')
                    {
                        // GET method is supposed to include html template
                        // This one could be more dynamic like passing payload data to view
                        // However it's not necessary in this basic app. Just pass the html.
                        header('Content-Type: text/html');
                        include_once('app/view/'.$response['template'].'.php');
                    }
                    else
                    {
                        header('Content-Type: application/json');
                        echo json_encode($response);
                    }

                    exit;
                }
            }

            http_response_code(404);
            exit('Not Found');
        }
    }
?>