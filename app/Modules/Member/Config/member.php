<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Member Types Configuration
    |--------------------------------------------------------------------------
    |
    | Define member types and their properties for the parking system.
    | This configuration supports Tier 1 requirements and can be extended
    | for Tier 2 and Tier 3 features.
    |
    */

    'types' => [
        1 => 'Regular',
        2 => 'Silver',
        3 => 'Gold',
    ],

    /*
    |--------------------------------------------------------------------------
    | Membership Packages Configuration
    |--------------------------------------------------------------------------
    |
    | Define available membership packages and their duration in months.
    | Duration is used to auto-calculate end_date from start_date.
    |
    */

    'packages' => [
        1 => 'Monthly (1 Month)',
        3 => 'Quarterly (3 Months)',
        6 => 'Semi-Annual (6 Months)',
        12 => 'Yearly (1 Year)',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Discount Percentages
    |--------------------------------------------------------------------------
    |
    | Default discount percentages for each member type.
    | These can be used as suggestions in the UI.
    |
    */

    'default_discounts' => [
        1 => 0,      // Regular: no discount
        2 => 5,      // Silver: 5%
        3 => 10,     // Gold: 10%
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Flags (Tier 2 & 3)
    |--------------------------------------------------------------------------
    |
    | Enable or disable advanced features for future tiers.
    |
    */

    'features' => [
        'free_entry_quota' => false,        // Tier 3: Free entry quota per member type
        'loyalty_points' => false,          // Tier 3: Loyalty points system
        'auto_renewal_notification' => false, // Tier 3: Auto-notify before expiry
        'member_portal' => false,           // Tier 3: Member self-service portal
    ],
];
