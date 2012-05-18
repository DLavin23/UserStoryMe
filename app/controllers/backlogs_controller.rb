class BacklogsController < ApplicationController
  
  def index
    @backlogs = current_user.backlogs
  end
  
  def new
    @backlog = Backlog.new
  end
  
  def create
    @backlog = Backlog.new(params[:backlog])
    @backlog.user = current_user 
    
    respond_to do |format|
      if @backlog.save
        format.html { redirect_to @backlog, notice: "As a User, your backlog has been saved!"}
      else
        format.html { render action: "new" } 
      end
    end
  end

  def show
  end

  def edit
  end

  def update
  end

  def destroy
  end


end
