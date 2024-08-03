<?php

return [

    'brand' => 'KMM Group LTD',
    'url' => 'https://kmmgrp.com',
    'domain' => 'kmmgrp.com',

    'urls' => [
        'cms' => 'cms', // absolute url to access the cms
        'home' => 'welcome', // website public homepage url
        'error' => 'oops', // website error url
        'reserved' => 'build|assets|media|js', // urls the cms should ignore
    ],

    'paths' => [
        'blades' => [
            'admin' => 'resources/views/vendor/superniftycms/admin/views', // from base_path()
            'theme' => 'resources/views/vendor/superniftycms/theme/views', // from base_path()
        ],
    ],

    'access' => [

        // who has access to the cms
        'cms' => [

            'policy' => 'auth', // ( *|auth|custom ) '*' = everyone | 'auth' = Auth::user()

            // ...or set policy to 'custom' and adjust below for granular access control
            'model' => 'user',  // model to reference for access challenge
            'column' => 'role',  // model column to reference for access challenge
            'value' => 'editor', // model column value required for access
            // if($user->role === 'editor'){ /* this user may access the cms */ }

        ],

        'topics' => [
            'published' => 'live', // $topic->status that indicates the topic is publicly viewable
        ],

    ],

    'users' => [
        'defaultAuthor' => 'Amy Rodgers',
    ],

    'tags' => [
        'industry news',
        'manufacturing trends',
        'market analysis',
        'cnc machining',
        'edm',
        'milling',
        'turning',
        'cleanroom',
        'iso14644',
        'medtech manufacturing',
        'inspection techniques',
        'metrology',
        'quality assurance',
        'business growth',
        'leadership',
        'company culture',
        'grinding tutorials',
        'industry webinars',
        'technical guides',
        'grinding techniques',
        'manufacturing',
        'medical technology',
        'precision grinding',
        'surface finish',
        'supply chain',
        'vascular',
        'guidewires',
        'corewires',
        'aerospace manufacturing',
        'project management',
        'r&d',
        'cnc grinding',
        'machining',
        'defense manufacturing',
        'machining tutorials',
        'component manufacturing',
        'customer process',
        'project scope',
        'ultra-precision',
        'high-tech',
        'high-precision manufacturing',
        'micron-level accuracy',
        'race engines',
        'application examples',
        'centerless grinding',
        'client success stories',
        'project case studies',
        'additive manufacturing',
    ],

    'categories' => [
        'educational resources',
        'employee spotlights',
        'company culture',
        'company news',
        'industry insights',
        'case studies',
        'manufacturing processes',
        'grinding technologies',
        'quality control',
        'ultra-precision machining',
    ],

    'topics' => [

        [
            'functionality' => 'posts',
            'url' => 'blog',
            'label' => 'Blog Post',
            'plural' => 'Blog Posts',
            'description' => 'Posts Description',
            'group' => 1,
        ],
        [
            'functionality' => 'pages',
            'url' => '',
            'label' => 'Page',
            'plural' => 'Pages',
            'description' => 'Pages Description',
            'group' => 1,
        ],
        [
            'functionality' => 'team',
            'url' => 'team',
            'label' => 'Team Member',
            'plural' => 'Team',
            'description' => 'Team Description',
            'group' => 2,
        ],
        [
            'functionality' => 'products',
            'url' => 'products',
            'label' => 'Product',
            'plural' => 'Products',
            'description' => 'Products Description',
            'group' => 2,
        ],
        [
            'functionality' => 'machines',
            'url' => 'machines',
            'label' => 'Machine',
            'plural' => 'Machines',
            'description' => 'Machines Description',
            'group' => 2,
        ],
        [
            'functionality' => 'forms',
            'url' => null,
            'label' => 'Form',
            'plural' => 'Forms',
            'description' => 'Forms Description',
            'group' => 3,
        ],
        [
            'functionality' => 'components',
            'url' => null,
            'label' => 'Component',
            'plural' => 'Components',
            'description' => 'Components Description',
            'group' => 3,
        ],
        [
            'functionality' => 'redirects',
            'url' => null,
            'label' => 'Redirect',
            'plural' => 'Redirects',
            'description' => 'Create Redirects',
            'group' => 3,
        ],

    ],

    // html tags users may apply via the cms editor
    'htmltags' => ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

    // css style classes users may apply via the cms editor
    'styles' => [
        'bold',
        'reverse',
        'light',
        'dark',
    ],

    'uploads' => [

        'disk' => 'public',
        'storage_directory' => 'media', // 'media' --> 'storage/public/media' (assuming filesystems.disks.public === storage_path('app/public'))
        'public_directory' => 'media', // 'media' --> 'https://example.com/storage/media' (assuming filesystems.disks.url === env('APP_URL').'/storage')
        'maxfilesize' => 750, // MB
        'accepted' => [

            // images
            'gif' => 'image/gif',
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
            'svg' => 'image/svg+xml',
            // "heic"  => "image/heic",
            // "heif"  => "image/heif",
            // "webp"  => "image/webp",

            //documents
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt' => 'text/plain',
            'vtt' => 'text/vtt',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls' => 'application/vnd.ms-excel',

            // video
            'mp4' => 'video/mp4',
            // "avi"   => "video/x-msvideo",
            // "3gp"   => "video/3gpp",
            // "wmv"   => "video/x-ms-wmv",
            // "mov"   => "video/quicktime",
            // "ogg"   => "video/ogg",
            // "ts"    => "video/MP2T",
            // "webm"  => "video/webm",
            // "audio" => "audio/*",

            // 3d models
            'glb' => 'model/*',

        ],

        'images' => [
            'process' => ['gif', 'jpeg', 'jpg', 'png'],
            'default_width' => 750,
            'thumb_width' => 250,
            'fpo' => 'https://picsum.photos/500',

            'featured' => [

                'default' => [
                    'width' => 1200,
                    'height' => 628,
                    'format' => 'jpg',
                ],

                'xtwitter' => [
                    'width' => 800,
                    'height' => 418,
                    'format' => 'jpg',
                ],
            ],
        ],

        'videos' => [
            'process' => ['mp4'], // ["mkv", "mp4", "mov", "asf", "ogg", "webm"]
            'width' => 1920,
            'height' => 1080,
            'poster_width' => 1920,
            'ffmpeg' => [
                'timeout' => 3600,
                'threads' => 12,
            ],

        ],

        'metas' => [

            'title' => [
                'type' => 'text',
                'format' => 'text',
                'maxlength' => '250',
            ],

            'description' => [
                'type' => 'text',
                'format' => 'text',
                'maxlength' => '1500',
            ],

            'tags' => [
                'type' => 'text',
                'format' => 'text',
                'maxlength' => '500',
            ],

            'notes' => [
                'type' => 'text',
                'format' => 'text',
                'maxlength' => '750',
            ],

        ],

        'labels' => [
            'label' => 'Media',
            'help' => 'Drop files here to upload',
        ],

    ],

    'ui' => [

        'time_format' => 'Y/m/d H:i:s',

        'defaults' => [
            'topics' => [
                'type' => 'posts',
                'title' => 'Untitled Post',
                'status' => 'draft',
            ],
        ],

        'delete' => [
            'topic' => [
                'warn' => 'Delete',
                'cancel' => 'No',
                'confirm' => 'Yes',
            ],
        ],

        'misc' => [
            'copied' => 'Copied!',
        ],

    ],

    'status' => [

        /*
            Initial Review – content from the current website being reviewed for relevance and accuracy
            Content Draft – draft of new content or updated existing content based on initial review
            Internal Review – drafted content being reviewed by internal team for feedback and approval
            Ready for Revisions – ready to revise after team feedback
            Final approval – revisions are ready for final approval
            SEO Ready – optimizing content for search engines, including keyword focus & meta description
            Design Ready – content is ready for new design
            Testing – ready to test design for responsiveness, all buttons work, UX
            Adjustments – make changes based on testing
            Pre-Launch Review – ready for final review
            Go Live

        */

        'topics' => [
            'label' => 'status',
            'menu_pixel_width' => '175',
            'values' => [
                'needs_copy' => [
                    'label' => 'Needs Copy',
                    'light' => '#e9d5ff', // slate
                    'dark' => '#9333ea',
                ],
                'development' => [
                    'label' => 'In Development',
                    'light' => '#c7d2fe', // indigo
                    'dark' => '#4f46e5',
                ],
                'draft' => [
                    'label' => 'Draft',
                    'light' => '#e5e7eb', // gray
                    'dark' => '#6b7280',
                ],
                'updated' => [
                    'label' => 'Updated',
                    'light' => '#a5f3fc', // cyan
                    'dark' => '#06b6d4',
                ],
                'review' => [
                    'label' => 'Please Review',
                    'light' => '#99f6e4', // teal
                    'dark' => '#0d9488',
                ],
                'feedback' => [
                    'label' => 'Has Feedback',
                    'light' => '#fbcfe8', // pink
                    'dark' => '#db2777',
                ],
                'copy_approved' => [
                    'label' => 'Copy Approved',
                    'light' => '#d9f99d', // lime
                    'dark' => '#65a30d',
                ],
                'layout_approved' => [
                    'label' => 'Page Approved',
                    'light' => '#bbf7d0', // green
                    'dark' => '#16a34a',
                ],
                'offline' => [
                    'label' => 'Offline',
                    'light' => '#6b7280',  // gray (intentionally reversed)
                    'dark' => '#fff',
                ],
                'live' => [ // do not change this 'live' key
                    'label' => 'Live',
                    'light' => '#22c55e', // green (intentionally reversed)
                    'dark' => '#fff',
                ],
            ],

            'slugs' => [
                'last_updated_at' => 'Updated ',
                'last_updated_by' => 'by',
            ],

        ],

    ],

    'social' => [
        'linkedin' => 'https://www.linkedin.com/company/kmm-group',
        'facebook' => 'https://www.facebook.com/KMMgrp/',
    ],

    // https://developers.google.com/search/docs/appearance/structured-data/local-business
    // https://schema.org/LocalBusiness to add additional parameters
    'schema' => [
        '@context' => 'https://schema.org',
        '@type' => 'LocalBusiness',
        'image' => [
        ],
        'name' => 'KMM Group LTD',
        'address' => [
            '@type' => 'PostalAddress',
            'streetAddress' => '2200 Byberry Road',
            'addressLocality' => 'Hatboro',
            'addressRegion' => 'PA',
            'postalCode' => '19040',
            'addressCountry' => 'US',
        ],
        'geo' => [
            '@type' => 'GeoCoordinates',
            'latitude' => 40.1613455,
            'longitude' => -75.0814859,
        ],
        'url' => 'https://kmmgrp.com',
        'telephone' => '+18884995657',
        'openingHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'opens' => '09:30',
                'closes' => '17:00',
            ],
        ],
        'sameAs' => [
            'linkedin' => 'https://www.linkedin.com/company/kmm-group',
            'facebook' => 'https://www.facebook.com/KMMgrp/',
        ],
    ],

    'seo' => [
        //  https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
        'robots' => 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        'googlebot' => 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        'googleSiteVerification' => 'general',
    ],

    'vendor' => [
        'tinymce-license-key' => 'gpl', // https://www.tiny.cloud/docs/tinymce/latest/license-key

        'apple' => [
            'webAppCapable' => 'yes',
            'webAppBarColor' => '#000',
            'formatDetection' => 'telephone=no',
        ],

    ],

];
