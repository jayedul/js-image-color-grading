<!DOCTYPE html>
<html>
    <head>
        <title>JoomShaper</title>
        
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        
        <link rel="stylesheet" href="public/scripts/style.css"/>
    </head>
    <body>
        <header>
            <div>
                <img src="public/images/logo.png"/>
            </div>
        </header>

        <main>
            <div id="root_container"></div>
        </main>

        <script src="public/scripts/helper.js"></script>
        <script src="public/scripts/helper-adopted.js"></script>
        <script src="public/scripts/editor-filter.js"></script>
        <script src="public/scripts/editor-adjustment.js"></script>
        <script src="public/scripts/editor-crop.js"></script>
        <script src="public/scripts/component.js"></script>
        <script>
            /* ------------Mount Root Component------------ */
            document.getElementById('root_container').appendChild(new Gallery().componentWillMount().render());
        </script>
    </body>
</html>