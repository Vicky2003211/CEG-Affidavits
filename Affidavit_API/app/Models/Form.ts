import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Form extends BaseModel {
  @column({ isPrimary: true })
  public formId: number;

  @column()
  public name: string;

  @column()
  public rollNumber: string;

  @column.dateTime()
  public dob: DateTime;

  @column()
  public gender: "Male" | "Female" | "Other";

  @column()
  public contactNum: string | null;

  @column()
  public email: string;

  @column()
  public address: string;

  @column()
  public course: string;

  @column()
  public department: string;

  @column()
  public semester: number;

  @column()
  public governmentScheme: string | null;

  @column()
  public bankName: string | null;

  @column()
  public loanAmount: number | null;

  @column()
  public passportNo: string | null;

  @column()
  public boardingCountry: string | null;

  @column()
  public purposeOfVisa: string | null;

  @column.dateTime({ autoCreate: true })
  public requestDate: DateTime;

  @column()
  public status: string;

  @column()
  public categoryId: number;

  @column()
  public sentTo: string;

  @column()
  public father: string;

  @column()
  public mother: string;
}
