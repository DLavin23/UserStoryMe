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
    @backlog = Backlog.find(params[:id])
  end

  def edit
  end

  def update
  end

  def destroy
    @backlog = Backlog.find(params[:id])
    @backlog.destroy
    respond_to do |format|
      format.html { redirect_to backlogs_url, notice: "As a USER, your backlog has been deleted!"}
    end
  end


end
