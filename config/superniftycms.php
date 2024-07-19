<?php

return [

    'url' => 'cms', # the relative url to access the cms

    # settings for who has access to the cms
    'access' => [

        'policy' => 'auth', # ( *|auth|custom ) '*' = everyone | 'auth' = Auth::user()

        # ...or set policy to 'custom' and adjust below for granular access control
        'model'  => 'user',  # model to reference for access challenge
        'column' => 'role',  # model column to reference for access challenge
        'value'  => 'editor' # model column value required for access
        # if($user->role === 'editor'){ /* this person may access the cms */ }
    ],

    'topics' => [

        [
            'functionality' => 'posts',
            'public_url' => 'blog',
            'label' => 'Blog Post',
            'plural' => 'Blog Posts',
            'description' => 'Posts Description',
            'group' => 1
        ],
        [
            'functionality' => 'pages',
            'public_url' => '',
            'label' => 'Page',
            'plural' => 'Pages',
            'description' => 'Pages Description',
            'group' => 1
        ],
        [
            'functionality' => 'team',
            'public_url' => 'team',
            'label' => 'Team Member',
            'plural' => 'Team',
            'description' => 'Team Description',
            'group' => 2
        ],
        [
            'functionality' => 'products',
            'public_url' => 'products',
            'label' => 'Product',
            'plural' => 'Products',
            'description' => 'Products Description',
            'group' => 2
        ],
        [
            'functionality' => 'machines',
            'public_url' => 'machines',
            'label' => 'Machine',
            'plural' => 'Machines',
            'description' => 'Machines Description',
            'group' => 2
        ],
        [
            'functionality' => 'forms',
            'public_url' => '',
            'label' => 'Form',
            'plural' => 'Forms',
            'description' => 'Forms Description',
            'group' => 3
        ],
        [
            'functionality' => 'components',
            'public_url' => '',
            'label' => 'Component',
            'plural' => 'Components',
            'description' => 'Components Description',
            'group' => 3
        ],
        [
            'functionality' => 'redirects',
            'public_url' => '',
            'label' => 'Redirect',
            'plural' => 'Redirects',
            'description' => 'Create Redirects',
            'group' => 3
        ],

    ],

    'uploads' => [

        'disk' => 'local',
        "maxfilesize" => 750, # MB
        "accepted"  => [

            # images
            "gif"   => "image/gif",
            "heic"  => "image/heic",
            "heif"  => "image/heif",
            "jpg"   => "image/jpeg",
            "png"   => "image/png",
            "svg"   => "image/svg+xml",
            "webp"  => "image/webp",

            #documents
            "pdf"   => "application/pdf",
            "doc"   => "application/msword",
            "docx"  => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "ppt"   => "application/vnd.ms-powerpoint",
            "pptx"  => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "txt"   => "text/plain",
            "vtt"   => "text/vtt",
            "xlsx"  => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "xls"   => "application/vnd.ms-excel",

            # video
            "mp4"   => "video/mp4",
            # "avi"   => "video/x-msvideo",
            # "3gp"   => "video/3gpp",
            # "wmv"   => "video/x-ms-wmv",
            # "mov"   => "video/quicktime",
            # "ogg"   => "video/ogg",
            # "ts"    => "video/MP2T",
            # "webm"  => "video/webm",
            # "audio" => "audio/*",

            # 3d models
            "glb"   => "model/*",

        ],

        "images" => [
            "process" => [ "gif", "jpeg", "jpg", "png", "webp", "heic"],
            "thumb_width" => 250,
            "fpo" => "https://placekitten.com/500/500",
        ],

        "videos" => [
            "process" => ["mkv", "mp4", "mov", "asf", "ogg", "webm"],
            "width" => 1920,
            "height" => 1080,
            "poster_width" => 1920,
            "ffmpeg" => [
                "timeout" => 3600,
                "threads" => 12
            ],
        ],

        "meta" => [

            "label" => "Media",
            "help" => "Drop files here to upload",

            "title" => [
                "label" => "Title",
                "maxlength" => 501
            ],
            "description" => [
                "label" => "Description",
                "maxlength" => 5001
            ],
            "tags" => [
                "label" => "Tags (Comma-Separated)",
                "maxlength" => 501
            ],

        ]

    ],

    "ui" => [

        "defaults" => [
            "topics" => [
                "type" => "posts",
                "title" => "Untitled Post",
                "status" => "draft"
            ]
        ],

        "delete" => [
            "topic" => [
                "warn" => "Delete",
                "cancel" => "No",
                "confirm" => "Yes"
            ],
        ],

        "status" => [

            "topics" => [
                "label" => "status",
                "menu_pixel_width" => "175",
                "values" => [
                    "needs_copy" => [
                        "label" => "Needs Copy",
                        "light" => "#e9d5ff", # slate
                        "dark" => "#9333ea",
                    ],
                    "development" => [
                        "label" => "In Development",
                        "light" => "#c7d2fe", # indigo
                        "dark" => "#4f46e5",
                    ],
                    "draft" => [
                        "label" => "Draft",
                        "light" => "#e5e7eb", # gray
                        "dark" => "#6b7280",
                    ],
                    "updated" => [
                        "label" => "Updated",
                        "light" => "#a5f3fc", # cyan
                        "dark" => "#06b6d4",
                    ],
                    "review" => [
                        "label" => "Please Review",
                        "light" => "#99f6e4", # teal
                        "dark" => "#0d9488",
                    ],
                    "feedback" => [
                        "label" => "Has Feedback",
                        "light" => "#fbcfe8", # pink
                        "dark" => "#db2777",
                    ],
                    "copy_approved" => [
                        "label" => "Copy Approved",
                        "light" => "#d9f99d", # lime
                        "dark" => "#65a30d",
                    ],
                    "layout_approved" => [
                        "label" => "Page Approved",
                        "light" => "#bbf7d0", # green
                        "dark" => "#16a34a",
                    ],
                    "offline" => [
                        "label" => "Offline",
                        "light" => "#6b7280",  # gray (intentionally reversed)
                        "dark" => "#fff",
                    ],
                    "live" => [ # do not change this 'live' key
                        "label" => "Live",
                        "light" => "#22c55e", # green (intentionally reversed)
                        "dark" => "#fff",
                    ]
                ],
                "slugs" => [
                    "last_updated_at" => "Updated ",
                    "last_updated_by" => "by"
                ]
            ],

        ],

        "homepage_url" => "welcome",
        "errors" => [
            "url" => "oops",
            "blade_path" => "error", # OR custom/path/error
            "types" => [
                "offline" => [
                    "headline" => "Sorry!",
                    "details" => "This site is currently offline.",
                    "next" => ""
                ],
                "404" => [
                    "headline" => "Oops!",
                    "details" => "Page Not Found",
                    "next" => ""
                ],
                "generic" => [
                    "headline" => "Oops!",
                    "details" => "We were unable to find what you are looking for.",
                    "next" => ""
                ],
            ],

        ],
        "misc" => [
            "copied" => "Copied!"
        ]

    ]

];
