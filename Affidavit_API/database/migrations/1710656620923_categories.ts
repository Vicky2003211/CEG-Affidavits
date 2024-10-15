import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "categories";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("category_id").primary();
      table.string("category_name").notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
