require "bundler/capistrano"

set :application, "Anslem Galaxy"
set :repository,  "git@github.com:xanister/anslemgalaxy.git"
set :deploy_to, "/var/www/anslemgalaxy"
set :scm, :git
set :branch, "master"
set :user, "ubuntu"
set :group, "deployers"
set :use_sudo, false
set :rails_env, "production"
set :deploy_via, :copy
set :ssh_options, { :forward_agent => true, :keys => '/Users/nfrees/.ssh/nick_keypair.pem' }
set :keep_releases, 5

default_run_options[:pty] = true

server "54.84.60.91", :app, :web, :db, :primary => true

namespace :deploy do
  task :start do ; end
  task :stop do ; end

  desc "Restart applicaiton"
  task :restart do
    run "#{ try_sudo } touch #{ File.join(current_path, 'tmp', 'restart.txt') }"
  end
end

after "deploy", "deploy:restart"
