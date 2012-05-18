class CreateBacklogs < ActiveRecord::Migration
  def change
    create_table :backlogs do |t|
      t.integer :user_id
      t.string :name
      t.text :description
      t.string :status

      t.timestamps
    end
  end
end
