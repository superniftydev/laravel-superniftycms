<?php


$topics = [

    'posts' => [
        "public_url" => "blog",
        "label" => "Blog Post",
        "plural" => "Blog Posts",
        "description" => "Posts Description"
    ],

    'pages' => [
        "public_url" => "",
        "label" => "Page",
        "plural" => "Pages",
        "description" => "Pages Description"
    ],

    'team' => [
        "public_url" => "team",
        "label" => "Team Member",
        "plural" => "Team",
        "description" => "Team Description"
    ],

    'products' => [
        "public_url" => "products",
        "label" => "Product",
        "plural" => "Products",
        "description" => "Products Description"
    ],

    'machines' => [
        "public_url" => "mmachines",
        "label" => "Machine",
        "plural" => "Machines",
        "description" => "Machines Description"
    ],

    'forms' => [
        "public_url" => "",
        "label" => "Form",
        "plural" => "Forms",
        "description" => "Forms Description"
    ],

    'components' => [
        "public_url" => "",
        "label" => "Component",
        "plural" => "Components",
        "description" => "Components Description"
    ],

    'redirects' => [
        "public_url" => "",
        "label" => "Redirect",
        "plural" => "Redirects",
        "description" => "Create Redirects"
    ],

];

return [

    'topics' => $topics,
    'dashboard' => [

        "one" => [
            "posts" => $topics['posts'],
            "pages" => $topics['pages'],
        ],

        "two" => [

            "team" => $topics['team'],
            "machines" => $topics['machines'],
            "products" => $topics['products'],


        ],

        "three" => [
            "forms" => $topics['forms'],
            "components" => $topics['components'],
        ],


        "four" => [
            "redirects" => $topics['redirects'],
        ],

    ],


];
