import Form from "../components/Form";

export default function Login() {
  // hits POST http://127.0.0.1:8000/api/token/
  return <Form route="/token/" method="login" />;
}