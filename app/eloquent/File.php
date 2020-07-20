<?php
    namespace App\Eloquent;

    class File
    {
        private $files;
        private $gallery_root;

        function __construct()
        {
            // Get runtime array of file data from file
            $json = file_get_contents(__DIR__.'/database.json');
            $this->files = json_decode($json, true);
            !is_array($this->files) ? $this->files=[] : 0;

            // Prepare the root directory of gallery folder
            $this->gallery_root = dirname(dirname(__DIR__));
        }

        // Provide all the files data as array 
        public function getAll()
        {
            return $this->files;
        }

        // Initialize upload process of both of new and modified
        public function uploadFile(array $file, $index=false)
        {
            $uploaded = $this->processUpload($file);

            return is_array($uploaded) ? $this->assignFileData($uploaded, $index) : false;
        }

        // Create uploaded file data in the runtime file data property 
        private function assignFileData(array $file_data, $index=null)
        {
            $ret = false;

            if(is_numeric($index))
            {
                if(isset($this->files[$index]))
                {
                    $file_object = $this->files[$index];
                    if($file_object['file_url_original']!==$file_object['file_url'])
                    {
                        // Delete older file if it has a modified version already
                        unlink($this->gallery_root.'/'.$file_object['file_url']);
                    }                

                    // Assign new
                    $this->files[$index]['file_url']=$file_data['file_url'];

                    $ret = true;
                }
            }
            else
            {
                // Create new entry if index not provided
                $file_data['file_url_original'] = $file_data['file_url'];

                $this->files[]=$file_data;

                $ret = true;
            }
            
            $this->commitChanges();

            return $ret;
        }
        
        // Put uploaded files to final destination from temporary directory
        private function processUpload(array $file)
        {
            if($file['error'] == UPLOAD_ERR_OK) 
            {
                // Make a dynamic file name to avoid replacement.
                $new_name = microtime(true).$file['name'];

                $payload = 
                [
                    'file_name'=>$file['name'],
                    'file_url'=>'gallery/'.$new_name
                ];

                // Put the uploaded file in the gallery directory
                $succeed = move_uploaded_file($file["tmp_name"], $this->gallery_root.'/'.$payload['file_url']);

                return $succeed ? $payload : false;
            }
        }

        // Write database JSON into file
        private function commitChanges()
        {
            file_put_contents(__DIR__.'/database.json', json_encode($this->files, JSON_PRETTY_PRINT));
        }
    }
?>