import { supabase } from "../supabase.js";
import { toastMsg } from "../components/toast.js";
import {
  handleBackBtn,
  setButtonLoading,
} from "https://ui.scybud.com/js/ui.js";

handleBackBtn();

//Signup funtion
async function signup(firstName, lastName, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName: firstName,
        lastName: lastName,
      },
    },
  });

  if (error) {
    toastMsg(error.message, "error");
    return false;
  }

  const { data: agents, error: agentError } =
    await supabase.from("agents")
    .insert({
"first_name": firstName,
"last_name": lastName,
"email": email,
    });

    if(agentError) {
          toastMsg(agentError.message, "error");
          return false;
    }

  toastMsg("Account created successfully!", "success");
  return true;
}

//Signup form
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document
      .getElementById("password")
      .value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    if (!firstName || !lastName || !password || !email || !confirmPassword) {
      toastMsg("All fields must be filled", "error");
      return;
    } else if (!email.includes("@")) {
      toastMsg("Please enter a valid email", "error");
      return;
    } else if (password != confirmPassword) {
      toastMsg("Passwords do not match", "error");
      return;
    } else if (password.length < 6) {
      toastMsg("Password must be at least 6 characters", "error");
      return;
    }

    //disable button
    const button = signupForm.querySelector("button");
    setButtonLoading(button, true);

    try {
      const success = await signup(firstName, lastName, email, password);

      if (success) {
        // After successful login/signup:
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirect");

        if (redirectTo) {
          // Send them back to the invite page with the token
          window.location.href = decodeURIComponent(redirectTo);
        } else {
          // Default behavior
          window.location.href = "../app/dashboard";
        }
      }
    } finally {
      setButtonLoading(button, false);
    }
  });
}
