import Form from "../components/Form";

export default function Register() {
  // hits POST http://127.0.0.1:8000/api/user/register/
  return <Form route="/user/register/" method="register" />;
}