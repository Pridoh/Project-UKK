<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Vehicle Data Module Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the vehicle data management module
    |
    */

    'module_name' => 'Data Kendaraan',
    'module_description' => 'Manage vehicle data including plate numbers, owners, and vehicle types',

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    |
    | Default number of items per page
    |
    */

    'per_page' => 10,

    /*
    |--------------------------------------------------------------------------
    | Status Options
    |--------------------------------------------------------------------------
    |
    | Available status options for vehicles
    |
    */

    'status_options' => [
        0 => 'Inactive',
        1 => 'Active',
    ],
];
