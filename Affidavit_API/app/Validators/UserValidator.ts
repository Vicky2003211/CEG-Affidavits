import { schema,rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    username: schema.string({trim:true},[
      rules.minLength(5),
      rules.maxLength(30),
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'username',
      })
    ]),
    password: schema.string({},[
      rules.minLength(8),
    ]),
  })


  public messages: CustomMessages = {
    minLength: `{{field}} must be atleat {{options.minLength}} characters long`,
    maxLength: `{{field}} must not be more than {{options.maxLength}} characters long`,
  }
}
