<?php

use Illuminate\Support\Facades\Route;

// Load routes from modules
require __DIR__ . '/../app/Modules/Home/Config/Routes.php';
require __DIR__ . '/../app/Modules/Dashboard/Config/Routes.php';
require __DIR__ . '/../app/Modules/Auth/Config/Routes.php';
require __DIR__ . '/../app/Modules/Settings/Config/Routes.php';
