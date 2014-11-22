#environment = :development
environment = :production

css_dir         = "public/css"
sass_dir        = "public/sass"
images_dir      = "public/images"

add_import_path "bower_components/foundation/scss"
add_import_path "bower_components/foundation-icon-fonts"
add_import_path "bower_components/animate-css"

output_style = (environment == :development) ? :expanded : :compressed