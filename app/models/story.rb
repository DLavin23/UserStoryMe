class Story < ActiveRecord::Base
  attr_accessible :description, :frequency, :name, :priority
  belongs_to :user
  belongs_to :backlog
end
