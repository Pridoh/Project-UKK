<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

/*
|--------------------------------------------------------------------------
| Modular Web Routes Loader
|--------------------------------------------------------------------------
|
| File ini bertugas memuat seluruh web routes dari setiap module
| yang berada di direktori app/Modules/*.
| Setiap module dapat mendefinisikan route-nya sendiri.
|
*/

$modulesPath = base_path('app/Modules');

if (! File::isDirectory($modulesPath)) {
    return;
}

$moduleDirectories = File::directories($modulesPath);

foreach ($moduleDirectories as $modulePath) {
    $routesFile = $modulePath . '/Config/Routes.php';

    if (File::exists($routesFile)) {
        require $routesFile;
    }
}
