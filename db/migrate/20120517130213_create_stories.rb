class CreateStories < ActiveRecord::Migration
  def change
    create_table :stories do |t|
      t.string :name
      t.string :description
      t.string :priority
      t.string :frequency

      t.timestamps
    end
  end
end
