import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uname: string;

  @column()
  public rollNo: string;

  @column()
  public department: string;

  @column()
  public course: string;

  @column()
  public password: string;

  @column()
  public role: string;
}
