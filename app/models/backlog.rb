class Backlog < ActiveRecord::Base
  attr_accessible :description, :name, :status, :user_id
  belongs_to :user
  has_many :stories
end
