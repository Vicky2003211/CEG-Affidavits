import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "forms";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("form_id").primary();
      table.string("name").notNullable();
      table.string("roll_number").notNullable();
      table.date("dob").notNullable();
      table.enum("gender", ["Male", "Female", "Other"]).notNullable();
      table.string("contact_num");
      table.string("email").notNullable();
      table.string("address").notNullable();
      table.string("course").notNullable();
      table.string("department").notNullable();
      table.integer("semester").notNullable();
      table.string("government_scheme").defaultTo(null);
      table.string("bank_name").defaultTo(null);
      table.decimal("loan_amount", 10, 2).defaultTo(null);
      table.string("passport_no").defaultTo(null);
      table.string("boarding_country").defaultTo(null);
      table.string("purpose_of_VISA").defaultTo(null);
      table.timestamp("request_date").defaultTo(this.now()).notNullable();
      table.string("status").defaultTo("Not Started")
      table.string("category_id").notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
