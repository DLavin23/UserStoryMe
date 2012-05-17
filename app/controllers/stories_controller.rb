class StoriesController < ApplicationController
  
  before_filter :authenticate_user!
  
  def index
    @stories = Story.all
  end

  def show
    @story = Story.find(params[:id])
  end

  def new
    @story = Story.new
  end

  def create
    @story = Story.new(params[:story])
    respond_to do |format|
      if @story.save
        format.html { redirect_to @story, notice: "As a USER, your story has been created!"}
      else
        format.html { render action: "new" }
      end
    end
  end

  def update
    @story = Story.find(params[:id])
    respond_to do |format|
      if @story.update_attributes(params[:story])
        format.html { redirect_to @story, notice: "As a USER, your story has been updated!" }
      else
        format.html { render action: "edit" }
      end
    end
  end

  def edit
    @story = Story.find(params[:id])
  end

  def destroy
    @story = Story.find(params[:id])
    @story.destroy
    respond_to do |format|
      format.html { redirect_to stories_url}
    end
  end
end
