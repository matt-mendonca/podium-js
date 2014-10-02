# Change this to :production when ready to deploy the CSS to the live server.
#environment = :development
environment = :production

# Location of the theme's resources.
css_dir         = "public/css"
sass_dir        = "public/sass"
images_dir      = "public/images"

add_import_path "bower_components/foundation/scss"
add_import_path "bower_components/foundation-icon-fonts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = (environment == :development) ? :expanded : :compressed