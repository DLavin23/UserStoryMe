class Story < ActiveRecord::Base
  attr_accessible :description, :frequency, :name, :priority
end
