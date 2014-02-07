class WelcomeController < ApplicationController
	def index
    @projects = Project.all
	end
  
  def about
    
  end
end
