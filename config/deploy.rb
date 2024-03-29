require "rvm/capistrano"
require "bundler/capistrano"

set :application, "Anslem Galaxy"
set :repository,  "git@github.com:xanister/anslemgalaxy.git"
set :deploy_to, "/var/www/anslemgalaxy"
set :scm, :git
set :branch, "master"
set :user, "ubuntu"
set :group, "deployers"
set :use_sudo, true
set :rails_env, "development"
set :deploy_via, :copy
set :ssh_options, { :forward_agent => true, :keys => '/Users/nfrees/.ssh/nick_keypair.pem' }
set :keep_releases, 5

default_run_options[:pty] = true

server "anslemgalaxy.com", :app, :web, :db, :primary => true

namespace :deploy do
  task :start do ; end
  task :stop do ; end

  desc "Bundle install"
  task :bundle_install do
    run "cd /var/www/anslemgalaxy/current && bundle install"
  end    
  
  desc "DB Migrate"
  task :db_migrate do
    run "cd /var/www/anslemgalaxy/current && bundle exec rake db:migrate"
  end    
  
  desc "Compile assets"
  task :compile_assets do
    run "cd /var/www/anslemgalaxy/current && rake assets:precompile"
  end
  
  desc "Restart applicaiton"
  task :restart do
    run "#{ try_sudo } touch #{ File.join(current_path, 'tmp', 'restart.txt') }"
  end
end

#after "deploy", "deploy:bundle_install"
after "deploy", "deploy:db_migrate"
#after "deploy", "deploy:compile_assets"
after "deploy", "deploy:restart"
