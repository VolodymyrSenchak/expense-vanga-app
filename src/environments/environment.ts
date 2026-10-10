/**
 * `googleClientId` is the *Web application* OAuth client ID from the Google Cloud
 * console. The same client ID must be listed in Supabase under
 * Authentication > Providers > Google ("Authorized Client IDs"), and
 * http://localhost:4200 must be an authorized JavaScript origin of that client.
 * It is a public value, so it is safe to keep it in the bundle.
 */
export const environment = {
  apiUrl: "https://expense-vanga-api.vercel.app/api",
  //apiUrl: "http://localhost:8080/api",
  googleClientId: "591545200081-ua6ecmdrge4n8v1v1ob8v3mer74ngnkv.apps.googleusercontent.com",
};

