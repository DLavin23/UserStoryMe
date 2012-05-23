class BacklogsController < ApplicationController
  
  before_filter :authenticate_user!
  
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
    @backlog = Backlog.find(params[:id])
  end

  def update
    @backlog = Backlog.find(params[:id])
    respond_to do |format|
      if @backlog.update_attributes(params[:backlog])
        format.html { redirect_to @backlog, notice: "As a USER, your backlog has been updated!"}
      else
        format.html { render action: 'edit' }
      end
    end
  end

  def destroy
    @backlog = Backlog.find(params[:id])
    @backlog.destroy
    respond_to do |format|
      format.html { redirect_to backlogs_url, notice: "As a USER, your backlog has been deleted!"}
    end
  end


end
