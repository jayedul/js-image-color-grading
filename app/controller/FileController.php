<?php
    namespace App\Controller;
    use App\Eloquent\File;

    class FileController
    {
        private $file;

        function __construct()
        {
            // Instantiate file manager model class
            $this->file = new File;
        }

        // Get and Send all the file info as JSON format.
        public function getGallery()
        {
            $all = $this->file->getAll();

            return ['media_files'=>$all];
        }

        // Upload new file
        public function uploadFile()
        {
            $status_ok = $this->file->uploadFile($_FILES['new_media']);
            
            return ['status'=>$status_ok ? 'success' : 'error'];
        }

        // Save modified file
        public function saveModifiedFile()
        {
            $status_ok = $this->file->uploadFile($_FILES['modified_image'], $_POST['file_index']);
            
            return ['status'=>$status_ok ? 'success' : 'error'];
        }
    }
?>