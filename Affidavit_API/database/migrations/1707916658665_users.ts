import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("uname").notNullable();
      table.string("roll_no").notNullable();
      table.string("department").notNullable();
      table.string("course").notNullable();
      table.integer("semester").notNullable();
      table.string("password").notNullable();
      table.string("role").notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
