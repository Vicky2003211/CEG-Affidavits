import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Category from "App/Models/Category";
import Form from "App/Models/Form";
import User from "App/Models/User";

export default class FormsController {
  public async getCategories() {
    const categories = await Category.all();
    return categories;
  }

  public async getStudentRequests({ request, response }: HttpContextContract) {
    const { rollNo } = request.body();
    const reqs = await Form.query().where("rollNumber", rollNo);
    if (reqs) {
      return response.json({ Requests: reqs });
    }
  }

  public async createRequest({ request, response }: HttpContextContract) {
    const { payload } = request.body();
    const req = await Form.create(payload);
    if (req) {
      return response.json({ Success: "Request received successfully" });
    }
  }

  public async getFAs({ response }: HttpContextContract) {
    const fas = await User.query().where("role", "faculty advisor");
    return response.json({ payload: fas.map((item) => item.uname) });
  }

  public async getFormsBySentTo({ response, request }: HttpContextContract) {
    const { sentTo } = request.only(["sentTo"]);
    const forms = await Form.query().where("sentTo", sentTo);
    return response.json({ forms });
  }

  public async acceptByFA({ request, response }: HttpContextContract) {
    try {
      const { form } = request.body();
      const hod = await User.query()
        .where("department", form.department.trim())
        .andWhere("role", "hod");

      await Form.query()
        .where("form_id", form.form_id)
        .update({ status: "sent to HOD", sentTo: hod[0].uname });

      return response.json({ Success: "Form accepted by FA" });
    } catch (error) {
      console.error("Error accepting form by FA:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async rejectByFA({ request, response }: HttpContextContract) {
    try {
      const { form } = request.body();

      await Form.query()
        .where("form_id", form.form_id)
        .update({ status: "Rejected", sentTo: null });

      return response.json({ Success: "Form rejected by FA" });
    } catch (error) {
      console.error("Error rejecting form by FA:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async acceptByHOD({ request, response }: HttpContextContract) {
    try {
      const { form } = request.body();
      const dean = await User.query().where("role", "dean");
      console.log(dean);
      await Form.query()
        .where("form_id", form.form_id)
        .update({ status: "sent to Dean", sentTo: dean[0].uname });

      return response.json({ Success: "Form accepted by HOD" });
    } catch (error) {
      console.error("Error accepting form by HOD:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async rejectByHOD({ request, response }: HttpContextContract) {
    try {
      const { form } = request.body();

      await Form.query()
        .where("form_id", form.form_id)
        .update({ status: "Rejected", sentTo: null });

      return response.json({ Success: "Form rejected by HOD" });
    } catch (error) {
      console.error("Error rejecting form by HOD:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
}
