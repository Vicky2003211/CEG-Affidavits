import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public categoryId: string;

  @column()
  public categoryName: string;
}
