class Story < ActiveRecord::Base
  attr_accessible :description, :frequency, :name, :priority
  belongs_to :user
  belongs_to :backlog
  validates :name, :description, :priority, :presence => true
end
